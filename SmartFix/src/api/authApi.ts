import api from '../api/axios';

export const authApi = {
    async register(userData: any) {
        const response = await api.post('/Auth/register', userData);
        console.log(response);
        return response.data;
    },

    async login(command: any) {
        const response = await api.post('/Auth/authorize', command);
        return response.data;
    }
};