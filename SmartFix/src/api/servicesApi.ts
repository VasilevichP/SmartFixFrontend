import api from '../api/axios';

export interface Service {
    id: string;
    name: string;
    categoryName: string;
    deviceTypeName: string;
    deviceModelName?: string;
    manufacturerName?: string;
    price: number;
    isAvailable: boolean;
}
export interface ServicesFilterParams {
    searchTerm?: string;
    status?: boolean;
    categoryId?: string;
    deviceTypeId?: string;
    manufacturerId?: string;
    deviceModelId?: string;
    sortOrder?: string;
}

export interface CreateServiceCommand {
    name: string;
    description: string;
    price: number;
    warrantyPeriod: number;
    categoryId: string;
    deviceTypeId: string;
    manufacturerId?: string;
    deviceModelId?: string;
}

export const servicesApi = {

    async getAllServicesForManager(token: string, filterParams: ServicesFilterParams) {
        const response = await api.get('/Services/manager-list', {
            params: filterParams,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    async createService(token: string, data: CreateServiceCommand) {
        return api.post('/Services', data, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
};