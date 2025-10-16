import React, {useState} from 'react';
import ClientHeader from "../components/ClientHeader.tsx";
import '../styles/ClientProfile.css';

// Определяем структуру данных для заявки
interface ServiceRequest {
    id: string;
    serviceName: string;
    createdAt: string;
    status: 'Новая' | 'В работе' | 'На диагностике' | 'Ожидание запчастей' | 'Готова' | 'Закрыта' | 'Отменена';
}

interface UserProfile {
    firstName: string;
    lastName: string;
    middleName: string;
    phone: string;
    email: string;
}

const mockUser: UserProfile = {
    firstName: 'Анна',
    lastName: 'Петрова',
    middleName: 'Викторовна',
    phone: '375293335566',
    email: 'anna.petrova@example.com',
};

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
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [user, setUser] = useState<UserProfile>(mockUser);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>(mockUser);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = () => {
        setFormData(user); // Загружаем текущие данные в форму
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleSaveClick = () => {
        // Здесь будет логика отправки данных на сервер
        setUser(formData); // Обновляем "основные" данные
        setIsEditing(false);
    };

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

                <div className="profile-section card">
                    <div className="profile-header">
                        <h2 className="section-title">Личные данные</h2>
                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button className="action-button cancel-button" onClick={handleCancelClick}>Отмена</button>
                                    <button className="action-button save-button" onClick={handleSaveClick}>Сохранить</button>
                                </>
                            ) : (
                                <button className="action-button save-button" onClick={handleEditClick}>Редактировать</button>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        /* --- Режим Редактирования --- */
                        <div className="profile-form">
                            <div className="input-group">
                                <label htmlFor="fullName" className="form-label">* Фамилия</label>
                                <input type="text" id="fullName" name="fullName" className="form-input" value={formData.lastName} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="fullName" className="form-label">* Имя</label>
                                <input type="text" id="fullName" name="fullName" className="form-input" value={formData.firstName} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="fullName" className="form-label">* Отчество</label>
                                <input type="text" id="fullName" name="fullName" className="form-input" value={formData.middleName} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="phone" className="form-label">* Телефон</label>
                                <input type="tel" id="phone" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email" className="form-label">* Email</label>
                                <input type="email" id="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} />
                            </div>
                        </div>
                    ) : (
                        /* --- Режим Просмотра --- */
                        <div className="profile-view">
                            <div className="info-block">
                                <strong className="info-label">ФИО:</strong>
                                <span className="info-value">{user.lastName} {user.firstName} {user.middleName}</span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Телефон:</strong>
                                <span className="info-value">{user.phone}</span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Email:</strong>
                                <span className="info-value">{user.email}</span>
                            </div>
                        </div>
                    )}
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