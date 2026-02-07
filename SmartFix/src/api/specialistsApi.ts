import api from '../api/axios';


export interface Specialist{
    id: string;
    name: string;
}
export interface CreateSpecialist {
    name: string;
}
export interface DeleteSpecialist {
    id: string;
}
export const specialistsApi = {

    async getAllSpecialists(token: string) {
        const response = await api.get('/Specialists',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async CreateSpecialist(token: string, data: CreateSpecialist) {
        const response = await api.post('/Specialists',data,  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async UpdateSpecialist(token: string, data:Specialist) {
        const response = await api.put('/Specialists',data,  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async DeleteSpecialist(token: string, data: DeleteSpecialist) {
        const response = await api.delete('/Specialists',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data
        });
        return response.data;
    },
};