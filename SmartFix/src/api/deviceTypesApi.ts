import api from '../api/axios';


export interface DeviceType {
    id: string;
    name: string;
}
export interface CreateDeviceType {
    name: string;
}
export interface DeleteDeviceType {
    id: string;
}
export const deviceTypesApi = {

    async getAllDeviceTypes(token: string) {
        const response = await api.get('/DeviceTypes',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async CreateDeviceType(token: string, data: CreateDeviceType) {
        const response = await api.post('/DeviceTypes', data,  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async UpdateDeviceType(token: string, data: DeviceType) {
        const response = await api.put('/DeviceTypes', data, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async DeleteDeviceType(token: string, data: DeleteDeviceType) {
        const response = await api.delete('/DeviceTypes',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data
        });
        return response.data;
    },
};