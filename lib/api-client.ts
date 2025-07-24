interface MiningStatus {
    phase1_mining_count: number;
    phase2_mining_count: number;
    total_mining_count: number;
    current_phase: 'Phase1' | 'Phase2';
    phase2_start_date: string;
    wallet_address?: string;
}

interface UserProfile {
    id: string;
    username: string;
    wallet_address?: string;
    patron_status?: 'none' | 'applied' | 'approved' | 'rejected';
    selected_role?: 'none' | 'staker' | 'patron';
    lock_duration_months?: number;
    locked_amount?: number;
    patron_qualification_score?: number;
    wallet_age_days?: number;
    community_score?: number;
    created_at: string;
    updated_at: string;
}

interface ApiResponse<T> {
    data: T;
    error?: string;
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                data: {} as T,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async getMiningStatus(userId: string): Promise<ApiResponse<MiningStatus>> {
        return this.request<MiningStatus>(`/api/user/${userId}/mining_status`);
    }

    async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
        return this.request<UserProfile>(`/api/user/${userId}`);
    }

    async setWalletAddress(userId: string, walletAddress: string): Promise<ApiResponse<{ success: boolean }>> {
        return this.request<{ success: boolean }>(`/api/user/${userId}/wallet`, {
            method: 'POST',
            body: JSON.stringify({ wallet_address: walletAddress }),
        });
    }

    async updatePatronStatus(
        userId: string,
        status: 'applied' | 'approved' | 'rejected'
    ): Promise<ApiResponse<{ success: boolean }>> {
        return this.request<{ success: boolean }>(`/api/user/${userId}/patron_status`, {
            method: 'POST',
            body: JSON.stringify({ patron_status: status }),
        });
    }

    async updateUserRole(
        userId: string,
        role: 'none' | 'staker' | 'patron'
    ): Promise<ApiResponse<{ success: boolean }>> {
        return this.request<{ success: boolean }>(`/api/user/${userId}/role`, {
            method: 'POST',
            body: JSON.stringify({ selected_role: role }),
        });
    }

    async updateLockDetails(
        userId: string,
        lockDurationMonths: number,
        lockedAmount: number
    ): Promise<ApiResponse<{ success: boolean }>> {
        return this.request<{ success: boolean }>(`/api/user/${userId}/lock_details`, {
            method: 'POST',
            body: JSON.stringify({
                lock_duration_months: lockDurationMonths,
                locked_amount: lockedAmount
            }),
        });
    }

    async getPhase2Tweets(userId: string): Promise<ApiResponse<any[]>> {
        return this.request<any[]>(`/api/user/${userId}/phase2_tweets`);
    }
}

export const apiClient = new ApiClient();
