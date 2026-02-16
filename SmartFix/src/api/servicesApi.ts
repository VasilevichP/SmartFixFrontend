import api from '../api/axios';
import type {ReviewDto} from "./reviewsApi.ts";

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

export interface ServiceForClient {
    id: string;
    name: string;
    categoryName: string;
    deviceTypeId: string;
    deviceTypeName: string;
    deviceModelId?: string;
    deviceModelName?: string;
    manufacturerId?: string;
    manufacturerName?: string;
    price: number;
    averageRating: number;
}

export interface ServicesManagerFilterParams {
    searchTerm?: string;
    status?: boolean;
    categoryId?: string;
    deviceTypeId?: string;
    manufacturerId?: string;
    deviceModelId?: string;
    sortOrder?: string;
}

export interface ServicesClientFilterParams {
    searchTerm?: string;
    categoryId?: string;
    deviceTypeId?: string;
    manufacturerId?: string;
    deviceModelId?: string;
    sortOrder?: string;
}

export interface CreateServiceCommand {
    name: string;
    description?: string;
    price: number;
    warrantyPeriod?: number;
    categoryId: string;
    deviceTypeId: string;
    manufacturerId?: string;
    deviceModelId?: string;
}

export interface ServiceDetailsDto {
    id: string;
    name: string;
    description: string;
    price: number;
    warrantyPeriod?: number;
    isAvailable: boolean;

    categoryId: string;
    categoryName: string;

    deviceTypeId: string;
    deviceTypeName: string;

    manufacturerId?: string;
    manufacturerName?: string;

    deviceModelId?: string;
    deviceModelName?: string;

    averageRating: number;
    reviews: ReviewDto[];
}

// Команда обновления (должна совпадать с UpdateServiceCommand на бэке)
export interface UpdateServiceCommand {
    id: string;
    name: string;
    description: string;
    price: number;
    warrantyPeriod: number;
    isAvailable: boolean;
    categoryId: string;
    deviceTypeId: string;
    manufacturerId?: string
    deviceModelId?: string;
}
export interface DeleteServiceCommand {
    id: string;
}

export const servicesApi = {

    async getAllServicesForManager(token: string, filterParams: ServicesManagerFilterParams) {
        const response = await api.get('/Services/manager-list', {
            params: filterParams,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    async getAllServicesForClient(token: string, filterParams: ServicesClientFilterParams) {
        const response = await api.get('/Services/client-list', {
            params: filterParams,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(response.data);
        return response.data;
    },

    async getServiceById(token: string, id: string) {
        const response = await api.get(`/Services/${id}`, {
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
    },
    async updateService(token: string, data: UpdateServiceCommand) {
        return api.put('/Services', data, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    async deleteService(token: string, data: DeleteServiceCommand) {
        return api.delete('/Services', {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data
        });
    }
};