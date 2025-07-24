import { PublicKey, SystemProgram } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { getProvider, getProgram, getUserClaimPDA, getRewardPoolPDA } from './anchor-setup'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { UserRole } from '@/types/roles'

export interface UserClaim {
  user: PublicKey
  initialized: boolean
  role: UserRole
  totalMinedPhase1: BN
  totalMinedPhase2: BN
  patronStatus: 'none' | 'applied' | 'approved' | 'rejected'
  lockDurationMonths: number
  lockedAmount: BN
  patronQualificationScore: number
  walletAgeDays: number
  communityScore: number
}

export class SmartContractService {
  private connection: Connection
  private wallet: WalletContextState

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection
    this.wallet = wallet
  }

  async initializeUserClaim(): Promise<string> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    const provider = getProvider(this.connection, this.wallet)
    const program = getProgram(provider)
    const [userClaimPDA] = getUserClaimPDA(this.wallet.publicKey)

    const tx = await program.methods
      .initializeUserClaim()
      .accounts({
        user: this.wallet.publicKey,
        userClaim: userClaimPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()

    return tx
  }

  async getUserClaim(): Promise<UserClaim | null> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    const provider = getProvider(this.connection, this.wallet)
    const program = getProgram(provider)
    const [userClaimPDA] = getUserClaimPDA(this.wallet.publicKey)

    try {
      const userClaim = await program.account.userClaim.fetch(userClaimPDA)
      
      // Convert the raw data to our UserClaim interface
      return {
        user: userClaim.user,
        initialized: userClaim.initialized,
        role: this.parseRole(userClaim.role),
        totalMinedPhase1: userClaim.totalMinedPhase1,
        totalMinedPhase2: userClaim.totalMinedPhase2,
        patronStatus: this.parsePatronStatus(userClaim.patronStatus),
        lockDurationMonths: (userClaim as any).lockDurationMonths || 0,
        lockedAmount: (userClaim as any).lockedAmount || new BN(0),
        patronQualificationScore: (userClaim as any).patronQualificationScore || 0,
        walletAgeDays: (userClaim as any).walletAgeDays || 0,
        communityScore: (userClaim as any).communityScore || 0
      }
    } catch (error) {
      console.error('Error fetching user claim:', error)
      return null
    }
  }

  async selectRole(role: UserRole): Promise<string> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    const provider = getProvider(this.connection, this.wallet)
    const program = getProgram(provider)
    const [userClaimPDA] = getUserClaimPDA(this.wallet.publicKey)

    const roleData = this.formatRole(role)

    const tx = await program.methods
      .selectRole(roleData)
      .accounts({
        user: this.wallet.publicKey,
        userClaim: userClaimPDA,
      })
      .signers([])
      .rpc()

    return tx
  }

  async claimTokensWithRole(amount: number, role: UserRole): Promise<string> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    const provider = getProvider(this.connection, this.wallet)
    const program = getProgram(provider)
    const [userClaimPDA] = getUserClaimPDA(this.wallet.publicKey)
    const [rewardPoolPDA] = getRewardPoolPDA()

    const roleData = this.formatRole(role)
    const amountBN = new BN(amount * 10**9) // Convert to token units

    const tx = await program.methods
      .claimTokensWithRole(amountBN, roleData)
      .accounts({
        user: this.wallet.publicKey,
        userClaim: userClaimPDA,
        rewardPool: rewardPoolPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()

    return tx
  }

  async applyForPatron(walletAgeDays: number, communityScore: number): Promise<string> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    const provider = getProvider(this.connection, this.wallet)
    const program = getProgram(provider)
    const [userClaimPDA] = getUserClaimPDA(this.wallet.publicKey)

    // For now, we'll use the selectRole method to apply for patron status
    // This is a simplified approach until the full patron application flow is implemented
    const tx = await program.methods
      .selectRole({ patron: {} })
      .accounts({
        user: this.wallet.publicKey,
        userClaim: userClaimPDA,
      })
      .signers([])
      .rpc()

    return tx
  }

  private parseRole(role: any): UserRole {
    if (role.staker) return 'staker'
    if (role.patron) return 'patron'
    return 'none'
  }

  private parsePatronStatus(status: any): 'none' | 'applied' | 'approved' | 'rejected' {
    if (status.applied) return 'applied'
    if (status.approved) return 'approved'
    if (status.rejected) return 'rejected'
    return 'none'
  }

  private formatRole(role: UserRole) {
    switch (role) {
      case 'staker':
        return { staker: {} }
      case 'patron':
        return { patron: {} }
      default:
        return { none: {} }
    }
  }
}
