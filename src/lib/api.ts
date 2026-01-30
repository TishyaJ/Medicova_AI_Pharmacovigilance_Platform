import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Direct connection to FastAPI backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    signup: async (userData: {
        phone_number: string;
        role: string;
        full_name: string;
        email: string;
        password_hash: string;
        profile_data?: any;
    }) => {
        const response = await api.post('/api/auth/signup', userData);
        return response.data;
    },

    login: async (credentials: { email: string; password_hash: string }) => {
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    },
};

// Cases API
export const casesAPI = {
    getUserCases: async (userId: number) => {
        const response = await api.get(`/api/cases/user/${userId}`);
        return response.data;
    },

    createCase: async (caseData: {
        medicine_name: string;
        symptoms: string;
        user_id: number;
    }) => {
        const response = await api.post('/api/cases/', caseData);
        return response.data;
    },

    updateCaseStatus: async (caseId: number, status: string) => {
        const response = await api.put(`/api/cases/${caseId}`, { status });
        return response.data;
    },
};

// User stats API (derived from cases)
export const statsAPI = {
    getUserStats: async (userId: number) => {
        const cases = await casesAPI.getUserCases(userId);

        const activeCases = cases.filter((c: any) => c.status !== 'reviewed').length;
        const totalReports = cases.length;
        const pendingReviews = cases.filter((c: any) => c.status === 'pending').length;
        const criticalCases = cases.filter((c: any) => c.severity_score > 0.7).length;

        return {
            activeCases,
            totalReports,
            pendingReviews,
            healthScore: criticalCases === 0 ? 'Good' : criticalCases < 2 ? 'Fair' : 'Needs Attention'
        };
    },
};

export default api;
