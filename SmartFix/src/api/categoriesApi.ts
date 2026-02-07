import api from '../api/axios';


export interface Category {
    id: string;
    name: string;
}
export interface CreateCategory {
    name: string;
}
export interface DeleteCategory {
    id: string;
}
export const categoriesApi = {

    async getAllServiceCategories(token: string) {
        const response = await api.get('/ServiceCategories',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async CreateServiceCategory(token: string,data: CreateCategory) {
        const response = await api.post('/ServiceCategories', data, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async UpdateServiceCategory(token: string, data: Category) {
        const response = await api.put('/ServiceCategories', data,  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
    async deleteServiceCategory(token: string, data: DeleteCategory) {
        const response = await api.delete('/ServiceCategories',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data
        });
        return response.data;
    }
};