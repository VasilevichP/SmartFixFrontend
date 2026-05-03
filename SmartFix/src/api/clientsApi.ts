import api from './axios';

export const CLIENT_STATUS_NUMBER_MAP: Record<number, string> = {
    0: 'Новый',
    1: 'Повторный',
    2: 'VIP'
};

export interface UserProfile {
    id: string;
    email: string;
    phone: string;
    name: string;
}
export interface ClientBriefDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: number;
}
export interface ClientProfileDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    personalDiscount: number;
    status: number;
}
export interface CreateClientCommand {
    name: string;
    email: string;
    phone: string;
    personalDiscount: number;
}

export interface UpdateClientCommand extends CreateClientCommand {
    id: string;
    status: number;
}

export interface ClientsFilterParams {
    nameSearch?: string;
    phoneSearch?: string;
    status?: number;
    sortOrder?: string;
}

export const clientsApi = {
    async getAllClients(token: string, params?: ClientsFilterParams): Promise<ClientBriefDto[]> {
        const response = await api.get('/Clients/getAll', {
            params: params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getClientById(token: string, id: string): Promise<ClientProfileDto> {
        const response = await api.get(`/Clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async createClient(token: string, data: CreateClientCommand) {
        return api.post('/Clients/create', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    async updateClientByManager(token: string, data: UpdateClientCommand) {
        return api.put('/Clients/updateByManager', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    async getClientProfile(token: string) {
        const response = await api.get('/Clients',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async updateClient(token: string, name: string, email: string, phone:string) {
        const response = await api.put('/Clients/updateByClient', {email, name, phone}, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

};