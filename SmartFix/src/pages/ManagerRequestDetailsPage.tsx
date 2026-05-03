import React, {useEffect, useState} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/RequestDetailsPage.css';
import {requestsApi, type RequestDetailsDto, STATUS_NUMBER_MAP} from "../api/requestsApi.ts";
import {servicesApi, type ServiceForRequest} from "../api/servicesApi.ts";
import {mastersApi, type MasterForSelectDto} from "../api/mastersApi.ts"; // Подтянем мастеров из нового API
import {useApi} from "../hooks/useApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {CancelRequestModal} from "../components/CancelRequestModal.tsx";
import {CustomServiceModal} from "../components/CustomServiceModal.tsx";
import {isValidPhoneNumber} from "react-phone-number-input/input";
import PhoneInput from "react-phone-number-input/input";

const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export const ManagerRequestDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [phoneError, setPhoneError] = useState("");

    const [request, setRequest] = useState<RequestDetailsDto | null>(null);
    const [masters, setMasters] = useState<MasterForSelectDto[]>([]);
    const [catalogServices, setCatalogServices] = useState<ServiceForRequest[]>([]);

    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    // Form State (Локальные состояния, которые можно сохранить кнопкой)
    const [appearance, setAppearance] = useState("");
    const [devicePackage, setDevicePackage] = useState("");
    const [diagnosticResult, setDiagnosticResult] = useState<string>("");
    const [selectedCatalogServiceId, setSelectedCatalogServiceId] = useState<string>("");

    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editContact, setEditContact] = useState({name: '', phone: '', email: ''});

    const [isEditingFieldInfo, setIsEditingFieldInfo] = useState(false);
    const [editFieldInfo, setEditFieldInfo] = useState({fieldAddress: '', scheduledTime: ''});

    const [isEditingDevice, setIsEditingDevice] = useState(false);
    const [editDevice, setEditDevice] = useState({typeId: '', modelId: '', customName: '', serial: ''});
    const [isManualModel, setIsManualModel] = useState(false);

    const [localServices, setLocalServices] = useState<{
        id: string,
        serviceId: string | null,
        serviceName: string,
        price: number
    }[]>([]);
    const [isServicesModified, setIsServicesModified] = useState(false);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCustomServiceModalOpen, setIsCustomServiceModalOpen] = useState(false);

    const [apiUpdateServices, {isLoading: isUpdatingServices}] = useApi(requestsApi.updateServices);
    const [apiUpdateDiagnostics, {isLoading: isUpdatingDiagnostics}] = useApi(requestsApi.updateDiagnosticsResult);
    const [apiUpdateAcceptance, {isLoading: isUpdatingAcceptance}] = useApi(requestsApi.updateAcceptance);
    const [apiAssignMaster] = useApi(requestsApi.assignMaster);
    const [apiUpdateStatus] = useApi(requestsApi.updateStatus);
    const [apiCancel] = useApi(requestsApi.cancel);
    const [apiUpdateContact, {isLoading: isUpdatingContact}] = useApi(requestsApi.updateContactInfo);
    const [apiUpdateDevice, {isLoading: isUpdatingDevice}] = useApi(requestsApi.updateDeviceInfo);
    const [apiUpdateFieldInfo, {isLoading: isUpdatingField}] = useApi(requestsApi.updateFieldRequestInfo);

    const loadRequestAndData = async () => {
        if (!id) return;
        const [reqData, masterData, servCat, types] = await Promise.all([
            requestsApi.getById(token, id),
            mastersApi.getAllMastersForSelect(token),
            servicesApi.getAllServicesForRequest(token),
            deviceTypesApi.getAllDeviceTypes(token)
        ]);

        setRequest(reqData);
        setMasters(masterData);
        setCatalogServices(servCat);
        setDeviceTypes(types);

        setAppearance(reqData.deviceAppearance || "");
        setDevicePackage(reqData.devicePackage || "");
        setDiagnosticResult(reqData.diagnosticResult || "");
        setDiagnosticResult(reqData.diagnosticResult || "");
        setLocalServices(reqData.services || []);
        setEditFieldInfo({
            fieldAddress: reqData.fieldAddress || "",
            scheduledTime: formatDateTimeLocal(reqData.scheduledTime)
        });
        setEditDevice({
            typeId: reqData.deviceTypeId,
            modelId: reqData.deviceModelId,
            customName: reqData.deviceModelName,
            serial: reqData.deviceSerialNumber
        })
        setEditContact({name: reqData.contactName, phone: reqData.contactPhone, email: reqData.contactEmail});
    };

    const [loadData, {isLoading}] = useApi(loadRequestAndData, false);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        if (!id) navigate('/manager/requests');
        loadData();
    }, [id, token, navigate]);

    useEffect(() => {
        if (editDevice.typeId && !isManualModel) {
            deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token, editDevice.typeId, undefined)
                .then(setModels).catch(console.error);
        } else {
            setModels([]);
        }
    }, [editDevice.typeId, isManualModel]);

    const handlePhoneChange = (value?: string) => {
        setEditContact(prev => ({...prev, phone: value || ''}));
    };
    const handleSaveContact = async () => {
        if (!id) return;
        setPhoneError("");
        if (editContact.phone && !isValidPhoneNumber(editContact.phone)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        await apiUpdateContact(token, id, editContact.email, editContact.name, editContact.phone);
        setIsEditingContact(false);
        loadData();
    };

    const handleSaveDevice = async () => {
        if (!id) return;
        let finalModelName = editDevice.customName;
        if (!isManualModel) {
            const m = models.find(x => x.id === editDevice.modelId);
            finalModelName = m ? m.name : "Неизвестно";
        }
        await apiUpdateDevice(token, id, editDevice.typeId, finalModelName, editDevice.serial, isManualModel ? undefined : editDevice.modelId);
        setIsEditingDevice(false);
        loadData();
    };

    const handleSaveAcceptance = async () => {
        if (!id) return;
        await apiUpdateAcceptance(token, id, appearance, devicePackage);
        loadData();
    };

    const handleSaveDiagnostics = async () => {
        if (!id) return;
        await apiUpdateDiagnostics(token, id, diagnosticResult);
        await loadData();
    };

    const handleSaveFieldInfo = async () => {
        if (!id) return;

        // const isoDate = new Date(editFieldInfo.scheduledTime).toISOString();
        await apiUpdateFieldInfo(token, id, editFieldInfo.fieldAddress, editFieldInfo.scheduledTime);
        setIsEditingFieldInfo(false);
        await loadData();
    };

    const handleStatusChange = async (newStatus: number) => {
        if (!id || !request) return;
        if (newStatus === 7) {
            setIsCancelModalOpen(true); // Открываем модалку отмены
        } else {
            await apiUpdateStatus(token, id, newStatus);
            await loadData();
        }
    };

    const handleCancelConfirm = async (reason: string) => {
        if (!id) return;
        await apiCancel(token, id, reason);
        setIsCancelModalOpen(false);
        await loadData();
    };

    const handleMasterChange = async (masterId: string) => {
        if (!id) return;
        await apiAssignMaster(token, id, masterId);
        await loadData();
    };

    const handleAddCatalogService = () => {
        if (!selectedCatalogServiceId) return;
        const serviceItem = catalogServices.find(s => s.serviceId === selectedCatalogServiceId);
        if (!serviceItem) return;

        setLocalServices(prev => [...prev, {
            id: Math.random().toString(),
            serviceId: serviceItem.serviceId,
            serviceName: serviceItem.serviceName,
            price: serviceItem.price
        }]);
        setSelectedCatalogServiceId("");
        setIsServicesModified(true);
    };

    const handleAddCustomService = (name: string, price: number) => {
        setLocalServices(prev => [...prev, {
            id: Math.random().toString(),
            serviceId: null,
            serviceName: name,
            price: price
        }]);
        setIsCustomServiceModalOpen(false);
        setIsServicesModified(true);
    };

    const handleRemoveLocalService = (idToRemove: string) => {
        setLocalServices(prev => prev.filter(s => s.id !== idToRemove));
        setIsServicesModified(true);
    };

    const handleSaveServices = async () => {
        if (!id) return;

        const payload = localServices.map(s => ({
            serviceId: s.serviceId,
            name: s.serviceName,
            price: s.price
        }));
        await apiUpdateServices(token, id, payload);
        setIsServicesModified(false);
        await loadData();
    };

    if (isLoading) return <div className="loading-container">Загрузка...</div>;
    if (!request) return <div className="error-container">Заявка не найдена</div>;

    const isLocked = request.status === 6 || request.status === 7; // Готова, Закрыта или Отменена

    const BASE_IMG_URL = "http://localhost:5251/";

    return (
        <div>
            <ManagerHeader/>
            <div className="request-details-page">

                <div className="request-details-page-header">
                    <div className="page-header-left">
                        <Link to="/manager/requests" className="back-link">&larr; К списку заявок</Link>
                        <div className="title-row">
                            <h1 className="details-title">Заявка #{request.id.substring(0, 8)}</h1>
                            <span className={`status-badge-large ${STATUS_NUMBER_MAP[request.status]?.class || ''}`}>
                                {STATUS_NUMBER_MAP[request.status]?.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="summary-grid">

                    {/* 1. Клиент и Контакты */}
                    <div className="summary-card">
                        <div className="summary-content" style={{width: '100%'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <h3>Контактное лицо</h3>
                                {!isLocked && !isEditingContact && (
                                    <button className="secondary-button"
                                            onClick={() => setIsEditingContact(true)}>Изменить</button>
                                )}
                            </div>

                            {!isEditingContact ? (
                                <>
                                    <div className="summary-value">{request.contactName}</div>
                                    <div className="summary-sub">{request.contactPhone}</div>
                                    <div className="summary-sub email">{request.contactEmail}</div>
                                </>
                            ) : (
                                <div style={{marginTop: '10px'}}>
                                    <input className="form-input" style={{marginBottom: '5px'}} value={editContact.name}
                                           onChange={e => setEditContact({...editContact, name: e.target.value})}
                                           placeholder="Имя"/>
                                    <PhoneInput
                                        country="BY"
                                        value={editContact.phone}
                                        onChange={handlePhoneChange}
                                        className="form-input"
                                        required={true}
                                        placeholder="3751115500"
                                    />
                                    {phoneError &&
                                        <p className="input-error-text">{phoneError}</p>
                                    }
                                    <input className="form-input" style={{marginBottom: '10px'}}
                                           value={editContact.email} type="email"
                                           onChange={e => setEditContact({...editContact, email: e.target.value})}
                                           placeholder="Email"/>
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <button className="action-button save-button small-btn"
                                                disabled={isUpdatingContact}
                                                onClick={handleSaveContact}>
                                            {isUpdatingContact ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button className="action-button cancel-button small-btn"
                                                onClick={() => setIsEditingContact(false)}>Отмена
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Устройство */}
                    <div className="summary-card">
                        <div className="summary-content" style={{width: '100%'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <h3>Устройство</h3>
                                {!isLocked && !isEditingDevice && request.type !== 2 && (
                                    <button className="secondary-button" onClick={() => {
                                        setEditDevice({
                                            typeId: '',
                                            modelId: '',
                                            customName: '',
                                            serial: request.deviceSerialNumber
                                        });
                                        setIsEditingDevice(true);
                                    }}>Изменить</button>
                                )}
                            </div>

                            {!isEditingDevice ? (
                                <>
                                    <div className="summary-value">{request.deviceModelName}</div>
                                    <div className="summary-sub">{request.deviceTypeName}</div>
                                    <div className="summary-sub">SN: {request.deviceSerialNumber || "Не указан"}</div>
                                </>
                            ) : (
                                <div style={{marginTop: '10px'}}>
                                    <select className="form-select" style={{marginBottom: '5px'}}
                                            value={editDevice.typeId} required
                                            onChange={e => setEditDevice({...editDevice, typeId: e.target.value})}>
                                        <option value="">Выберите тип...</option>
                                        {deviceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>

                                    {!isManualModel ? (
                                        <select className="form-select" style={{marginBottom: '5px'}}
                                                value={editDevice.modelId}
                                                onChange={e => setEditDevice({...editDevice, modelId: e.target.value})}>
                                            <option value="">Выберите модель...</option>
                                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    ) : (
                                        <input className="form-input" style={{marginBottom: '5px'}}
                                               value={editDevice.customName} onChange={e => setEditDevice({
                                            ...editDevice,
                                            customName: e.target.value
                                        })} placeholder="Ввести вручную"/>
                                    )}
                                    <label style={{
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        color: '#1a1a1a'
                                    }}>
                                        <input type="checkbox" checked={isManualModel}
                                               onChange={e => setIsManualModel(e.target.checked)}/> Ручной ввод модели
                                    </label>
                                    <input className="form-input" style={{marginBottom: '10px'}}
                                           value={editDevice.serial}
                                           onChange={e => setEditDevice({...editDevice, serial: e.target.value})}
                                           placeholder="Серийный номер"/>
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <button className="action-button save-button small-btn"
                                                disabled={isUpdatingDevice}
                                                onClick={handleSaveDevice}>
                                            {isUpdatingDevice ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button className="action-button cancel-button small-btn"
                                                onClick={() => setIsEditingDevice(false)}>Отмена
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Тип и Даты */}
                    <div className="summary-card">
                        <div className="summary-content">
                            <h3>Тип ремонта</h3>
                            <div className="summary-value">
                                {request.type === 0 ? "В сервисном центре" : request.type === 1 ? "Выездной" : "Гарантийный"}
                            </div>
                            <div
                                className="summary-sub">Создана: {new Date(request.createdAt).toLocaleDateString()}</div>
                            {request.closedAt && <div
                                className="summary-sub">Закрыта: {new Date(request.closedAt).toLocaleDateString()}</div>}
                        </div>
                    </div>
                </div>

                {/* --- СПЕЦИФИКА ТИПА РЕМОНТА --- */}
                {request.type === 1 && (
                    <div className="card"
                         style={{backgroundColor: '#e0f2fe', borderColor: '#bae6fd', marginBottom: '20px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{marginTop: 0, color: '#0369a1'}}>🚚 Логистика выездного ремонта</h3>
                            {!isLocked && !isEditingFieldInfo && (
                                <button className="secondary-button"
                                        onClick={() => setIsEditingFieldInfo(true)}>Изменить</button>
                            )}
                        </div>

                        {!isEditingFieldInfo ? (
                            <>
                                <p><strong>Адрес:</strong> {request.fieldAddress}</p>
                                <p><strong>Запланированное
                                    время:</strong> {request.scheduledTime ? new Date(request.scheduledTime).toLocaleString() : "Не указано"}
                                </p>
                            </>
                        ) : (
                            <div style={{marginTop: '10px'}}>
                                <div className="form-grid">
                                    <div className="input-group full-width">
                                        <label className="form-label">Адрес</label>
                                        <input
                                            className="form-input"
                                            value={editFieldInfo.fieldAddress}
                                            onChange={e => setEditFieldInfo({
                                                ...editFieldInfo,
                                                fieldAddress: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="form-label">Запланированное время</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={editFieldInfo.scheduledTime}
                                            onChange={e => setEditFieldInfo({
                                                ...editFieldInfo,
                                                scheduledTime: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                                    <button className="action-button save-button small-btn"
                                            disabled={isUpdatingField}
                                            onClick={handleSaveFieldInfo}>
                                        {isUpdatingField ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button className="action-button cancel-button small-btn"
                                            onClick={() => setIsEditingFieldInfo(false)}>Отмена
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {request.type === 2 && (
                    <div className="card"
                         style={{backgroundColor: '#fef2f2', borderColor: '#fecaca', marginBottom: '20px'}}>
                        <h3 style={{marginTop: 0, color: '#b91c1c'}}>🛡️ Гарантийное обращение</h3>
                        <p>Ремонт производится по гарантии. Ссылается на заказ: <Link
                            to={`/manager/requests/${request.parentRequestId}`}>#{request.parentRequestId?.substring(0, 8)}</Link>
                        </p>
                    </div>
                )}

                {/* --- ОСНОВНОЙ КОНТЕНТ (2 колонки) --- */}
                <div className="details-layout">

                    {/* ЛЕВАЯ КОЛОНКА */}
                    <div className="main-content">

                        {/* АКТ ПРИЕМКИ (Внешний вид и комплектация) */}
                        <div className="card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <h2 className="card-title" style={{margin: 0}}>Состояние при приеме</h2>
                                {!isLocked && (
                                    <button className="action-button secondary-button small-btn"
                                            onClick={handleSaveAcceptance}>
                                        {isUpdatingAcceptance ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                )}
                            </div>
                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label className="form-label">Внешний вид (царапины, сколы)</label>
                                    <textarea className="form-textarea" rows={2} value={appearance}
                                              onChange={e => setAppearance(e.target.value)} disabled={isLocked}/>
                                </div>
                                <div className="input-group full-width">
                                    <label className="form-label">Комплектация (коробка, ЗУ)</label>
                                    <textarea className="form-textarea" rows={2} value={devicePackage}
                                              onChange={e => setDevicePackage(e.target.value)} disabled={isLocked}/>
                                </div>
                            </div>
                        </div>

                        {/* ДИАГНОСТИКА */}
                        <div className="card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <h2 className="card-title" style={{margin: 0}}>Результат диагностики</h2>
                                {!isLocked && (
                                    <button className="action-button secondary-button small-btn"
                                            onClick={handleSaveDiagnostics}>
                                        {isUpdatingDiagnostics ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                )}
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

                                {/* Кнопка появляется только если были изменения (добавили или удалили) */}
                                {isServicesModified && !isLocked && (
                                    <button className="action-button save-button small-btn"
                                            disabled={isUpdatingServices}
                                            onClick={handleSaveServices}>
                                        {isUpdatingServices ? 'Сохранение...' : 'Сохранить список работ'}
                                    </button>
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
                                {localServices.length > 0 ? (
                                    localServices.map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                {s.serviceName}
                                                {!s.serviceId &&
                                                    <span style={{fontSize: '12px', color: '#888', marginLeft: '10px'}}>(ручной ввод)</span>}
                                            </td>
                                            <td style={{textAlign: 'right'}}>{s.price.toFixed(2)} руб.</td>
                                            <td>
                                                {!isLocked && request.type !== 2 && (
                                                    <button className="delete-icon-btn"
                                                            onClick={() => handleRemoveLocalService(s.id)}>&times;</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} style={{textAlign: 'center', color: '#999'}}>Список работ пуст
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td><strong>Предварительный итог (только работы):</strong></td>
                                    <td style={{textAlign: 'right'}}>
                                        <strong>{localServices.reduce((acc, s) => acc + s.price, 0).toFixed(2)} руб.</strong>
                                    </td>
                                    <td></td>
                                </tr>
                                </tfoot>
                            </table>

                            {/* Панель добавления услуг */}
                            {!isLocked && request.type !== 2 && (
                                <div className="add-service-panel" style={{marginTop: '15px'}}>
                                    <div className="add-service-row">
                                        <select className="form-select" value={selectedCatalogServiceId}
                                                onChange={e => setSelectedCatalogServiceId(e.target.value)}>
                                            <option value="">Выберите услугу из каталога...</option>
                                            {catalogServices.map(s => (
                                                <option key={s.serviceId}
                                                        value={s.serviceId}>{s.serviceName} ({s.price} руб.)</option>
                                            ))}
                                        </select>
                                        <button className="action-button secondary-button small-btn"
                                                onClick={handleAddCatalogService} disabled={!selectedCatalogServiceId}>
                                            + Добавить
                                        </button>
                                    </div>
                                    <div style={{marginTop: '10px'}}>
                <span style={{color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px'}}
                      onClick={() => setIsCustomServiceModalOpen(true)}>
                    + Добавить произвольную работу (вне каталога)
                </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Описание проблемы и фото */}
                        <div className="card">
                            <h2 className="card-title">Описание неисправности (заявлено)</h2>
                            <div className="description-box">{request.description}</div>
                        </div>
                        {request.hasReview && (
                            <div className="card" style={{ borderLeft: '4px solid #eab308' }}>
                                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Отзыв клиента
                                </h2>
                                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '24px', color: '#eab308', marginBottom: '10px' }}>
                                        {"★".repeat(request.reviewRating || 5)}
                                        <span style={{ color: '#d1d5db' }}>
                                            {"★".repeat(5 - (request.reviewRating || 5))}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#555', fontSize: '15px' }}>
                                        "{request.reviewComment || "Без комментария"}"
                                    </p>
                                </div>
                            </div>
                        )}
                        {request.status===7 && (
                            <div className="card">
                                <h2 className="card-title">Причина отмены</h2>
                                <div className="description-box">{request.cancellationReason}</div>
                            </div>
                        )}

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

                        <div className="card control-card">
                            <h2 className="card-title">Управление</h2>
                            <div className="control-group">
                                <label className="control-label">Статус</label>
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
                            <div className="control-group">
                                <label className="control-label">Исполнитель (Мастер)</label>
                                <select
                                    className="form-select"
                                    disabled={isLocked}
                                    value={request.masterId || ""}
                                    onChange={e => handleMasterChange(e.target.value)}
                                >
                                    <option value="">Не назначен</option>
                                    {masters.map(s => <option key={s.id}
                                                              value={s.id}>{s.name} ({s.activeRequestsCount} в
                                        работе)</option>)}
                                </select>
                            </div>
                        </div>

                        {/* ФИНАНСЫ */}
                        <div className="card finance-card">
                            <h2 className="card-title">Итоговая смета</h2>
                            <div className="price-row" style={{color: '#666'}}>
                                <span>Базовая стоимость:</span>
                                <span>{request.basePrice.toFixed(2)} руб.</span>
                            </div>

                            {request.appliedDiscounts.length > 0 && (
                                <div style={{
                                    margin: '10px 0',
                                    padding: '10px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '6px'
                                }}>
                                    <h4 style={{margin: '0 0 5px 0', fontSize: '13px', color: '#166534'}}>Скидки
                                        (Авторасчет):</h4>
                                    {request.appliedDiscounts.map(d => (
                                        <div key={d.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px',
                                            color: '#15803d'
                                        }}>
                                            <span>{d.name}</span>
                                            <span>-{d.savedAmount.toFixed(2)} руб.</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <hr style={{margin: '15px 0'}}/>
                            <div className="total-row">
                                <span>К ОПЛАТЕ:</span>
                                <span className="total-value"
                                      style={{color: request.type === 2 ? '#16a34a' : 'inherit'}}>
                                    {request.finalPrice.toFixed(2)} руб.
                                </span>
                            </div>
                        </div>

                        {/* ПРИЧИНА ОТМЕНЫ */}
                        {request.status === 7 && request.cancellationReason && (
                            <div className="card" style={{borderColor: '#ef4444', backgroundColor: '#fef2f2'}}>
                                <h3 style={{color: '#b91c1c', marginTop: 0}}>Причина отмены</h3>
                                <p style={{margin: 0}}>{request.cancellationReason}</p>
                            </div>
                        )}

                        {/* ИСТОРИЯ */}
                        <div className="card">
                            <h2 className="card-title">История статусов</h2>
                            <div className="history-list">
                                {request.statusHistories.map((h, idx) => (
                                    <div key={idx} className="history-item">
                                        <span
                                            className={`status-badge-small ${STATUS_NUMBER_MAP[h.status]?.class || ''}`}>
                                            {STATUS_NUMBER_MAP[h.status]?.label}
                                        </span>
                                        <span className="history-date">
                                            {new Date(h.date).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CancelRequestModal
                isOpen={isCancelModalOpen}
                onClose={() => {
                    setIsCancelModalOpen(false);
                    loadData();
                }}
                onConfirm={handleCancelConfirm}
            />

            <CustomServiceModal
                isOpen={isCustomServiceModalOpen}
                onClose={() => setIsCustomServiceModalOpen(false)}
                onConfirm={handleAddCustomService}
            />
        </div>
    );
};