import api from '../api/axios';

export interface CreateRequestCommand {
    type: number; // 0 - В сервисе, 1 - Выездной
    deviceTypeId: string;
    deviceModelId?: string | null;
    deviceModelName: string;
    description: string;
    deviceSerialNumber: string;

    contactEmail: string;
    contactName: string;
    contactPhoneNumber: string;

    fieldAddress?: string | null;
    scheduledTime?: string | null;
    parentRequestId?: string | null;
    promoCodeText?: string | null;
    serviceIds?: string[];
    photos?: File[];
}

export interface CreateRequestByManagerCommand {
    clientId?: string | null;
    contactName: string;
    contactEmail: string;
    contactPhone: string;

    type: number;
    deviceTypeId?: string | null;
    deviceModelId?: string | null;
    deviceModelName?: string | null;
    description: string;
    serialNumber?: string | null;
    deviceAppearance: string | null;
    devicePackage: string | null;

    fieldAddress?: string | null;
    scheduledTime?: string | null;
    parentRequestId?: string | null;

    customServices: { name: string, price: number }[];
    serviceIds: string[];
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
    deviceModelName: string;
    createdAt: string;
    status: number;
}

export interface ClientRequestForSelectDto {
    id: string;
    deviceModelName: string;
    closedAt: string;
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
    type: number;
    status: number;
    description: string;
    diagnosticResult: string | null;
    deviceAppearance: string | null;
    devicePackage: string | null;
    cancellationReason: string | null;

    basePrice: number;
    finalPrice: number;

    createdAt: string;
    closedAt: string | null;

    deviceTypeId: string;
    deviceTypeName: string;
    deviceModelId: string | null;
    deviceModelName: string;
    deviceSerialNumber: string;

    clientId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;

    fieldAddress: string | null;
    scheduledTime: string | null;
    parentRequestId: string | null;

    masterId: string | null;
    masterName: string | null;

    hasReview: boolean;
    reviewRating?: number;
    reviewComment?: string;

    photoPaths: string[];
    services: { id: string, serviceId: string | null, serviceName: string, price: number }[];
    appliedDiscounts: { id: string, name: string, savedAmount: number }[];
    statusHistories: { status: number, date: string }[];
}

// Маппинг статусов (число -> текст/класс)
export const STATUS_NUMBER_MAP: Record<number, { label: string; class: string }> = {
    0: {label: 'Новая', class: 'status-new'},
    1: {label: 'Принята', class: 'status-accepted'},
    2: {label: 'На диагностике', class: 'status-diagnostics'},
    3: {label: 'В работе', class: 'status-in-progress'},
    4: {label: 'На согласовании', class: 'status-pending'},
    5: {label: 'Готова', class: 'status-ready'},
    6: {label: 'Закрыта', class: 'status-closed'},
    7: {label: 'Отменена', class: 'status-cancelled'}
};
export const STATUS_NAME_MAP: Record<string, { label: string; class: string }> = {
    'New': {label: 'Новая', class: 'status-new'},
    'Accepted': {label: 'Принята', class: 'status-accepted'},
    'Pending': {label: 'На согласовании', class: 'status-pending'},
    'Diagnostics': {label: 'На диагностике', class: 'status-diagnostics'},
    'InProgress': {label: 'В работе', class: 'status-in-progress'},
    'Ready': {label: 'Готова', class: 'status-ready'},
    'Closed': {label: 'Закрыта', class: 'status-closed'},
    'Cancelled': {label: 'Отменена', class: 'status-cancelled'}
};
export const requestsApi = {
    async createRequest(token: string, data: CreateRequestCommand) {
        const formData = new FormData();

        formData.append('type', data.type.toString());
        formData.append('deviceTypeId', data.deviceTypeId);
        formData.append('deviceModelName', data.deviceModelName);
        formData.append('description', data.description);

        if (data.deviceModelId) formData.append('deviceModelId', data.deviceModelId);
        if (data.deviceSerialNumber) formData.append('serialNumber', data.deviceSerialNumber);

        if (data.contactEmail) formData.append('contactEmail', data.contactEmail);
        if (data.contactName) formData.append('contactName', data.contactName);
        if (data.contactPhoneNumber) formData.append('contactPhone', data.contactPhoneNumber);

        // Логистика
        if (data.type === 1) {
            if (data.fieldAddress) formData.append('fieldAddress', data.fieldAddress);
            if (data.scheduledTime) formData.append('scheduledTime', data.scheduledTime);
        } else if(data.type === 2){
            if (data.scheduledTime) formData.append('scheduledTime', data.scheduledTime);
        }

        if (data.promoCodeText) formData.append('promoCodeCode', data.promoCodeText);
        if (data.serviceIds && data.serviceIds.length > 0) {
            data.serviceIds.forEach(id => formData.append('serviceIds', id));
        }

        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((file) => {
                formData.append('Photos', file);
            });
        }

        return api.post('/Requests/create', formData, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            }
        });
    },

    async createRequestByManager(token: string, data: CreateRequestByManagerCommand) {
        console.log(data);
        return api.post('/Requests/createByManager', data, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    async getAllRequestsForManager(token: string, filterParams: RequestsFilterParams) {
        const response = await api.get('/Requests/allRequestsForManager', {
            params: filterParams,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    async getClientRequests(token: string) {
        const response = await api.get('/Requests/clientRequestsForClient', {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    async getClientRequestsForManager(token: string, clientId: string) {
        const response = await api.get('/Requests/clientRequestsForManager', {
            params:{clientId},
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    },

    async getClosedClientRequests(token: string, clientId: string) {
        const response = await api.get('/Requests/closedClientRequests', {
            params:{clientId},
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
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

    async assignMaster(token: string, id: string, masterId: string,) {
        return api.patch(`/Requests/master`, {requestId: id, masterId}, {
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

    async cancel(token: string, id: string, reason: string) {
        return api.patch(`/Requests/cancel`, {id, reason}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async addService(token: string, id: string, serviceId?: string, serviceName?: string, servicePrice?: number) {
        return api.patch(`/Requests/addService`, {requestId: id, serviceId, serviceName, servicePrice}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async removeService(token: string, id: string, serviceId: string) {
        return api.patch(`/Requests/removeService`, {requestId: id, serviceId}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },
    async updateServices(token: string, id: string, services: { serviceId: string | null, name: string, price: number }[]) {
        return api.patch(`/Requests/services`, { requestId: id, services: services }, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    async updateAcceptance(token: string, id: string, appearance: string, devicePackage: string) {
        return api.patch(`/Requests/acceptance`, {id, appearance, package: devicePackage}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async updateDeviceInfo(token: string, id: string, deviceTypeId: string, deviceModelName: string, deviceSerialNumber: string, deviceModelId?: string) {
        return api.patch(`/Requests/deviceInfo`, {
            id,
            deviceTypeId,
            deviceModelId,
            deviceModelName,
            deviceSerialNumber
        }, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },
    async updateFieldRequestInfo(token: string, id: string, fieldAddress: string, scheduledTime: string) {
        return api.patch(`/Requests/fieldRequestInfo`, {
            id,
            fieldAddress,
            scheduledTime
        }, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },
    async updateContactInfo(token: string, id: string, contactEmail: string, contactName: string, contactPhone: string) {
        return api.patch(`/Requests/contactInfo`, {
            id,
            contactEmail,
            contactName,
            contactPhone
        }, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async updateDiagnosticsResult(token: string, id: string, result: string) {
        return api.patch(`/Requests/diagnosticsResult`, {id, result}, {
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
        });
    },

    async approveRequest(token: string, id: string) {
        return api.patch(`/Requests/approve`, {id}, { headers: { Authorization: `Bearer ${token}` } });
    },

    async rejectRequest(token: string, id: string) {
        return api.patch(`/Requests/reject`, {id}, { headers: { Authorization: `Bearer ${token}` } });
    },

    async leaveReview(token: string, requestId: string, rating: number, comment: string) {
        return api.post(`/Requests/leaveReview`, { requestId, rating, comment }, { headers: { Authorization: `Bearer ${token}` } });
    }
};