import api from '../api/axios';

export interface CreateRequestCommand {
    deviceTypeId: string;
    deviceModelId?: string | null;
    deviceModelName: string;
    serviceId?: string | null;
    price?: number | null;
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

export interface ClientRequestDto {
    id: string;
    serviceName: string;
    createdAt: string;
    status: number; // Enum (число)
    statusName: string; // Строка (если бэк возвращает, иначе маппим на фронте)
}


export interface RequestsFilterParams {
    client?: string;
    device?: string;
    service?: string;
    status?: number;
    sortOrder?: string;
}

export interface RequestDetailsDto {
    id: string;
    status: number; // Enum
    statusName: string;
    description: string;
    deviceSerialNumber: string;
    createdAt: string;
    closedAt: string | null;

    // Устройство
    deviceType: string;
    deviceModel: string;

    // Клиент
    clientId: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;

    // Услуга и Цена
    serviceName: string;
    price: number | null; // Цена может быть не установлена

    // Исполнитель
    specialistId: string | null;
    specialistName: string | null;

    // Списки
    photoPaths: string[]; // Пути к фото
    history: { status: string; date: string }[];
}

// Маппинг статусов (число -> текст/класс)
export const STATUS_NUMBER_MAP: Record<number, { label: string; class: string }> = {
    0: {label: 'Новая', class: 'status-new'},
    1: {label: 'На диагностике', class: 'status-diagnostics'},
    2: {label: 'В работе', class: 'status-in-progress'},
    3: {label: 'Готова', class: 'status-ready'},
    4: {label: 'Закрыта', class: 'status-closed'},
    5: {label: 'Отменена', class: 'status-cancelled'}
};
export const STATUS_NAME_MAP: Record<string, { label: string; class: string }> = {
    'New': {label: 'Новая', class: 'status-new'},
    'Diagnostics': {label: 'На диагностике', class: 'status-diagnostics'},
    'InProgress': {label: 'В работе', class: 'status-in-progress'},
    'Ready': {label: 'Готова', class: 'status-ready'},
    'Closed': {label: 'Закрыта', class: 'status-closed'},
    'Cancelled': {label: 'Отменена', class: 'status-cancelled'}
};

export const getStatusRussianName = (status: string | number): string => {
    // Если приходит число (Enum)
    const mapNumeric: Record<number, string> = {
        0: 'Новая', 1: 'Диагностика', 2: 'В работе',
        3: 'Готова', 4: 'Закрыта', 5: 'Отменена'
    };
    // Если приходит строка (String Enum)
    const mapString: Record<string, string> = {
        'New': 'Новая', 'Diagnostics': 'Диагностика', 'InProgress': 'В работе',
        'Ready': 'Готова', 'Closed': 'Закрыта', 'Cancelled': 'Отменена'
    };

    if (typeof status === 'number') return mapNumeric[status] || 'Неизвестно';
    return mapString[status] || status;
};

export const requestsApi = {
    async createRequest(token: string, data: CreateRequestCommand) {
        const formData = new FormData();

        // Добавляем простые поля
        formData.append('deviceTypeId', data.deviceTypeId);
        formData.append('deviceModelName', data.deviceModelName);
        formData.append('description', data.description);
        if (data.price) formData.append('price', data.price.toString());

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

    async getClientRequests(token: string) {
        const response = await api.get('/Requests/client_list', {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getById(token: string, id: string) {
        const response = await api.get(`/Requests/${id}`, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    },

    async assignSpecialist(token: string, id: string, specialistId: string,) {
        return api.patch(`/Requests/specialist`, {requestId: id, specialistId}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async updateStatus(token: string, id: string, status: number,) {
        return api.patch(`/Requests/status`, {requestId: id, newStatus: status}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async assignPrice(token: string, id: string, price: number,) {
        return api.patch(`/Requests/price`, {requestId: id, price}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    }

};