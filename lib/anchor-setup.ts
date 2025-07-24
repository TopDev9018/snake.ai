import { PublicKey } from '@solana/web3.js'
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

// Import the IDL type (you'll need to generate this)
// For now, we'll use a basic type structure
interface SnakeContract {
  // Add IDL methods here
  [key: string]: any
}

const PROGRAM_ID = new PublicKey('GkRRA3Jhds6sxDr89wMneCjNDDmHof2zqnHdjaqP7kGU')

export const getProvider = (
  connection: Connection,
  wallet: WalletContextState
) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  return new AnchorProvider(
    connection,
    wallet as any,
    AnchorProvider.defaultOptions()
  )
}

export const getProgram = (provider: AnchorProvider) => {
  // You'll need to import the actual IDL here
  // For now, returning a mock program structure
  return {
    programId: PROGRAM_ID,
    provider,
    methods: {
      initializeUserClaim: () => ({
        accounts: (accounts: any) => ({
          signers: (signers: any) => ({
            rpc: async () => 'mock-signature'
          })
        })
      }),
      selectRole: (role: any) => ({
        accounts: (accounts: any) => ({
          signers: (signers: any) => ({
            rpc: async () => 'mock-signature'
          })
        })
      }),
      claimTokensWithRole: (amount: BN, role: any) => ({
        accounts: (accounts: any) => ({
          signers: (signers: any) => ({
            rpc: async () => 'mock-signature'
          })
        })
      })
    },
    account: {
      userClaim: {
        fetch: async (publicKey: PublicKey) => ({
          user: publicKey,
          initialized: true,
          role: { none: {} },
          totalMinedPhase1: new BN(0),
          totalMinedPhase2: new BN(0),
          patronStatus: { none: {} }
        })
      }
    }
  }
}

// PDA derivation helpers
export const getUserClaimPDA = (userPublicKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_claim'), userPublicKey.toBuffer()],
    PROGRAM_ID
  )
}

export const getRewardPoolPDA = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('reward_pool')],
    PROGRAM_ID
  )
}

export const getVestingPDA = (userPublicKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vesting'), userPublicKey.toBuffer()],
    PROGRAM_ID
  )
}
