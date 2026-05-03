import React, {useEffect, useState} from 'react';
import '../styles/Modal.css'; // Базовые стили модалки
import '../styles/CreateRequestModal.css';
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {requestsApi} from "../api/requestsApi.ts";
import {clientsApi} from "../api/clientsApi.ts";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";
import {useApi} from "../hooks/useApi.ts";

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Данные, если мы открываем модалку из карточки услуги
    initialData?: {
        serviceId?: string;
        serviceName?: string;
        price?: number;
        deviceTypeId?: string;
        deviceModelId?: string;
        deviceModelName?: string; // Если модель известна из услуги
        manufacturerId?: string;
    } | null;
}

interface PhotoAttachment {
    id: string;        // Уникальный ID для React key
    file: File;        // Сам файл для отправки
    previewUrl: string; // Ссылка для тега <img>
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({isOpen, onClose, initialData}) => {
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    const [deviceTypeId, setDeviceTypeId] = useState("");
    const [manufacturerId, setManufacturerId] = useState("");
    const [deviceModelId, setDeviceModelId] = useState("");

    const [customModelName, setCustomModelName] = useState("");
    const [isManualMode, setIsManualMode] = useState(false);

    const [contactEmail, setContactEmail] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactPhoneNumber, setContactPhoneNumber] = useState<string | undefined>(undefined);

    const [requestType, setRequestType] = useState<number>(0);
    const [address, setAddress] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    const [description, setDescription] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [photos, setPhotos] = useState<PhotoAttachment[]>([]);

    const token = localStorage.getItem("token") || "";

    const [phoneError, setPhoneError] = useState("");
    const [submit, {isLoading}] = useApi(requestsApi.createRequest);

    useEffect(() => {
        if (isOpen) {
            setPhoneError("");
            loadData();
            if (initialData) {

                setDeviceTypeId(initialData.deviceTypeId || "");
                setManufacturerId(initialData.manufacturerId || "");
                setDeviceModelId(initialData.deviceModelId || "");
                setIsManualMode(!initialData.deviceModelId);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (deviceTypeId && manufacturerId && !isManualMode) {
            deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token, deviceTypeId, manufacturerId)
                .then(setModels)
                .catch(console.error);
        } else {
            setModels([]);
        }
    }, [deviceTypeId, manufacturerId, isManualMode]);

    const loadDictsAndProfile = async () => {
        const [types, manufs, profile] = await Promise.all([
            deviceTypesApi.getAllDeviceTypes(token),
            manufacturersApi.getAllManufacturers(token),
            clientsApi.getClientProfile(token),
        ]);
        setDeviceTypes(types);
        setManufacturers(manufs);
        setContactEmail(profile.email);
        setContactName(profile.name);
        setContactPhoneNumber(profile.phone);
    };

    const [loadData] = useApi(loadDictsAndProfile, false);

    useEffect(() => {
        return () => {
            photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
        };
    }, []);

    const resetForm = () => {
        setDeviceTypeId("");
        setManufacturerId("");
        setDeviceModelId("");
        setCustomModelName("");
        setAddress("");
        setScheduledTime("")
        setDescription("");
        setSerialNumber("");
        setPromoCode("");
        setRequestType(0);
        photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
        setIsManualMode(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            if (newFiles.length + photos.length > 5) {
                alert("Максимум 5 фотографий");
                return;
            }

            const newAttachments: PhotoAttachment[] = newFiles.map(file => ({
                id: Math.random().toString(36).substring(7),
                file: file,
                previewUrl: URL.createObjectURL(file)
            }));

            setPhotos(prev => [...prev, ...newAttachments]);
        }
        e.target.value = "";
    };

    const removePhoto = (idToRemove: string) => {
        setPhotos(prev => {
            const photoToRemove = prev.find(p => p.id === idToRemove);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.previewUrl);
            }
            return prev.filter(p => p.id !== idToRemove);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");

        if (!contactPhoneNumber) return;
        if (contactPhoneNumber && !isValidPhoneNumber(contactPhoneNumber)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        let finalModelName = "";
        if (isManualMode) {
            if (!customModelName) {
                alert("Введите название модели");
                return;
            }
            finalModelName = customModelName;
        } else {
            if (!deviceModelId) {
                alert("Выберите модель из списка или переключитесь на ручной ввод");
                return;
            }
            const selectedModel = models.find(m => m.id === deviceModelId);
            finalModelName = selectedModel ? selectedModel.name : "Неизвестная модель";
        }

        if (requestType === 1 && (!address || !scheduledTime)) {
            alert("Для выездного ремонта заполните адрес и время");
            return;
        }
        const isoScheduledTime = requestType === 1 && scheduledTime ? new Date(scheduledTime).toISOString() : null;
        const result = await submit(token, {
            type: requestType,
            deviceTypeId,
            deviceModelId: isManualMode ? null : deviceModelId,
            deviceModelName: finalModelName,
            description,
            deviceSerialNumber: serialNumber,
            contactEmail,
            contactName,
            contactPhoneNumber: contactPhoneNumber || "",

            fieldAddress: requestType === 1 ? address : null,
            scheduledTime: isoScheduledTime,
            promoCodeText: promoCode || null,

            serviceIds: initialData?.serviceId ? [initialData.serviceId] : [],
            photos: photos.map(p => p.file)
        });
        if (result != undefined) {
            onClose();
            resetForm();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-content request-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {initialData?.serviceId ? `Заказ услуги` : "Новая заявка"}
                    </h2>
                    {initialData?.serviceName && (
                        <div className="service-badge">{initialData.serviceName}</div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="request-form">

                    <div className="form-section">
                        <div className="form-section">
                            <label className="section-label">* Контактные данные</label>
                            <div className="form-row">
                                <input
                                    type="text"
                                    className="form-input full-width"
                                    placeholder="Ваше Имя / Контактное лицо"
                                    value={contactName}
                                    onChange={e => setContactName(e.target.value)}
                                    required={true}
                                />
                            </div>
                            <div className="form-row">
                                {/* Обертка для Email */}
                                <div className="field-container">
                                    <input
                                        type="email"
                                        className="form-input full-width"
                                        placeholder="Ваш адрес эл. почты"
                                        value={contactEmail}
                                        onChange={e => setContactEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="field-container">
                                    <PhoneInput
                                        required={true}
                                        id="phone"
                                        className={`form-input ${phoneError ? 'input-error' : ''}`}
                                        country="BY"
                                        placeholder="375291119900"
                                        value={contactPhoneNumber}
                                        onChange={setContactPhoneNumber}
                                    />
                                    {phoneError && (
                                        <p className="input-error-text">{phoneError}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="section-label">* Где будем ремонтировать?</label>
                            <div className="delivery-options"
                                 style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                                <label style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#1a1a1a'
                                }}>
                                    <input type="radio" checked={requestType === 0} onChange={() => setRequestType(0)}/>
                                    В сервисном центре
                                </label>
                                <label style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#1a1a1a'
                                }}>
                                    <input type="radio" checked={requestType === 1} onChange={() => setRequestType(1)}/>
                                    Выездной ремонт
                                </label>
                            </div>

                            {requestType === 1 && (
                                <div className="form-row" style={{
                                    backgroundColor: '#f0f9ff',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '15px'
                                }}>
                                    <input type="text" className="form-input full-width"
                                           placeholder="Укажите адрес (Улица, дом, квартира)" value={address}
                                           onChange={e => setAddress(e.target.value)} required={requestType === 1}
                                           style={{marginBottom: '10px'}}/>
                                    <input type="datetime-local" className="form-input full-width" value={scheduledTime}
                                           onChange={e => setScheduledTime(e.target.value)}
                                           required={requestType === 1}/>
                                </div>
                            )}
                        </div>

                        <label className="section-label">* Устройство</label>

                        <div className="form-row">
                            <select
                                className="form-select"
                                value={deviceTypeId}
                                onChange={e => setDeviceTypeId(e.target.value)}
                                required={true}
                                disabled={!!initialData?.deviceTypeId}
                            >
                                <option value="">Тип устройства</option>
                                {deviceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>

                            <select
                                className="form-select"
                                value={manufacturerId}
                                onChange={e => setManufacturerId(e.target.value)}
                                disabled={!deviceTypeId || isManualMode || !!initialData?.manufacturerId}
                                required={!isManualMode}
                            >
                                <option value="">Производитель</option>
                                {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        {!isManualMode ? (
                            <select
                                className="form-select full-width"
                                value={deviceModelId}
                                onChange={e => setDeviceModelId(e.target.value)}
                                disabled={!manufacturerId || !!initialData?.deviceModelId}
                                required={true}
                            >
                                <option value="">Выберите модель</option>
                                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="form-input full-width"
                                placeholder="Введите название модели (например, Xiaomi Redmi 9C)"
                                value={customModelName}
                                required={true}
                                onChange={e => setCustomModelName(e.target.value)}
                            />
                        )}

                        {!initialData?.deviceModelId && (
                            <div className="manual-mode-toggle">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isManualMode}
                                        onChange={e => setIsManualMode(e.target.checked)}
                                    />
                                    <span style={{marginLeft: '8px', fontSize: '0.9rem', color: '#555'}}>
                                        Не нашли модель в списке?
                                    </span>
                                </label>
                            </div>
                        )}

                        <input
                            type="text"
                            className="form-input full-width"
                            placeholder="Серийный номер / IMEI"
                            value={serialNumber}
                            onChange={e => setSerialNumber(e.target.value)}
                            required={true}
                            style={{marginTop: '10px'}}
                        />
                    </div>

                    <div className="form-section">
                        <label className="section-label">* Проблема</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            required={true}
                            placeholder="Опишите, что сломалось..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        <div style={{marginTop: '10px'}} >
                            <input type="text" className="form-input full-width" style={{textTransform: 'uppercase'}}
                                   placeholder="Есть промокод? Введите здесь" value={promoCode}
                                   onChange={e => setPromoCode(e.target.value)}/>
                        </div>
                    </div>
                    <div className="form-section">


                        <div className="file-upload-area">
                            <label htmlFor="file-upload" className="file-upload-label">
                                📎 Прикрепить фото (макс. 5)
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{display: 'none'}}
                            />

                            {photos.length > 0 && (
                                <div className="photos-grid">
                                    {photos.map((item) => (
                                        <div key={item.id} className="photo-preview-item">
                                            <img src={item.previewUrl} alt="preview"/>
                                            {/* Кнопка удаления */}
                                            <button
                                                type="button"
                                                className="remove-photo-btn"
                                                onClick={() => removePhoto(item.id)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="modal-btn modal-btn-save" disabled={isLoading}>
                            {isLoading ? "Отправка..." : "Отправить заявку"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
        ;
};