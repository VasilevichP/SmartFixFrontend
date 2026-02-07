import api from '../api/axios';


export interface DeviceModel {
    id: string;
    name: string;
}
export interface DeviceModelDetails {
    id: string;
    name: string;
    manufacturerId: string;
    manufacturerName: string;
    deviceTypeId: string;
    deviceTypeName: string;
}
export interface UpdateDeviceModel {
    id: string;
    name: string;
    manufacturerId: string;
    deviceTypeId: string;
}
export interface CreateDeviceModel {
    name: string;
    manufacturerId: string;
    deviceTypeId: string;
}
export interface DeleteDeviceModel {
    id: string;
}
export const deviceModelsApi = {

    async getDeviceModelsByTypeAndManufacturer(token: string, deviceTypeId?: string, manufacturerId?: string) {
        const params: any = {};
        if (deviceTypeId) params.deviceTypeId = deviceTypeId;
        if (manufacturerId) params.manufacturerId = manufacturerId;
        const response = await api.get('/DeviceModels', {
            params,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async getDeviceModels(token: string) {
        const response = await api.get('/DeviceModels', {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async CreateDeviceModel(token: string, data: CreateDeviceModel) {
        const response = await api.post('/DeviceModels', data,{
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async UpdateDeviceModel(token: string, data: UpdateDeviceModel) {
        const response = await api.put('/DeviceModels', data, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async DeleteDeviceModels(token: string,data: DeleteDeviceModel) {
        const response = await api.delete('/DeviceModels', {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data
        });
        return response.data;
    },
};