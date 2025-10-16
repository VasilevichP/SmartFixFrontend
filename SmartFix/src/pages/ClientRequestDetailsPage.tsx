import React from 'react';
import '../styles/ClientRequestDetails.css';
import ClientHeader from "../components/ClientHeader.tsx";

// Определяем структуру данных для детальной заявки
interface ServiceRequestDetails {
    id: string;
    status: 'Новая' | 'В работе' | 'На диагностике' | 'Ожидание запчастей' | 'Готова' | 'Закрыта' | 'Отменена';
    description: string;
    deviceSerialNumber: string;
    createdAt: string;
    estimatedCompletionAt?: string; // Предполагаемая дата завершения
    deviceType: string;
    deviceModel: string;
    serviceName: string;
    specialistName: string | null;
}

// Определяем структуру для события в истории
interface RequestHistoryEvent {
    id: number;
    timestamp: string;
    description: string;
}

// "Заглушка" с данными для текущей заявки
const mockRequest: ServiceRequestDetails = {
    id: 'SF-1024',
    status: 'На диагностике',
    description: 'Ноутбук сильно греется и шумит при работе с документами. Вероятно, требуется чистка системы охлаждения и замена термопасты.',
    deviceSerialNumber: 'SN-987XYZ654',
    createdAt: '26.10.2025 10:30',
    estimatedCompletionAt: '27.10.2025',
    deviceType: 'Ноутбук',
    deviceModel: 'Lenovo ThinkPad X1',
    serviceName: 'Диагностика ноутбука',
    specialistName: 'Сидоров А.В.',
};

// Функция-помощник для стилизации статусов
const getStatusClassName = (status: ServiceRequestDetails['status']) => {
    const classMap = {
        'Новая': 'status-new', 'В работе': 'status-in-progress', 'На диагностике': 'status-diagnostics',
        'Ожидание запчастей': 'status-waiting', 'Готова': 'status-ready', 'Закрыта': 'status-closed',
        'Отменена': 'status-cancelled'
    };
    return classMap[status] || '';
};

export const ClientRequestDetailsPage: React.FC = () => {

    return (
        <div>
            <ClientHeader/>
            <div className="request-details-client-page">
                {/* --- НАВИГАЦИЯ И ЗАГОЛОВОК --- */}
                <div className="page-header">
                    <a href="/my-requests" className="back-link">&larr; К списку заявок</a>
                    <h1 className="details-title">Заявка #{mockRequest.id}</h1>
                    <p className="details-subtitle">Информация о вашей заявке на {mockRequest.serviceName}</p>
                </div>

                <div className="card main-card">
                    {/* ========================================================== */}
                    {/* ========= ОСНОВНОЙ БЛОК СО СТАТУСОМ (ИЗМЕНЕНО) ========= */}
                    {/* ========================================================== */}
                    <div className="status-highlight-section">
                        <div className="status-block">
                            <span className="info-label">Текущий статус</span>
                            <span className={`status-badge-large ${getStatusClassName(mockRequest.status)}`}>
              {mockRequest.status}
            </span>
                        </div>
                        <div className="status-block">
                            <span className="info-label">Ориентировочное завершение</span>
                            <span className="date-value">{mockRequest.estimatedCompletionAt || 'После диагностики'}</span>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ============== ИНФОРМАЦИЯ О ЗАЯВКЕ ===================== */}
                    {/* ========================================================== */}
                    <div className="details-section">
                        <h2 className="section-title">Детали заявки</h2>
                        <div className="info-grid">
                            <div className="info-block">
                                <strong className="info-label">Устройство:</strong>
                                <span className="info-value">{mockRequest.deviceType} {mockRequest.deviceModel}</span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Серийный номер:</strong>
                                <span className="info-value">{mockRequest.deviceSerialNumber}</span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Дата создания:</strong>
                                <span className="info-value">{mockRequest.createdAt}</span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Назначенный специалист:</strong>
                                <span className="info-value">{mockRequest.specialistName || 'Ожидает назначения'}</span>
                            </div>
                            <div className="info-block full-width">
                                <strong className="info-label">Ваше описание проблемы:</strong>
                                <p className="info-description">{mockRequest.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* =================== БЛОК ДЕЙСТВИЙ ====================== */}
                    {/* ========================================================== */}
                    <div className="actions-footer">
                        <button className="action-button">Скачать квитанцию</button>
                    </div>
                </div>
            </div>
        </div>
    );
};