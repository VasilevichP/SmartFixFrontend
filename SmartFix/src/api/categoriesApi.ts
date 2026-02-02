import api from '../api/axios';


export interface Category {
    id: string;
    name: string;
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
    }
};