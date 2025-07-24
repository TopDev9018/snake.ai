// Snake AI Smart Contract Configuration
import { PublicKey } from '@solana/web3.js';

// Program ID from your deployed contract
export const PROGRAM_ID = new PublicKey(
  process.env.REACT_APP_PROGRAM_ID || 'GkRRA3Jhds6sxDr89wMneCjNDDmHof2zqnHdjaqP7kGU'
);

// Token Mint Address (will be set after token creation)
export const TOKEN_MINT = new PublicKey(
  process.env.REACT_APP_TOKEN_MINT || 'EdfpKd5MLAfAgTHCkzSEW1QvmksVxM2GmkookjCZxXZV'
);

// Solana Network Configuration
export const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// Program Seeds (from your smart contract)
export const REWARD_POOL_SEED = 'reward_pool';
export const USER_CLAIM_SEED = 'user_claim';

console.log('🐍 Snake AI Configuration Loaded:');
console.log('  Program ID:', PROGRAM_ID.toString());
console.log('  Token Mint:', TOKEN_MINT.toString());
console.log('  Network:', SOLANA_NETWORK);
console.log('  RPC URL:', SOLANA_RPC_URL);
