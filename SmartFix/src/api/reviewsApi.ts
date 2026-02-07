import api from '../api/axios';


export interface ReviewDto {
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateReviewCommand {
    serviceId: string;
    rating: number;
    comment: string;
}

export const reviewsApi = {
    async createReview(token:string, command: CreateReviewCommand) {
        // ID клиента берется из токена на бэкенде
        return api.post('/Reviews', command, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    }
};