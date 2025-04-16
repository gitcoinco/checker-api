import { createLogger } from '@/logger';
import { type Request, type Response } from 'express';
import { validationResult } from 'express-validator';
import { type Hex, keccak256, recoverMessageAddress, toHex } from 'viem';
import { indexerClient } from './ext/indexer';
import { env } from './env';
import stringify from 'json-stringify-deterministic';

const logger = createLogger();

export const catchError = async <T>(
  promise: Promise<T>
): Promise<[Error | undefined, T | undefined]> => {
  try {
    const data = await promise;
    return [undefined, data];
  } catch (error) {
    logger.error(`catchError: Error occurred: ${error.message}`, {
      stack: error.stack,
    });
    return [error as Error, undefined];
  }
};

export const validateRequest = (req: Request, res: Response): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation failed', { errors: errors.array() });
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
};

export const addressFrom = (index: number): string => {
  const address = index.toString(16).padStart(40, '0');
  return `0x${address}`;
};

export async function deterministicKeccakHash<T>(obj: T): Promise<Hex> {
  const deterministicString = stringify(obj);
  return keccak256(toHex(deterministicString));
}

export async function recoverSignerAddress<T>(
  obj: T,
  signature: Hex
): Promise<Hex> {
  return await recoverMessageAddress({
    message: { raw: await deterministicKeccakHash(obj) },
    signature,
  });
}

export async function isPoolManager<T>(
  obj: T,
  signature: Hex,
  chainId: number,
  alloPoolId: string
): Promise<boolean> {
  const validAddresses = await indexerClient.getRoundManager({
    chainId,
    alloPoolId,
  });
  if (env.NODE_ENV === 'development' && signature === '0xdeadbeef') {
    logger.info('Skipping signature check in development mode');
    return true;
  }
  try {
    const address = await recoverSignerAddress(obj, signature);
    logger.info(`Recovered address: ${address}`);
    return validAddresses.some(
      addr => addr.toLowerCase() === address.toLowerCase()
    );
  } catch {
    logger.warn('Failed to recover signer address');
    return false;
  }
}

function extractAndParseJSON(s: string, pattern: RegExp): any[] {
  const matches = s.match(pattern) ?? [];

  const parsedMatches = matches
    .map(match => {
      try {
        return JSON.parse(match as string);
      } catch (e) {
        console.error('Failed to parse JSON:', match);
        return null;
      }
    })
    .filter(parsed => parsed !== null);

  if (parsedMatches.length === 0) {
    throw new Error('No valid JSON found');
  }

  return parsedMatches;
}

export function parseObject(s: string): object {
  const jsonObjPattern = /\{(?:[^{}]*|(?:\{(?:[^{}]*|(?:\{[^{}]*\}))*\}))*\}/g;
  const parsedObjects = extractAndParseJSON(s, jsonObjPattern);
  return parsedObjects[0];
}

export function parseArray(s: string): any[] {
  const jsonArrayPattern = /\[[^[\]]*\]/g;
  const parsedArrays = extractAndParseJSON(s, jsonArrayPattern);
  return parsedArrays[0];
}
