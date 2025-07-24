export type UserRole = 'none' | 'staker' | 'patron'

export interface RoleInfo {
  name: string
  description: string
  benefits: string[]
  requirements: string[]
  lockPeriod: string
  color: string
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  none: {
    name: 'Normal User',
    description: 'Basic access to the platform',
    benefits: ['Token claiming', 'Basic platform access'],
    requirements: ['None'],
    lockPeriod: 'No lock',
    color: 'bg-gray-100 text-gray-800'
  },
  staker: {
    name: 'Staker',
    description: 'Stake your tokens for enhanced rewards',
    benefits: ['5% staking rewards', 'Priority support', 'Early access to features'],
    requirements: ['Minimum mining activity', 'Token commitment'],
    lockPeriod: '3 months',
    color: 'bg-blue-100 text-blue-800'
  },
  patron: {
    name: 'Patron',
    description: 'Elite status with governance rights',
    benefits: ['10% enhanced rewards', 'Governance voting', 'DAO participation', 'Exclusive features'],
    requirements: ['90+ day wallet age', 'High community score', 'Significant mining history'],
    lockPeriod: '6 months',
    color: 'bg-purple-100 text-purple-800'
  }
}
