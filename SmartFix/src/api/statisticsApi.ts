import api from '../api/axios';
export interface RequestsStatsDto {
    totalRequests: number;
    closedRequests: number;
    cancelledRequests: number;
    totalRevenue: number;
    averageCheck: number;
    averageRepairTimeHours: number;
    requestsByDay: Record<string, number>;
    requestsByStatus: Record<string, number>;
    requestsByType: Record<string, number>;
    requestsByDeviceType: Record<string, number>;
}

export interface ClientsStatsDto {
    newClientsCount: number;
    returningClientRequestsCount: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
}

export interface MastersStatsDto {
    activeMastersCount: number;
    topMasterName: string;
    averageDiagnosticTimeHours: number;
    revenueByMaster: Record<string, number>;
    rejectionRateByMaster: Record<string, number>;
}

// --- МЕТОДЫ API ---

export const statisticsApi = {
    async getRequestsStats(token: string, period: string, from?: string, to?: string): Promise<RequestsStatsDto> {
        const response = await api.get('/Statistics/requests', {
            params: { period, from, to },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getClientsStats(token: string, period: string, from?: string, to?: string): Promise<ClientsStatsDto> {
        const response = await api.get('/Statistics/clients', {
            params: { period, from, to },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getMastersStats(token: string, period: string, from?: string, to?: string): Promise<MastersStatsDto> {
        const response = await api.get('/Statistics/masters', {
            params: { period, from, to },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async downloadReportPdf(token: string, period: string, from?: string, to?: string): Promise<void> {
        const response = await api.get('/Statistics/report', {
            params: { period, from, to },
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
        });

        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileUrl = URL.createObjectURL(file);

        window.open(fileUrl, '_blank');

        setTimeout(() => {
            URL.revokeObjectURL(fileUrl);
        }, 1000);
    }
};