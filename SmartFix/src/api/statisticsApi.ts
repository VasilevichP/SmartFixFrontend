import api from '../api/axios';
export interface GeneralStatsDto {
    newRequestsCount: number;
    closedRequestsCount: number;
    averageRating: number;
    avgRepairTimeHours: number;
    requestsDynamics: { date: string; value: number }[];
    statusDistribution: { label: string; value: number }[];
}

export interface ServicesStatsDto {
    totalRevenue: number;
    revenueByDeviceType: { label: string; value: number }[];
    topServices: { label: string; value: number }[];
}

export interface SpecialistsStatsDto {
    performance: {
        name: string;
        closedCount: number;
        inProgressCount: number;
        avgRepairTime: number
    }[];
}

export interface ClientsStatsDto {
    totalClients: number;
    returningClientsCount: number;
}

export const statisticsApi = {
    // Добавляем аргументы from и to
    async getGeneralStatistics(token: string, period: string, from?: string, to?: string) {
        const response = await api.get('/Statistics/general', {
            params: {
                period,
                from,
                to
            },
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    async getServicesStatistics(token: string, period: string, from?: string, to?: string) {
        const response = await api.get('/Statistics/services', {
            params: {
                period,
                from,
                to
            },
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    async getClientsStatistics(token: string, period: string, from?: string, to?: string) {
        const response = await api.get('/Statistics/clients', {
            params: {
                period,
                from,
                to
            },
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    async getSpecialistsStatistics(token: string, period: string, from?: string, to?: string) {
        const response = await api.get('/Statistics/specialists', {
            params: {
                period,
                from,
                to
            },
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    }
};