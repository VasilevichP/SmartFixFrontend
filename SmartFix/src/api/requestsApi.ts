import api from '../api/axios';
export interface CreateRequestCommand {
    deviceTypeId: string;
    deviceModelId?: string | null;
    deviceModelName: string;
    serviceId?: string | null;
    description: string;
    deviceSerialNumber: string;
    contactEmail: string;
    contactName: string;
    contactPhoneNumber: string;
    photos?: File[];
}

export interface RequestDto {
    id: string;
    clientName: string;
    serviceName: string;
    deviceModelName: string;
    createdAt: string;
    specialistName: string;
    status: number;
    statusName: string;
}

export interface RequestsFilterParams {
    searchTerm?: string;
    status?: number; // Enum: 0=New, 1=Diagnostics, etc.
    sortOrder?: string;
}

export const requestsApi = {
    async createRequest(token: string, data: CreateRequestCommand) {
        const formData = new FormData();

        // Добавляем простые поля
        formData.append('deviceTypeId', data.deviceTypeId);
        formData.append('deviceModelName', data.deviceModelName);
        formData.append('description', data.description);

        if (data.deviceModelId) formData.append('deviceModelId', data.deviceModelId);
        if (data.serviceId) formData.append('serviceId', data.serviceId);
        if (data.deviceSerialNumber) formData.append('deviceSerialNumber', data.deviceSerialNumber);

        if (data.contactEmail) formData.append('contactEmail', data.contactEmail);
        if (data.contactName) formData.append('contactName', data.contactName);
        if (data.contactPhoneNumber) formData.append('contactPhoneNumber', data.contactPhoneNumber);

        // Добавляем файлы (важно: имя параметра 'Photos' должно совпадать с бэкендом)
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((file) => {
                formData.append('Photos', file);
            });
        }

        // Axios сам выставит правильный Content-Type с boundary
        return api.post('/Requests', formData, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            }
        });
    },

    async getAllRequestsForManager(token: string, filterParams: RequestsFilterParams) {
        const response = await api.get('/Requests/manager-list', {
            params: filterParams,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

};