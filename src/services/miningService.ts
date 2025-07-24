// Mining Service for Tweet Mining Operations
import * as apiService from '../pages/patron/services/apiService';

const { tokenApi, userApi } = apiService;

export interface MiningJob {
  id: string;
  status: 'active' | 'paused' | 'stopped';
  searchQuery: string;
  startTime: Date;
  endTime?: Date;
  tweetsFound: number;
  tokensEarned: number;
}

export interface TweetSearchParams {
  query: string;
  hashtags?: string[];
  mentions?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MiningStats {
  totalTweets: number;
  totalTokens: number;
  activeJobs: number;
  lastMiningTime?: Date;
}

class MiningService {
  private currentJob: MiningJob | null = null;

  // Start a new mining job
  async startMining(params: TweetSearchParams): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Validate input
      if (!params.query.trim()) {
        return { success: false, error: 'Search query is required' };
      }

      // Stop any existing job
      if (this.currentJob && this.currentJob.status === 'active') {
        await this.stopMining();
      }

      // Create new mining job
      const newJob: MiningJob = {
        id: `job_${Date.now()}`,
        status: 'active',
        searchQuery: params.query,
        startTime: new Date(),
        tweetsFound: 0,
        tokensEarned: 0
      };

      this.currentJob = newJob;

      // In a real implementation, this would start the backend mining process
      console.log('Started mining job:', newJob);

      // Simulate mining process
      this.simulateMining();

      return { success: true, jobId: newJob.id };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start mining' 
      };
    }
  }

  // Pause current mining job
  pauseMining(): boolean {
    if (this.currentJob && this.currentJob.status === 'active') {
      this.currentJob.status = 'paused';
      console.log('Mining paused');
      return true;
    }
    return false;
  }

  // Resume paused mining job
  resumeMining(): boolean {
    if (this.currentJob && this.currentJob.status === 'paused') {
      this.currentJob.status = 'active';
      console.log('Mining resumed');
      this.simulateMining();
      return true;
    }
    return false;
  }

  // Stop current mining job
  async stopMining(): Promise<boolean> {
    if (this.currentJob) {
      this.currentJob.status = 'stopped';
      this.currentJob.endTime = new Date();
      console.log('Mining stopped:', this.currentJob);
      
      // Save job results (in real implementation, save to backend)
      localStorage.setItem('lastMiningJob', JSON.stringify(this.currentJob));
      
      this.currentJob = null;
      return true;
    }
    return false;
  }

  // Get current mining job status
  getCurrentJob(): MiningJob | null {
    return this.currentJob;
  }

  // Search for tweets matching criteria
  async searchTweets(params: TweetSearchParams): Promise<{ success: boolean; tweets?: any[]; error?: string }> {
    try {
      // In real implementation, this would call the backend search API
      console.log('Searching tweets with params:', params);

      // For now, use the existing tweets API
      const response = await userApi.getTweets(0, 20);
      
      if (response.success) {
        // Filter tweets based on search query (simple implementation)
        const filteredTweets = response.data?.filter(tweet => 
          tweet.content?.toLowerCase().includes(params.query.toLowerCase()) ||
          params.hashtags?.some(tag => tweet.content?.includes(tag)) ||
          params.mentions?.some(mention => tweet.content?.includes(mention))
        ) || [];

        return { success: true, tweets: filteredTweets };
      } else {
        return { success: false, error: response.error || 'Search failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Search error' 
      };
    }
  }

  // Get mining statistics
  async getMiningStats(): Promise<{ success: boolean; stats?: MiningStats; error?: string }> {
    try {
      // Get mining status from API
      const miningResponse = await tokenApi.getMiningStatus();
      const tweetsResponse = await userApi.getTweets(0, 1000); // Get all tweets for count
      
      if (miningResponse.success && miningResponse.data) {
        const stats: MiningStats = {
          totalTweets: (miningResponse.data.phase1_tweet_count || 0) + (miningResponse.data.phase2_tweet_count || 0),
          totalTokens: (miningResponse.data.total_phase1_mined || 0) + (miningResponse.data.total_phase2_mined || 0),
          activeJobs: this.currentJob && this.currentJob.status === 'active' ? 1 : 0,
          lastMiningTime: (tweetsResponse.data && tweetsResponse.data.length > 0) ? 
            new Date(tweetsResponse.data[0].created_at) : undefined
        };

        return { success: true, stats };
      } else {
        return { success: false, error: miningResponse.error || 'Failed to get stats' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Stats error' 
      };
    }
  }

  // Simulate mining process (for demo purposes)
  private simulateMining() {
    if (!this.currentJob || this.currentJob.status !== 'active') return;

    // Simulate finding tweets periodically
    const interval = setInterval(() => {
      if (!this.currentJob || this.currentJob.status !== 'active') {
        clearInterval(interval);
        return;
      }

      // Simulate finding a tweet
      if (Math.random() > 0.7) { // 30% chance each interval
        this.currentJob.tweetsFound++;
        this.currentJob.tokensEarned += Math.floor(Math.random() * 100) + 50; // 50-150 tokens
        console.log(`Found tweet! Total: ${this.currentJob.tweetsFound}, Tokens: ${this.currentJob.tokensEarned}`);
      }
    }, 5000); // Check every 5 seconds

    // Stop simulation after 2 minutes (for demo)
    setTimeout(() => {
      clearInterval(interval);
      if (this.currentJob && this.currentJob.status === 'active') {
        console.log('Mining simulation completed');
      }
    }, 120000);
  }

  // Validate search query
  validateSearchQuery(query: string): { valid: boolean; error?: string } {
    if (!query.trim()) {
      return { valid: false, error: 'Search query cannot be empty' };
    }

    if (query.length < 3) {
      return { valid: false, error: 'Search query must be at least 3 characters' };
    }

    if (query.length > 280) {
      return { valid: false, error: 'Search query too long (max 280 characters)' };
    }

    return { valid: true };
  }

  // Get recommended search queries
  getRecommendedQueries(): string[] {
    return [
      '#MineTheSnake',
      '@playSnakeAI #MineTheSnake',
      'SnakeAI mining',
      '#CryptoMining #SnakeAI',
      'Web3 gaming #SnakeAI'
    ];
  }
}

// Export singleton instance
export const miningService = new MiningService();
export default miningService;
