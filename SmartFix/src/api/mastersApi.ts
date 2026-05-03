import api from './axios';

export interface MasterDto {
    id: string;
    name: string;
    phoneNumber: string;
}

export interface MasterDetailsDto {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    activeRequestsCount: number;
}
export interface MasterForSelectDto {
    id: string;
    name: string;
    activeRequestsCount: number;
}
export interface CreateMasterCommand {
    name: string;
    email: string;
    phoneNumber: string;
}

export interface UpdateMasterCommand {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

export interface MastersFilterParams {
    nameSearch?: string;
    phoneSearch?: string;
}

export const mastersApi = {
    async getAllMasters(token: string, params?: MastersFilterParams): Promise<MasterDto[]> {
        const response = await api.get('/Masters/getAll', {
            params: params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    async getAllMastersForSelect(token: string, params?: MastersFilterParams): Promise<MasterForSelectDto[]> {
        const response = await api.get('/Masters/getAllForSelect', {
            params: params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getMasterById(token: string, id: string): Promise<MasterDetailsDto> {
        const response = await api.get(`/Masters/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async createMaster(token: string, data: CreateMasterCommand) {
        return api.post('/Masters/create', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    async updateMaster(token: string, data: UpdateMasterCommand) {
        return api.put('/Masters/edit', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    async deleteMaster(token: string, id: string) {
        return api.patch(`/Masters/delete`, {id}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};