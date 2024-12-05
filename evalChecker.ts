import axios from 'axios';

// Define types for the human and AI evaluation queries' responses
interface HumanEvaluationApplication {
  id: string;
  status: string;
}

interface HumanEvaluationResponse {
  round: {
    applications: HumanEvaluationApplication[];
  };
}

interface AIEvaluation {
  evaluationStatus: string;
}

interface AIEvaluationApplication {
  alloApplicationId: string;
  evaluations: AIEvaluation[];
}

interface AIEvaluationResponse {
  applications: AIEvaluationApplication[];
}

// Define types for the results we are comparing
interface MatchingApplication {
  id: string;
  humanStatus: string;
  aiStatus: string;
}

interface NonMatchingApplication {
  id: string;
  humanStatus: string;
  aiStatus: string;
}

interface UncertainApplication {
  id: string;
  humanStatus: string;
  aiStatus: string;
}

// Function to make a GraphQL request and return the response data
async function fetchGraphQL<T>(endpoint: string, query: string): Promise<T> {
  const response = await axios.post(endpoint, { query });
  return response.data.data;
}

// Function to compare human and AI evaluations for a specific pool
async function compareEvaluations(
  chainId: number,
  poolId: string
): Promise<void> {
  try {
    // URLs of the two GraphQL servers
    const humanEvalServer =
      'https://grants-stack-indexer-v2.gitcoin.co/graphql';
    const aiEvalServer = 'https://api.checker.gitcoin.co/graphql';

    // Define GraphQL queries dynamically based on chainId and poolId
    const humanEvaluationQuery = `
      query MyQuery {
        round(chainId: ${chainId}, id: "${poolId}") {
          applications {
            id
            status
          }
        }
      }
    `;

    const aiEvaluationQuery = `
      query MyQuery {
        applications(filter: {pool: {alloPoolId: {equalTo: "${poolId}"}}}) {
          alloApplicationId
          evaluations {
            evaluationStatus
          }
        }
      }
    `;

    // Fetch data from both servers
    const humanData = await fetchGraphQL<HumanEvaluationResponse>(
      humanEvalServer,
      humanEvaluationQuery
    );
    const aiData = await fetchGraphQL<AIEvaluationResponse>(
      aiEvalServer,
      aiEvaluationQuery
    );

    // Extract the relevant application data
    const humanApplications = humanData.round.applications;
    const aiApplications = aiData.applications;

    // Initialize lists for matching, non-matching, and uncertain results
    const uncertainApplications: UncertainApplication[] = [];
    const matchingApplications: MatchingApplication[] = [];
    const nonMatchingApplications: NonMatchingApplication[] = [];

    // Compare human applications with AI applications
    humanApplications.forEach(humanApp => {
      const aiApp = aiApplications.find(
        aiApp => aiApp.alloApplicationId === humanApp.id
      );

      if (aiApp !== undefined && aiApp.evaluations.length > 0) {
        const aiStatus = aiApp.evaluations[0].evaluationStatus;

        if (aiStatus === humanApp.status) {
          // If AI evaluation exists and status matches humanApp.status, push to matching list
          matchingApplications.push({
            id: humanApp.id,
            humanStatus: humanApp.status,
            aiStatus,
          });
        } else if (aiStatus === 'UNCERTAIN') {
          // If AI evaluation status is uncertain, push to uncertain list
          uncertainApplications.push({
            id: humanApp.id,
            humanStatus: humanApp.status,
            aiStatus,
          });
        } else {
          // If evaluation exists but status does not match, push to non-matching list
          nonMatchingApplications.push({
            id: humanApp.id,
            humanStatus: humanApp.status,
            aiStatus,
          });
        }
      } else {
        // If no evaluation exists, push to non-matching list
        nonMatchingApplications.push({
          id: humanApp.id,
          humanStatus: humanApp.status,
          aiStatus: 'No Evaluation',
        });
      }
    });

    // Print the results for the current pool
    console.log(`Results for Pool ${poolId} (Chain ID: ${chainId}):`);
    console.log(
      `Matching Applications: ${matchingApplications.length}/${humanApplications.length}`
    );
    matchingApplications.forEach(app => {
      console.log(
        `ID: ${app.id}, Human Status: ${app.humanStatus}, AI Status: ${app.aiStatus}`
      );
    });
    console.log(
      `Uncertain Applications: ${uncertainApplications.length}/${humanApplications.length}`
    );
    uncertainApplications.forEach(app => {
      console.log(
        `ID: ${app.id}, Human Status: ${app.humanStatus}, AI Status: ${app.aiStatus}`
      );
    });
    console.log(
      `Non-Matching Applications: ${nonMatchingApplications.length}/${humanApplications.length}`
    );
    nonMatchingApplications.forEach(app => {
      console.log(
        `ID: ${app.id}, Human Status: ${app.humanStatus}, AI Status: ${app.aiStatus}`
      );
    });
    console.log('\n\n\n---\n\n\n');
  } catch (error) {
    console.error('Error fetching data from servers:', error);
    throw new Error('Failed to compare evaluations');
  }
}

// Iterate through an array of pool and chainId pairs
const poolsToCheck = [
  { chainId: 42161, poolId: '608' },
  { chainId: 42161, poolId: '609' },
  { chainId: 42161, poolId: '610' },
  { chainId: 42161, poolId: '611' },

  // Add more pools as needed
];

void (async () => {
  for (const { chainId, poolId } of poolsToCheck) {
    await compareEvaluations(chainId, poolId);
  }
})();
