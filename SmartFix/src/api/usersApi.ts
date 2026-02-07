import api from '../api/axios';


export interface UserProfile {
    id: string;
    email: string;
    phone: string;
    name: string;
}
export const usersApi = {

    async getUserProfile(token: string) {
        const response = await api.get('/Users',  {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};