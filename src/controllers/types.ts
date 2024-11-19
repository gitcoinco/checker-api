import { type Hex } from 'viem';

export interface PoolIdChainIdApplicationId {
  alloPoolId: string;
  chainId: number;
  alloApplicationId: string;
}

export interface PoolIdChainIdApplicationIdBody
  extends PoolIdChainIdApplicationId {
  signature: Hex;
}
