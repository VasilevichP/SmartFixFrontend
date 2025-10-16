import React, {useState} from 'react';
import ClientHeader from "../components/ClientHeader.tsx";
import '../styles/ClientProfile.css';
import {useNavigate} from "react-router-dom";

// Определяем структуру данных для заявки
interface ServiceRequest {
    id: string;
    serviceName: string;
    createdAt: string;
    status: 'Новая' | 'В работе' | 'На диагностике' | 'Ожидание запчастей' | 'Готова' | 'Закрыта' | 'Отменена';
}

// "Заглушка" с данными для примера
const mockActiveRequests: ServiceRequest[] = [
    {id: 'SF-1026', serviceName: 'Замена экрана смартфона', createdAt: '28.10.2025', status: 'Новая'},
    {id: 'SF-1024', serviceName: 'Диагностика ноутбука', createdAt: '26.10.2025', status: 'На диагностике'},
];
const mockHistoryRequests: ServiceRequest[] = [
    {id: 'SF-0812', serviceName: 'Замена аккумулятора', createdAt: '11.05.2024', status: 'Закрыта'},
    {id: 'SF-0654', serviceName: 'Чистка от пыли', createdAt: '20.11.2023', status: 'Закрыта'},
];

// Функция-помощник для стилизации статусов
const getStatusClassName = (status: ServiceRequest['status']) => {
    const classMap = {
        'Новая': 'status-new', 'В работе': 'status-in-progress', 'На диагностике': 'status-diagnostics',
        'Ожидание запчастей': 'status-waiting', 'Готова': 'status-ready', 'Закрыта': 'status-closed',
        'Отменена': 'status-cancelled'
    };
    return classMap[status] || '';
};

export const ClientProfilePage: React.FC = () => {
    var navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const requestsToShow = activeTab === 'active' ? mockActiveRequests : mockHistoryRequests;

    return (
        <div>
            <ClientHeader/>
            <div className="dashboard-page-container">
                {/* ========================================================== */}
                {/* ======================= ЗАГОЛОВОК ======================== */}
                {/* ========================================================== */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="welcome-title">Добро пожаловать, Анна!</h1>
                        <p className="welcome-subtitle">
                            У вас {mockActiveRequests.length} активных заявок.
                        </p>
                    </div>
                </div>

                {/* ========================================================== */}
                {/* ================ ПЕРЕКЛЮЧАТЕЛЬ И СПИСОК ================== */}
                {/* ========================================================== */}
                <div className="requests-container card">
                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Активные заявки
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            История
                        </button>
                    </div>

                    <div className="requests-list">
                        {requestsToShow.length > 0 ? (
                            requestsToShow.map(request => (
                                <div key={request.id} className="request-item">
                                    <div className="request-info">
                                        <span className="request-id">Заявка #{request.id}</span>
                                        <h3 className="request-service-name">{request.serviceName}</h3>
                                        <p className="request-date">Создана: {request.createdAt}</p>
                                    </div>
                                    <div className="request-status">
                  <span className={`status-badge ${getStatusClassName(request.status)}`}>
                    {request.status}
                  </span>
                                        <a href={`/profile/request_details`} className="details-link">
                                            Подробнее &rarr;
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Здесь пока ничего нет.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};