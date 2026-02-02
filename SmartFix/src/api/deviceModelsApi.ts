import api from '../api/axios';


export interface DeviceModel {
    id: string;
    name: string;
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
    }
};