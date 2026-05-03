import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useApi} from "../hooks/useApi.ts";
import {clientsApi} from "../api/clientsApi.ts";
import {type ClientRequestDto, requestsApi, STATUS_NUMBER_MAP} from "../api/requestsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

export const ManagerClientDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [phoneError, setPhoneError] = useState("");

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', personalDiscount: 0, status: '0'
    });

    const [clientRequests, setClientRequests] = useState<ClientRequestDto[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const [updateClient, {isLoading: isSaving}] = useApi(clientsApi.updateClientByManager);

    const loadClientChatAndRequests = async () => {
        if (!id) return;
        const [client, requests] = await Promise.all([
            clientsApi.getClientById(token, id),
            requestsApi.getClientRequestsForManager(token, id)
        ]);
        console.log(client);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            personalDiscount: client.personalDiscount,
            status: client.status.toString(),
        });
        setClientRequests(requests);
    };

    const [loadData, {isLoading}] = useApi(loadClientChatAndRequests, false);


    useEffect(() => {
        if (!id) return;
        if (!token) {
            navigate('/');
            return;
        }
        loadData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    const handlePhoneChange = (value?: string) => {
        setFormData(prev => ({...prev, phone: value || ''}));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");
        if (formData.phone && !isValidPhoneNumber(formData.phone)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        await updateClient(token, {
            id: id!,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            personalDiscount: formData.personalDiscount,
            status: parseInt(formData.status)
        });
    };

    // Разделяем заявки на активные и архивные (закрытые/отмененные)
    const activeRequests = clientRequests?.filter(r => r.status !== 6 && r.status !== 7) || [];
    const historyRequests = clientRequests?.filter(r => r.status === 6 || r.status === 7) || [];
    const requestsToShow = activeTab === 'active' ? activeRequests : historyRequests;

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="details-page-container">
                <div className="service-details-page-header">
                    <Link to="/manager/clients" className="back-link">&larr; К списку</Link>
                    <h1 className="service-details-title">Профиль клиента: {formData.name}</h1>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                    <div className="form-container card" style={{height: 'fit-content'}}>
                        <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#333'}}>Редактирование
                            данных</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label htmlFor="name" className="form-label">ФИО клиента</label>
                                    <input type="text" id="name" className="form-input" value={formData.name}
                                           onChange={handleChange} required/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="phoneNumber" className="form-label">* Телефон</label>
                                    <PhoneInput
                                        country="BY"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className="form-input"
                                        required={true}
                                        placeholder="3751115500"
                                    />
                                    {phoneError &&
                                        <p className="input-error-text">{phoneError}</p>
                                    }
                                </div>
                                <div className="input-group">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email" id="email" className="form-input" value={formData.email}
                                           onChange={handleChange} required/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="personalDiscount" className="form-label">Скидка (%)</label>
                                    <input type="number" id="personalDiscount" className="form-input" min="0" max="100"
                                           value={formData.personalDiscount} onChange={handleChange}/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="status" className="form-label">Статус лояльности</label>
                                    <select id="status" className="form-select" value={formData.status}
                                            onChange={handleChange}>
                                        <option value="0">Новый</option>
                                        <option value="1">Повторный</option>
                                        <option value="2">VIP-клиент</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '20px'}}>
                                <button type="submit" className="action-button save-button" disabled={isSaving}>
                                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>

                        <div className="requests-container card" style={{
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#333'}}>Заявки
                                клиента</h3>
                            <div className="tabs-container">
                                <button className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('active')}>
                                    Активные ({activeRequests.length})
                                </button>
                                <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('history')}>
                                    История ({historyRequests.length})
                                </button>
                            </div>

                            <div className="requests-list" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                {requestsToShow.length > 0 ? (
                                    requestsToShow.map(request => (
                                        <div key={request.id} className="request-item" style={{
                                            borderBottom: '1px solid #eee',
                                            padding: '12px 0',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div className="request-info">
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    fontSize: '12px',
                                                    color: '#666'
                                                }}>
                                                    <span>#{request.id.substring(0, 8)}</span>
                                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 style={{
                                                    margin: '4px 0 0 0',
                                                    fontSize: '15px',
                                                    color: '#252525'
                                                }}>{request.deviceModelName || 'Устройство не указано'}</h4>
                                            </div>
                                            <div className="request-status" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: '6px'
                                            }}>
                                                <span
                                                    className={`status-badge ${STATUS_NUMBER_MAP[request.status]?.class || ''}`}>
                                                    {STATUS_NUMBER_MAP[request.status]?.label}
                                                </span>
                                                <Link to={`/manager/requests/${request.id}`} style={{
                                                    fontSize: '12px',
                                                    color: '#2563eb',
                                                    textDecoration: 'none'
                                                }}>
                                                    К заявке &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>
                                        <p>Заявок не найдено.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ЗАГЛУШКА ДЛЯ ЧАТА */}
                        <div className="chat-container card" style={{
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            flexGrow: 1
                        }}>
                            <h3 style={{marginTop: 0, marginBottom: '10px', fontSize: '18px', color: '#333'}}>Чат с
                                клиентом</h3>
                            <div style={{
                                backgroundColor: '#f9fafb',
                                height: '200px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed #ccc'
                            }}>
                                <p style={{color: '#888'}}>Здесь будет модуль чата (в разработке)</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};