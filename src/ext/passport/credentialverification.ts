import { PassportVerifier } from '@gitcoin/gs-passport-verifier';
import type {
  VerifiableCredential,
  ProjectApplicationForManager,
  ProjectApplicationMetadata,
} from './types';

export const IAM_SERVER =
  'did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC';

const verifier = new PassportVerifier();

export async function isVerified(
  application: Partial<ProjectApplicationForManager> | undefined
): Promise<{
  twitter: { isVerified: boolean };
  github: { isVerified: boolean };
}> {
  const applicationMetadata = application?.metadata;

  const verifyCredential = async (
    provider: 'twitter' | 'github'
  ): Promise<boolean> => {
    const verifiableCredential =
      applicationMetadata?.application.project.credentials[provider];
    if (verifiableCredential === undefined) {
      return false;
    }

    // console.log('verifiableCredential', verifiableCredential);
    // console.log('issuer', verifiableCredential.issuer);

    const verifiedCredential =
      await verifier.verifyCredentialAndExpiry(verifiableCredential);

    const vcHasValidProof = verifiedCredential?.valid;

    const vcIssuedByValidIAMServer = verifiableCredential.issuer === IAM_SERVER;
    const providerMatchesProject = vcProviderMatchesProject(
      provider,
      verifiableCredential,
      applicationMetadata
    );

    const roleAddresses = application?.canonicalProject?.roles.map(
      role => role.address
    );
    const vcIssuedToAtLeastOneProjectOwner = (roleAddresses ?? []).some(role =>
      vcIssuedToAddress(verifiableCredential, role.toLowerCase())
    );

    // todo: why is vcHasValidProof always false?
    console.log(
      `isVerified: ${vcHasValidProof} : ${vcIssuedByValidIAMServer} : ${providerMatchesProject} : ${vcIssuedToAtLeastOneProjectOwner}`
    );

    return (
      vcHasValidProof &&
      vcIssuedByValidIAMServer &&
      providerMatchesProject &&
      vcIssuedToAtLeastOneProjectOwner
    );
  };

  const [twitterVerified, githubVerified] = await Promise.all([
    verifyCredential('twitter'),
    verifyCredential('github'),
  ]);

  return {
    twitter: { isVerified: twitterVerified },
    github: { isVerified: githubVerified },
  };
}

function vcIssuedToAddress(vc: VerifiableCredential, address: string): boolean {
  const vcIdSplit = vc.credentialSubject.id.split(':');
  const addressFromId = vcIdSplit[vcIdSplit.length - 1];
  return addressFromId.toLowerCase() === address.toLowerCase();
}

function vcProviderMatchesProject(
  provider: string,
  verifiableCredential: VerifiableCredential,
  applicationMetadata: ProjectApplicationMetadata | undefined
): boolean {
  let vcProviderMatchesProject = false;
  if (provider === 'twitter') {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split('#')[1]
        .toLowerCase() ===
      applicationMetadata?.application.project?.projectTwitter?.toLowerCase();
  } else if (provider === 'github') {
    vcProviderMatchesProject =
      verifiableCredential.credentialSubject.provider
        ?.split('#')[1]
        .toLowerCase() ===
      applicationMetadata?.application.project?.projectGithub?.toLowerCase();
  }
  return vcProviderMatchesProject;
}
