import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {requestsApi, type RequestDetailsDto, STATUS_NUMBER_MAP} from "../api/requestsApi";
import {servicesApi, type ServiceForRequest} from "../api/servicesApi";
import {useApi} from "../hooks/useApi";
import MasterHeader from "../components/MasterHeader.tsx";
import {CustomServiceModal} from "../components/CustomServiceModal.tsx";

export const MasterRequestDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const BASE_IMG_URL = "http://localhost:5251/";

    const [request, setRequest] = useState<RequestDetailsDto | null>(null);
    const [catalogServices, setCatalogServices] = useState<ServiceForRequest[]>([]);

    // Локальные состояния редактирования
    const [diagnosticResult, setDiagnosticResult] = useState("");
    const [localServices, setLocalServices] = useState<{
        id: string,
        serviceId: string | null,
        serviceName: string,
        price: number
    }[]>([]);
    const [isServicesModified, setIsServicesModified] = useState(false);

    const [selectedCatalogServiceId, setSelectedCatalogServiceId] = useState("");
    const [isCustomServiceModalOpen, setIsCustomServiceModalOpen] = useState(false);

    const [apiUpdateDiagnostics] = useApi(requestsApi.updateDiagnosticsResult);
    const [apiUpdateStatus] = useApi(requestsApi.updateStatus);
    const [apiUpdateServices] = useApi(requestsApi.updateServices); // Пакетное сохранение

    const loadData = async () => {
        if (!id) return;
        const [reqData, servCat] = await Promise.all([
            requestsApi.getById(token, id),
            servicesApi.getAllServicesForRequest(token)
        ]);

        setRequest(reqData);
        setCatalogServices(servCat);
        setDiagnosticResult(reqData.diagnosticResult || "");
        setLocalServices(reqData.services || []);
        setIsServicesModified(false);
    };

    const [fetchData, {isLoading}] = useApi(loadData, false);

    useEffect(() => {
        if (!token) navigate('/');
        else fetchData();
    }, [id]);

    const handleSaveDiagnostics = async () => {
        if (!id) return;
        await apiUpdateDiagnostics(token, id, diagnosticResult);
        fetchData();
    };

    const handleStatusChange = async (newStatus: number) => {
        if (!id) return;
        await apiUpdateStatus(token, id, newStatus);
        fetchData();
    };

    // Услуги
    const handleAddCatalogService = () => {
        if (!selectedCatalogServiceId) return;
        const srv = catalogServices.find(s => s.serviceId === selectedCatalogServiceId);
        if (srv) {
            setLocalServices(prev => [...prev, {
                id: Math.random().toString(),
                serviceId: srv.serviceId,
                serviceName: srv.serviceName,
                price: srv.price
            }]);
            setIsServicesModified(true);
        }
        setSelectedCatalogServiceId("");
    };

    const handleAddCustomService = (name: string, price: number) => {
        setLocalServices(prev => [...prev, {id: Math.random().toString(), serviceId: null, serviceName: name, price}]);
        setIsCustomServiceModalOpen(false);
        setIsServicesModified(true);
    };

    const handleRemoveLocalService = (idToRemove: string) => {
        setLocalServices(prev => prev.filter(s => s.id !== idToRemove));
        setIsServicesModified(true);
    };

    const handleSaveServices = async () => {
        if (!id) return;
        const payload = localServices.map(s => ({serviceId: s.serviceId, name: s.serviceName, price: s.price}));
        await apiUpdateServices(token, id, payload);
        fetchData();
    };

    if (isLoading) return <div className="loading-container">Загрузка...</div>;
    if (!request) return <div className="error-container">Заявка не найдена</div>;

    // Мастеру нельзя редактировать закрытые/отмененные/готовые заявки
    const isLocked = request.status === 6 || request.status === 7 || request.status === 8;

    return (
        <div>
            <MasterHeader/>
            <div className="request-details-page">
                <div className="request-details-page-header">
                    <div className="page-header-left">
                        <Link to="/master/requests" className="back-link">&larr; К списку задач</Link>
                        <h1 className="details-title">Заявка #{request.id.substring(0, 8)}</h1>
                    </div>
                </div>

                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="summary-content">
                            <h3>Устройство</h3>
                            <div className="summary-value">{request.deviceModelName}</div>
                            <div className="summary-sub">{request.deviceTypeName}</div>
                            <div className="summary-sub">SN: {request.deviceSerialNumber || "—"}</div>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-content">
                            <h3>Состояние при приеме</h3>
                            <div className="summary-sub"><strong>Внешний вид:</strong> {request.deviceAppearance || "—"}
                            </div>
                            <div className="summary-sub"><strong>Комплектация:</strong> {request.devicePackage || "—"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="details-layout">
                    <div className="main-content">
                        {/* ДИАГНОСТИКА */}
                        <div className="card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <h2 className="card-title" style={{margin: 0}}>Результат диагностики</h2>
                                {!isLocked && <button className="action-button secondary-button small-btn"
                                                      onClick={handleSaveDiagnostics}>Сохранить</button>}
                            </div>
                            <textarea className="form-textarea" rows={3} value={diagnosticResult}
                                      onChange={e => setDiagnosticResult(e.target.value)}
                                      placeholder="Опишите выявленные дефекты..." disabled={isLocked}/>
                        </div>

                        {/* СПИСОК РАБОТ */}
                        <div className="card services-card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <h2 className="card-title" style={{margin: 0}}>Выполненные работы</h2>
                                {isServicesModified && !isLocked && (
                                    <button className="action-button save-button small-btn"
                                            onClick={handleSaveServices}>Сохранить список</button>
                                )}
                            </div>

                            <table className="services-table">
                                <thead>
                                <tr>
                                    <th>Наименование услуги</th>
                                    <th style={{textAlign: 'right'}}>Цена</th>
                                    <th style={{width: '40px'}}></th>
                                </tr>
                                </thead>
                                <tbody>
                                {localServices.length > 0 ? localServices.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.serviceName}</td>
                                        <td style={{textAlign: 'right'}}>{s.price.toFixed(2)} руб.</td>
                                        <td>{!isLocked && request.type !== 2 && <button className="delete-icon-btn"
                                                                                        onClick={() => handleRemoveLocalService(s.id)}>&times;</button>}</td>
                                    </tr>
                                )) : <tr>
                                    <td colSpan={3} style={{textAlign: 'center', color: '#999'}}>Список работ пуст</td>
                                </tr>}
                                </tbody>
                            </table>

                            {!isLocked && request.type !== 2 && (
                                <div className="add-service-panel" style={{marginTop: '15px'}}>
                                    <div className="add-service-row">
                                        <select className="form-select" value={selectedCatalogServiceId}
                                                onChange={e => setSelectedCatalogServiceId(e.target.value)}>
                                            <option value="">Выберите услугу из каталога...</option>
                                            {catalogServices.map(s => <option key={s.serviceId}
                                                                              value={s.serviceId}>{s.serviceName} ({s.price} руб.)</option>)}
                                        </select>
                                        <button className="action-button secondary-button small-btn"
                                                onClick={handleAddCatalogService} disabled={!selectedCatalogServiceId}>+
                                            Добавить
                                        </button>
                                    </div>
                                    <div style={{marginTop: '10px'}}>
                                        <span style={{
                                            color: '#2563eb',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: '14px'
                                        }}
                                              onClick={() => setIsCustomServiceModalOpen(true)}>+ Произвольная работа</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Описание проблемы и фото */}
                        <div className="card">
                            <h2 className="card-title">Жалоба клиента</h2>
                            <div className="description-box">{request.description}</div>
                        </div>

                        {request.photoPaths && request.photoPaths.length > 0 && (
                            <div className="card">
                                <h2 className="card-title">Фотографии</h2>
                                <div className="files-list">
                                    {request.photoPaths.map((path, idx) => (
                                        <a key={idx} href={`${BASE_IMG_URL}${path}`} target="_blank" rel="noreferrer"
                                           className="file-item">
                                            <img src={`${BASE_IMG_URL}${path}`} alt="Фото"/>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-content">
                        {/* УПРАВЛЕНИЕ СТАТУСОМ */}
                        <div className="card control-card">
                            <h2 className="card-title">Управление</h2>
                            <div className="control-group">
                                <label className="control-label">Текущий статус</label>
                                <select
                                    className="form-select status-select"
                                    value={request.status}
                                    disabled={isLocked}
                                    onChange={e => handleStatusChange(parseInt(e.target.value))}
                                >
                                    {Object.entries(STATUS_NUMBER_MAP).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ИСТОРИЯ */}
                        <div className="card">
                            <h2 className="card-title">История статусов</h2>
                            <div className="history-list">
                                {request.statusHistories.map((h, idx) => (
                                    <div key={idx} className="history-item">
                                        <span
                                            className={`status-badge-small ${STATUS_NUMBER_MAP[h.status]?.class || ''}`}>{STATUS_NUMBER_MAP[h.status]?.label}</span>
                                        <span className="history-date">{new Date(h.date).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CustomServiceModal isOpen={isCustomServiceModalOpen}
                                onClose={() => setIsCustomServiceModalOpen(false)}
                                onConfirm={handleAddCustomService}/>
        </div>
    );
};