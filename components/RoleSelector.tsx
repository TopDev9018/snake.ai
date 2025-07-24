'use client'

import { useState } from 'react'
import { UserRole, ROLE_INFO } from '@/types/roles'

interface RoleSelectorProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  userWallet: string
}

export const RoleSelector = ({ currentRole, onRoleChange, userWallet }: RoleSelectorProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = async (role: UserRole) => {
    if (role === currentRole) return
    
    setIsLoading(true)
    try {
      // TODO: Implement smart contract interaction to change role
      // For now, we'll just update the local state
      setSelectedRole(role)
      onRoleChange(role)
    } catch (error) {
      console.error('Error changing role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Current Role: <span className={`px-2 py-1 rounded ${ROLE_INFO[currentRole].color}`}>
          {ROLE_INFO[currentRole].name}
        </span>
      </div>
      
      {Object.entries(ROLE_INFO).map(([role, info]) => (
        <div 
          key={role}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            selectedRole === role 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
          onClick={() => handleRoleSelect(role as UserRole)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${info.color}`}>
              {info.name}
            </h3>
            {selectedRole === role && (
              <span className="text-primary text-sm">Selected</span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {info.description}
          </p>
          
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Benefits:
              </span>
              <ul className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                {info.benefits.map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Lock Period:
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                {info.lockPeriod}
              </span>
            </div>
            
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Requirements:
              </span>
              <ul className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                {info.requirements.map((req, index) => (
                  <li key={index}>• {req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
