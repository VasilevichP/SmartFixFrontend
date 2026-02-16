import React, {useEffect, useState} from 'react';
import ClientHeader from "../components/ClientHeader.tsx";
import '../styles/ClientProfile.css';
import {Link, useNavigate} from "react-router-dom";
import {type UserProfile, usersApi} from "../api/usersApi.ts";
import {type ClientRequestDto, requestsApi, STATUS_NUMBER_MAP} from "../api/requestsApi.ts";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";
export const ClientProfilePage: React.FC = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [user, setUser] = useState<UserProfile | null>(null);
    const [requests, setRequests] = useState<ClientRequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Редактирование профиля
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({
        id: '', name: '', phone: '', email: ''
    });

    // Табы заявок
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const token = localStorage.getItem('token') || "";

    // --- ЗАГРУЗКА ДАННЫХ ---
    useEffect(() => {
        const loadData = async () => {
            if (!token) {
                navigate('/');
                return;
            }

            try {
                setIsLoading(true);
                const [userData, requestsData] = await Promise.all([
                    usersApi.getUserProfile(token),
                    requestsApi.getClientRequests(token)
                ]);

                setUser(userData);
                setFormData(userData);
                setRequests(requestsData);
            } catch (error) {
                alert("Ошибка загрузки профиля");
                navigate('/catalog')
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    // --- ОБРАБОТЧИКИ ПРОФИЛЯ ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handlePhoneChange = (value?: string) => {
        setFormData(prev => ({ ...prev, phone: value || '' }));
    };

    const handleEditClick = () => {
        if (user) setFormData(user); // Сброс к актуальным данным перед редактированием
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleSaveClick = async (e: any) => {
        e.preventDefault()
        if (formData.phone && !isValidPhoneNumber(formData.phone)) {
            setIsLoading(false);
            return;
        }
        try {
            await usersApi.updateUserProfile(token, formData);
            setUser(formData); // Обновляем отображение
            setIsEditing(false);
            alert("Профиль обновлен!");
        } catch (error) {
            console.error(error);
            alert("Не удалось обновить профиль");
        }
    };

    // --- ФИЛЬТРАЦИЯ ЗАЯВОК ---
    // Статусы: 4 (Closed) и 5 (Cancelled) - это история. Остальное - активные.
    const activeRequests = requests.filter(r => r.status !== 4 && r.status !== 5);
    const historyRequests = requests.filter(r => r.status === 4 || r.status === 5);

    const requestsToShow = activeTab === 'active' ? activeRequests : historyRequests;

    if (isLoading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Загрузка...</div>;

    return (
        <div>
            <ClientHeader/>
            <div className="dashboard-page-container">

                {/* ЗАГОЛОВОК */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="welcome-title">Добро пожаловать, {user?.name}!</h1>
                        <p className="welcome-subtitle">
                            У вас {activeRequests.length} активных заявок.
                        </p>
                    </div>
                </div>

                {/* БЛОК ПРОФИЛЯ */}
                <div className="profile-section card">
                    <div className="profile-header">
                        <h2 className="section-title">Личные данные</h2>
                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button className="action-button cancel-button" onClick={handleCancelClick}>Отмена
                                    </button>
                                    <button type="submit" form="profile-form"
                                            className="action-button save-button">Сохранить
                                    </button>
                                </>
                            ) : (
                                <button className="action-button save-button"
                                        onClick={handleEditClick}>Редактировать</button>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <form id="profile-form" className="profile-form" onSubmit={handleSaveClick}>
                            <div className="form-grid-profile">
                                <div className="input-group">
                                    <label className="form-label">ФИО</label>
                                    <input type="text" name="name" required={true} className="form-input"
                                           value={formData.name} onChange={handleInputChange}/>
                                </div>
                                <div className="input-group">
                                    <label className="form-label">Телефон</label>
                                    <PhoneInput
                                        country="BY"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className="form-input"
                                        required={true}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" name="email" required={true} className="form-input"
                                           value={formData.email} onChange={handleInputChange}/>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-view">
                            <div className="info-block">
                                <strong className="info-label">ФИО:</strong>
                                <span className="info-value">
                                    {user?.name}
                                </span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Телефон:</strong>
                                <span className="info-value">{user?.phone}</span>
                            </div>
                            <div className="info-block">
                                <strong className="info-label">Email:</strong>
                                <span className="info-value">{user?.email}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* СПИСОК ЗАЯВОК */}
                <div className="requests-container card">
                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Активные заявки ({activeRequests.length})
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            История ({historyRequests.length})
                        </button>
                    </div>

                    <div className="requests-list">
                        {requestsToShow.length > 0 ? (
                            requestsToShow.map(request => (
                                <div key={request.id} className="request-item">
                                    <div className="request-info">
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <span className="request-id">#{request.id.substring(0, 8)}...</span>
                                            <span className="request-date">
                                                от {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="request-service-name">{request.serviceName || 'Индивидуальная услуга'}</h3>
                                    </div>

                                    <div className="request-status">
                                        <span className={`status-badge ${STATUS_NUMBER_MAP[request.status]?.class || ''}`}>
                                            {STATUS_NUMBER_MAP[request.status]?.label}
                                        </span>
                                        {/* Ссылка на страницу деталей (нужно создать ClientRequestDetailsPage) */}
                                        <Link to={`/profile/requests/${request.id}`} className="details-link">
                                            Подробнее &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>В этом разделе пока пусто.</p>
                                {activeTab === 'active' && (
                                    <button className="action-button save-button" onClick={() => navigate('/catalog')}>
                                        Перейти в каталог
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};