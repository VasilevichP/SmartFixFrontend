import api from './axios';

export const TYPE_NUMBER_MAP: Record<number, string> = {
    0: '%',
    1: 'Фикс. сумма'
};

export const CATEGORY_NUMBER_MAP: Record<number, string> = {
    1: 'По кол-ву заявок',
    2: 'По дню недели',
    3: 'По сумме заявки'
};

export interface DiscountDto {
    id: string;
    name: string;
    category: number;
    type: number;
    isActive: boolean;
}

export interface DiscountDetailsDto {
    id: string;
    name: string;
    category: number;
    conditionValue: string;
    type: number;
    value: number;
    priority: number;
    isActive: boolean;
}

export interface CreateDiscountCommand {
    name: string;
    category: number; // 1 - ByCount, 2 - ByDay, 3 - BySum
    conditionValue: string;
    type: number;
    value: number;
    priority: number;
}

export interface UpdateDiscountCommand{
    id: string;
    name: string;
    conditionValue: string;
    type: number;
    value: number;
    priority: number;
}

// --- ИНТЕРФЕЙСЫ ПРОМОКОДОВ ---
export interface PromoCodeDto {
    id: string;
    code: string;
    expirationDate: string;
    isActive: boolean;
    isValid: boolean;
}
export interface PromoCodeDetailsDto {
    id: string;
    code: string;
    type: string;
    value: number;
    expirationDate: string;
    usageLimit: number;
    isActive: boolean;
    isValid: boolean;
}

export interface CreatePromoCodeCommand {
    code: string;
    type: number;
    value: number;
    expirationDate: string;
    usageLimit: number;
}

export interface UpdatePromoCodeCommand extends CreatePromoCodeCommand {
    id: string;
}

export const loyaltyProgramsApi = {
    // --- Скидки ---
    async getAllDiscounts(token: string): Promise<DiscountDto[]> {
        const response = await api.get('/Discounts/getAll', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
    async getDiscountById(token: string, id: string): Promise<DiscountDetailsDto> {
        const response = await api.get(`/Discounts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
    async createDiscount(token: string, data: CreateDiscountCommand) {
        return api.post('/Discounts/create', data, { headers: { Authorization: `Bearer ${token}` } });
    },
    async updateDiscount(token: string, data: UpdateDiscountCommand) {
        return api.put('/Discounts/edit', data, { headers: { Authorization: `Bearer ${token}` } });
    },
    async deactivateDiscount(token: string, id: string) {
        return api.patch(`/Discounts/change_status`, {id}, { headers: { Authorization: `Bearer ${token}` } });
    },

    // --- Промокоды ---
    async getAllPromoCodes(token: string): Promise<PromoCodeDto[]> {
        const response = await api.get('/PromoCodes/getAll', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
    async getPromoCodeById(token: string, id: string): Promise<PromoCodeDetailsDto> {
        const response = await api.get(`/PromoCodes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
    async createPromoCode(token: string, data: CreatePromoCodeCommand) {
        return api.post('/PromoCodes/create', data, { headers: { Authorization: `Bearer ${token}` } });
    },
    async updatePromoCode(token: string, data: UpdatePromoCodeCommand) {
        return api.put('/PromoCodes/edit', data, { headers: { Authorization: `Bearer ${token}` } });
    },
    async deactivatePromoCode(token: string, id: string) {
        return api.patch(`/PromoCodes/change_status`, {id}, { headers: { Authorization: `Bearer ${token}` } });
    }
};