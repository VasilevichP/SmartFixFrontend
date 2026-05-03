import React, {useEffect, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import ManagerHeader from "../components/ManagerHeader.tsx";
import {
    type ClientRequestForSelectDto,
    type CreateRequestByManagerCommand,
    requestsApi
} from "../api/requestsApi.ts";
import {type ClientBriefDto, clientsApi} from "../api/clientsApi.ts";
import {type ServiceForRequest, servicesApi} from "../api/servicesApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {useApi} from "../hooks/useApi.ts";
import '../styles/CreateServicePage.css';
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";
import {CustomServiceModal} from "../components/CustomServiceModal.tsx";

interface SelectedServiceItem {
    id: string; // Временный ID для React Key
    serviceId?: string; // У ручных будет undefined
    name: string;
    price: number;
}

export const ManagerCreateRequestPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [phoneError, setPhoneError] = useState("");

    // --- Справочники ---
    const [clients, setClients] = useState<ClientBriefDto[]>([]);
    const [catalogServices, setCatalogServices] = useState<ServiceForRequest[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);
    const [clientClosedRequests, setClientClosedRequests] = useState<ClientRequestForSelectDto[]>([]);

    // --- State: Клиент и Контакты (Всегда нужны) ---
    const [clientMode, setClientMode] = useState<'existing' | 'new'>('new');
    const [selectedClientId, setSelectedClientId] = useState("");

    const [contactInfo, setContactInfo] = useState({
        name: '',
        phone: '',
        email: ''
    });

    // --- State: Устройство ---
    const [deviceData, setDeviceData] = useState({
        typeId: '', manufId: '', modelId: '', customModelName: '', serial: ''
    });
    const [isManualModel, setIsManualModel] = useState(false);

    // --- State: Ремонт и Детали ---
    const [requestType, setRequestType] = useState<number>(0);
    const [details, setDetails] = useState({
        description: '', appearance: '', package: '', address: '', scheduledTime: '', parentRequestId: ''
    });

    const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);
    const [currentServiceSelect, setCurrentServiceSelect] = useState("");
    const [isCustomServiceModalOpen, setIsCustomServiceModalOpen] = useState(false);

    const [createRequest, {isLoading: isSaving}] = useApi(requestsApi.createRequestByManager);

    // Первичная загрузка
    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        const loadInitial = async () => {
            const [cls, srvs, types, manufs] = await Promise.all([
                clientsApi.getAllClients(token),
                servicesApi.getAllServicesForRequest(token),
                deviceTypesApi.getAllDeviceTypes(token),
                manufacturersApi.getAllManufacturers(token)
            ]);
            setClients(cls);
            setCatalogServices(srvs);
            setDeviceTypes(types);
            setManufacturers(manufs);
        };
        loadInitial();
    }, []);

    // Реакция на выбор клиента из базы
    useEffect(() => {
        if (clientMode === 'existing' && selectedClientId) {
            const c = clients.find(x => x.id === selectedClientId);
            if (c) {
                setContactInfo({name: c.name, phone: c.phone, email: c.email});

                requestsApi.getClosedClientRequests(token, selectedClientId).then(reqs => {
                    // @ts-ignore
                    setClientClosedRequests(reqs);
                }).catch(console.error);
            }
        } else {
            setContactInfo({name: '', phone: '', email: ''});
            setClientClosedRequests([]);
            setDetails(d => ({...d, parentRequestId: ''}));
        }
    }, [clientMode, selectedClientId]);


    const handleCascadeLoad = async (typeId: string, manufId?: string) => {
        if (!typeId) {
            setModels([]);
            return;
        }
        try {
            const data = await deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token, typeId, manufId || undefined);
            setModels(data);
        } catch (e) {
            console.log(e);
        }
    };
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setDeviceData(prev => ({
            ...prev,
            typeId: val,
            manufId: '',
            modelId: ''
        }));
        handleCascadeLoad(val, undefined);
    };

    const handleManufacturerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setDeviceData(prev => ({
            ...prev,
            manufId: val,
            modelId: ''
        }));
        handleCascadeLoad(deviceData.typeId, val);
    };

    const handlePhoneChange = (value?: string) => {
        setContactInfo(prev => ({...prev, phone: value || ''}));
    };

    const handleAddCatalogService = () => {
        if (!currentServiceSelect) return;
        const srv = catalogServices.find(s => s.serviceId === currentServiceSelect);
        if (srv && !selectedServices.some(s => s.serviceId === srv.serviceId)) {
            setSelectedServices(prev => [...prev, {
                id: srv.serviceId,
                serviceId: srv.serviceId,
                name: srv.serviceName,
                price: srv.price
            }]);
        }
        setCurrentServiceSelect("");
    };

    const handleAddCustomService = (name: string, price: number) => {
        setSelectedServices(prev => [...prev, {id: Math.random().toString(), name, price}]);
        setIsCustomServiceModalOpen(false);
    };
    const handleRemoveService = (id: string) => {
        setSelectedServices(prev => prev.filter(s => s.serviceId !== id));
    };
    // САБМИТ ФОРМЫ
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");
        if (contactInfo.phone && !isValidPhoneNumber(contactInfo.phone)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        let finalModelName = deviceData.customModelName;
        if (!isManualModel && requestType !== 2) {
            if (!deviceData.modelId) {
                alert("Выберите модель устройства");
                return;
            }
            finalModelName = models.find(m => m.id === deviceData.modelId)?.name || "Неизвестная модель";
        }

        if (requestType === 1 && (!details.address || !details.scheduledTime)) {
            alert("Для выездного ремонта заполните адрес и время");
            return;
        }

        const catalogServiceIds = selectedServices.filter(s => s.serviceId).map(s => s.serviceId as string);
        const customServices = selectedServices.filter(s => !s.serviceId).map(s => ({name: s.name, price: s.price}));
        const command: CreateRequestByManagerCommand = {
            clientId: clientMode === 'existing' ? selectedClientId : null,
            contactName: contactInfo.name,
            contactPhone: contactInfo.phone,
            contactEmail: contactInfo.email,

            type: requestType,
            deviceTypeId: deviceData.typeId? deviceData.typeId : null,
            deviceModelId: (isManualModel || requestType === 2) ? null : deviceData.modelId,
            deviceModelName: finalModelName ? finalModelName : null,
            description: details.description,
            serialNumber: deviceData.serial? deviceData.serial : null,
            deviceAppearance: details.appearance,
            devicePackage: details.package,

            fieldAddress: requestType === 1 ? details.address : null,
            scheduledTime: requestType === 1 && details.scheduledTime ? details.scheduledTime : null,
            parentRequestId: requestType === 2 ? details.parentRequestId : null,

            serviceIds: catalogServiceIds,
            customServices: customServices
        };

        const result = await createRequest(token, command);
        // @ts-ignore
        const resultId = result.data;
        if (resultId) {
            navigate(`/manager/requests/${resultId}`);
        }
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/requests" className="back-link">&larr; Отмена</Link>
                    <h1 className="create-service-title">Создание заявки</h1>
                </div>

                <div className="form-container" style={{color: "#1c1e21"}}>
                    <form onSubmit={handleSubmit}>

                        {/* 1. БЛОК КЛИЕНТА И КОНТАКТОВ */}
                        <div className="card" style={{padding: '20px', marginBottom: '20px'}}>
                            <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>1.
                                Контактная информация</h3>

                            <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                <label style={{cursor: 'pointer'}}>
                                    <input type="radio" checked={clientMode === 'new'} onChange={() => {
                                        setClientMode('new');
                                        setSelectedClientId("");
                                    }}/> Создать нового клиента
                                </label>
                                <label style={{cursor: 'pointer'}}>
                                    <input type="radio" checked={clientMode === 'existing'}
                                           onChange={() => setClientMode('existing')}/> Выбрать из базы
                                </label>
                            </div>

                            {clientMode === 'existing' && (
                                <div className="input-group full-width" style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    boxSizing: "border-box"
                                }}>
                                    <label className="form-label">Поиск по базе</label>
                                    <select className="form-select" value={selectedClientId}
                                            onChange={e => setSelectedClientId(e.target.value)} required>
                                        <option value="">-- Выберите клиента --</option>
                                        {clients.map(c => <option key={c.id}
                                                                  value={c.id}>{c.name} ({c.phone})</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="form-grid" style={{marginTop: '15px'}}>
                                <div className="input-group">
                                    <label className="form-label">* ФИО</label>
                                    <input type="text" className="form-input" value={contactInfo.name}
                                           onChange={e => setContactInfo({...contactInfo, name: e.target.value})}
                                           placeholder="Иванов Иван Иванович" required/>
                                </div>
                                <div className="input-group">
                                    <label className="form-label">* Номер телефона</label>
                                    <PhoneInput
                                        country="BY"
                                        value={contactInfo.phone}
                                        onChange={handlePhoneChange}
                                        className="form-input"
                                        required={true}
                                        placeholder="3751115500"
                                    />
                                    {phoneError &&
                                        <p className="input-error-text">{phoneError}</p>
                                    }
                                </div>
                                <div className="input-group full-width">
                                    <label className="form-label">* Email</label>
                                    <input type="email" className="form-input" value={contactInfo.email}
                                           onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                                           placeholder="email@gmail.com" required/>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{padding: '20px', marginBottom: '20px'}}>
                            <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>2. Тип
                                ремонта</h3>
                            <div className="input-group full-width">
                                <select className="form-select" value={requestType}
                                        onChange={e => setRequestType(parseInt(e.target.value))}>
                                    <option value="0">В сервисном центре</option>
                                    <option value="1">Выездной ремонт</option>
                                    <option value="2">Гарантийный ремонт</option>
                                </select>
                            </div>

                            {requestType === 1 && (
                                <div className="form-grid" style={{
                                    marginTop: '15px',
                                    backgroundColor: '#e0f2fe',
                                    padding: '15px',
                                    borderRadius: '6px'
                                }}>
                                    <div className="input-group full-width">
                                        <label className="form-label">* Адрес клиента</label>
                                        <input type="text" className="form-input" value={details.address}
                                               onChange={e => setDetails({...details, address: e.target.value})}
                                               placeholder="ул. Лесная, д. 1, кв. 2" required/>
                                    </div>
                                    <div className="input-group">
                                        <label className="form-label">* Запланированное время</label>
                                        <input type="datetime-local" className="form-input"
                                               value={details.scheduledTime}
                                               onChange={e => setDetails({...details, scheduledTime: e.target.value})}
                                               required/>
                                    </div>
                                </div>
                            )}

                            {requestType === 2 && (
                                <div className="form-grid" style={{
                                    marginTop: '15px',
                                    backgroundColor: '#fef2f2',
                                    padding: '15px',
                                    borderRadius: '6px',
                                    border: '1px solid #fca5a5'
                                }}>
                                    <div className="input-group full-width">
                                        <label className="form-label" style={{color: '#b91c1c'}}>* Выберите заявку по
                                            которой наступил гарантийный случай</label>
                                        {clientMode === 'new' ? (
                                            <p style={{color: '#dc2626', margin: 0}}>Для гарантийного ремонта необходимо
                                                выбрать существующего клиента!</p>
                                        ) : (
                                            <select className="form-select" value={details.parentRequestId}
                                                    onChange={e => setDetails({
                                                        ...details,
                                                        parentRequestId: e.target.value
                                                    })} required>
                                                <option value="">-- Выберите закрытую заявку --</option>
                                                {clientClosedRequests.map(r => (
                                                    <option key={r.id} value={r.id}>Заявка
                                                        #{r.id.substring(0, 8)} от {new Date(r.closedAt).toLocaleDateString()} ({r.deviceModelName})</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. ОБОРУДОВАНИЕ И ПРОБЛЕМА */}
                        <div className="card" style={{padding: '20px', marginBottom: '20px'}}>
                            <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>3.
                                Устройство</h3>
                            {requestType !== 2 && (
                                <>
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label className="form-label">* Тип устройства</label>
                                            <select className="form-select" value={deviceData.typeId}
                                                    onChange={handleTypeChange} required>
                                                <option value="">Выберите тип...</option>
                                                {deviceTypes.map(t => <option key={t.id}
                                                                              value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label className="form-label">Производитель</label>
                                            <select className="form-select" value={deviceData.manufId}
                                                    onChange={handleManufacturerChange}>
                                                <option value="">Любой</option>
                                                {manufacturers.map(m => <option key={m.id}
                                                                                value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>

                                        {!isManualModel ? (
                                            <div className="input-group full-width">
                                                <label className="form-label">* Модель</label>
                                                <select className="form-select" value={deviceData.modelId}
                                                        onChange={e => setDeviceData({
                                                            ...deviceData,
                                                            modelId: e.target.value
                                                        })}
                                                        required disabled={!deviceData.typeId}>
                                                    <option value="">Выберите модель...</option>
                                                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="input-group full-width">
                                                <label className="form-label">* Модель (Ручной ввод)</label>
                                                <input type="text" className="form-input"
                                                       value={deviceData.customModelName}
                                                       onChange={e => setDeviceData({
                                                           ...deviceData,
                                                           customModelName: e.target.value
                                                       })}
                                                       placeholder="Samsung Galaxy x10" required/>
                                            </div>
                                        )}


                                    </div>

                                    <label
                                        style={{
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'block',
                                            marginBottom: '15px'
                                        }}>
                                        <input type="checkbox" checked={isManualModel}
                                               onChange={e => setIsManualModel(e.target.checked)}/> Ввести модель
                                        вручную
                                    </label>

                                    <div className="form-grid">
                                        <div className="input-group full-width">
                                            <label className="form-label">* Серийный номер / IMEI</label>
                                            <input type="text" className="form-input" value={deviceData.serial}
                                                   onChange={e => setDeviceData({
                                                       ...deviceData,
                                                       serial: e.target.value
                                                   })}
                                                   placeholder="893884828320"/>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="form-grid" style={{marginTop: '15px'}}>
                                <div className="input-group full-width">
                                    <label className="form-label">* Описание неисправности (со слов клиента)</label>
                                    <textarea className="form-textarea" rows={2} value={details.description}
                                              onChange={e => setDetails({...details, description: e.target.value})}
                                              required/>
                                </div>

                                {requestType === 0 && (
                                    <>
                                        <div className="input-group">
                                            <label className="form-label">Внешний вид (царапины, сколы)</label>
                                            <textarea className="form-textarea" rows={2}
                                                      placeholder="Б/У, потертости на корпусе..."
                                                      value={details.appearance} onChange={e => setDetails({
                                                ...details,
                                                appearance: e.target.value
                                            })}/>
                                        </div>
                                        <div className="input-group">
                                            <label className="form-label">Комплектация при сдаче</label>
                                            <textarea className="form-textarea" rows={2}
                                                      placeholder="Только само устройство..."
                                                      value={details.package} onChange={e => setDetails({
                                                ...details,
                                                package: e.target.value
                                            })}/>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {requestType !== 2 && (
                            <div className="card" style={{padding: '20px', marginBottom: '20px'}}>
                                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>4.
                                    Предварительные работы</h3>

                                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                                    <select className="form-select" style={{flexGrow: 1}} value={currentServiceSelect}
                                            onChange={e => setCurrentServiceSelect(e.target.value)}>
                                        <option value="">-- Выберите услугу из каталога --</option>
                                        {catalogServices.map(s => <option key={s.serviceId}
                                                                          value={s.serviceId}>{s.serviceName} ({s.price} руб.)</option>)}
                                    </select>
                                    <button type="button" className="action-button secondary-button"
                                            onClick={handleAddCatalogService}>Добавить
                                    </button>
                                </div>

                                <div style={{marginBottom: '15px'}}>
                                    <span style={{
                                        color: '#2563eb',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontSize: '14px'
                                    }} onClick={() => setIsCustomServiceModalOpen(true)}>
                                        + Добавить произвольную работу (вне каталога)
                                    </span>
                                </div>

                                {selectedServices.length > 0 && (
                                    <table className="services-table">
                                        <tbody>
                                        {selectedServices.map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    {s.name}
                                                    {!s.serviceId && <span
                                                        style={{fontSize: '12px', color: '#888', marginLeft: '10px'}}>(ручной ввод)</span>}
                                                </td>
                                                <td style={{textAlign: 'right'}}>{s.price} руб.</td>
                                                <td style={{width: '40px'}}>
                                                    <button type="button" className="delete-icon-btn"
                                                            onClick={() => handleRemoveService(s.id)}>&times;</button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        <div className="form-actions" style={{justifyContent: 'center', marginTop: '30px'}}>
                            <button type="button" className="action-button cancel-button"
                                    onClick={() => navigate('/manager/requests')}>Отмена
                            </button>
                            <button type="submit" className="action-button save-button"
                                    style={{fontSize: '16px', padding: '12px 30px'}}
                                    disabled={isSaving || (requestType === 2 && clientMode === 'new')}>
                                {isSaving ? 'Сохранение...' : 'Оформить заявку'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
            <CustomServiceModal
                isOpen={isCustomServiceModalOpen}
                onClose={() => setIsCustomServiceModalOpen(false)}
                onConfirm={handleAddCustomService}
            />
        </div>
    )
        ;
};