'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PatronFrameworkService } from '@/lib/patron-framework-service'

interface PatronApplicationFormProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const PatronApplicationForm = ({ userId, onSuccess, onCancel }: PatronApplicationFormProps) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    walletAgeDays: '',
    communityScore: '',
    commitment: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connection || !wallet || !userId) {
      setError('Wallet not connected')
      return
    }

    const walletAgeDays = parseInt(formData.walletAgeDays)
    const communityScore = parseInt(formData.communityScore)

    if (isNaN(walletAgeDays) || isNaN(communityScore)) {
      setError('Please enter valid numbers for wallet age and community score')
      return
    }

    if (walletAgeDays < 90) {
      setError('Wallet must be at least 90 days old to apply for Patron status')
      return
    }

    if (communityScore < 50) {
      setError('Community score must be at least 50 to apply for Patron status')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const patronFrameworkService = new PatronFrameworkService(connection, wallet, userId)
      const result = await patronFrameworkService.applyForPatronWithSync(walletAgeDays, communityScore)

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || 'Failed to submit patron application')
      }
    } catch (err) {
      setError('Failed to submit patron application')
      console.error('Error submitting patron application:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Apply for Patron Status
      </h2>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Patron status provides enhanced rewards and governance privileges. Applications are reviewed based on wallet age, community engagement, and commitment level.
      </p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="walletAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wallet Age (days) *
          </label>
          <input
            type="number"
            id="walletAge"
            value={formData.walletAgeDays}
            onChange={(e) => handleInputChange('walletAgeDays', e.target.value)}
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            placeholder="Number of days since wallet creation"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 90 days required
          </p>
        </div>

        <div>
          <label htmlFor="communityScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Community Score *
          </label>
          <input
            type="number"
            id="communityScore"
            value={formData.communityScore}
            onChange={(e) => handleInputChange('communityScore', e.target.value)}
            min="0"
            max="100"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            placeholder="Your community engagement score (0-100)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 50 points required
          </p>
        </div>

        <div>
          <label htmlFor="commitment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Commitment Statement
          </label>
          <textarea
            id="commitment"
            value={formData.commitment}
            onChange={(e) => handleInputChange('commitment', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            placeholder="Describe your commitment to the Snake AI community and platform (optional)"
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Patron Requirements:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Wallet age: minimum 90 days</li>
            <li>• Community score: minimum 50 points</li>
            <li>• Active participation in platform activities</li>
            <li>• Commitment to long-term engagement</li>
          </ul>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Application'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
