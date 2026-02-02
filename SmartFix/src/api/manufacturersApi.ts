import api from '../api/axios';


export interface Manufacturer {
    id: string;
    name: string;
}
export const manufacturersApi = {

    async getAllManufacturers(token: string) {
        const response = await api.get('/Manufacturers',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
};