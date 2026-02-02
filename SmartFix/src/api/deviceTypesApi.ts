import api from '../api/axios';


export interface DeviceType {
    id: string;
    name: string;
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
    }
};