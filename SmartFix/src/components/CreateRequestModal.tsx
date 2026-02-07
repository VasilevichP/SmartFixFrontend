import React, {useEffect, useState} from 'react';
import '../styles/Modal.css'; // Базовые стили модалки
import '../styles/CreateRequestModal.css';
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {requestsApi} from "../api/requestsApi.ts";
import {usersApi} from "../api/usersApi.ts";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Данные, если мы открываем модалку из карточки услуги
    initialData?: {
        serviceId?: string;
        serviceName?: string;
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
    // --- СПРАВОЧНИКИ ---
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    // --- STATE ФОРМЫ ---
    const [deviceTypeId, setDeviceTypeId] = useState("");
    const [manufacturerId, setManufacturerId] = useState("");
    const [deviceModelId, setDeviceModelId] = useState("");

    // Поле для ручного ввода названия, если выбрана галочка "Ввести вручную"
    const [customModelName, setCustomModelName] = useState("");
    const [isManualMode, setIsManualMode] = useState(false);

    const [contactEmail, setContactEmail] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactPhoneNumber, setContactPhoneNumber] = useState<string | undefined>(undefined);;

    const [description, setDescription] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [photos, setPhotos] = useState<PhotoAttachment[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem("token") || "";

    // Сброс и инициализация при открытии
    useEffect(() => {
        if (isOpen) {
            loadData();
            // Если есть начальные данные (кликнули "Заказать" на услуге)
            if (initialData) {

                setDeviceTypeId(initialData.deviceTypeId || "");
                setManufacturerId(initialData.manufacturerId || "");
                setDeviceModelId(initialData.deviceModelId || "");

                if (initialData.deviceModelId) {
                    setIsManualMode(false);
                }
            } else {
                // Чистый сброс
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    // Каскадная загрузка моделей
    useEffect(() => {
        if (deviceTypeId && manufacturerId && !isManualMode) {
            deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token, deviceTypeId, manufacturerId)
                .then(setModels)
                .catch(console.error);
        } else {
            setModels([]);
        }
    }, [deviceTypeId, manufacturerId, isManualMode]);

    const loadData = async () => {
        try {
            const [types, manufs, profile] = await Promise.all([
                deviceTypesApi.getAllDeviceTypes(token),
                manufacturersApi.getAllManufacturers(token),
                usersApi.getUserProfile(token),
            ]);
            setDeviceTypes(types);
            setManufacturers(manufs);
            setContactEmail(profile.email);
            setContactName(profile.name);
            setContactPhoneNumber(profile.phone);
        } catch (e) {
            console.error(e);
        }
    };

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
        setDescription("");
        setSerialNumber("");
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

            // Создаем объекты с превью
            const newAttachments: PhotoAttachment[] = newFiles.map(file => ({
                id: Math.random().toString(36).substring(7), // Генерируем уникальный ID
                file: file,
                previewUrl: URL.createObjectURL(file) // Создаем ссылку на blob
            }));

            setPhotos(prev => [...prev, ...newAttachments]);
        }
        // Сбрасываем value инпута, чтобы можно было загрузить тот же файл повторно если удалил
        e.target.value = "";
    };

    const removePhoto = (idToRemove: string) => {
        setPhotos(prev => {
            const photoToRemove = prev.find(p => p.id === idToRemove);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.previewUrl); // Чистим память
            }
            // Удаляем по ID, а не по индексу! Это решает проблему удаления
            return prev.filter(p => p.id !== idToRemove);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (contactPhoneNumber && !isValidPhoneNumber(contactPhoneNumber)) {
            setIsLoading(false);
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

        setIsLoading(true);
        if (!contactPhoneNumber) return;
        try {
            await requestsApi.createRequest(token, {
                deviceTypeId,
                deviceModelId: isManualMode ? null : deviceModelId,
                deviceModelName: finalModelName,
                serviceId: initialData?.serviceId || null,
                description,
                deviceSerialNumber: serialNumber,
                contactEmail,
                contactName,
                contactPhoneNumber,
                photos: photos.map(p => p.file)
            });

            alert("Заявка успешно создана!");
            onClose();
            resetForm();
        } catch (error: any) {
            console.error(error);
            alert("Ошибка при создании заявки");
        } finally {
            setIsLoading(false);
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

                    {/* БЛОК 1: УСТРОЙСТВО */}
                    <div className="form-section">
                        <div className="form-section">
                            <label className="section-label">Контактные данные</label>
                            <div className="form-row">
                                <input
                                    type="text"
                                    className="form-input full-width"
                                    placeholder="Ваше Имя / Контактное лицо"
                                    value={contactName}
                                    onChange={e => setContactName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                    <input
                                        type="email"
                                        className="form-input full-width"
                                        placeholder="Ваш адрес эл. почты"
                                        value={contactEmail}
                                        onChange={e => setContactEmail(e.target.value)}
                                        required
                                    />
                                    <PhoneInput required={true}
                                                id="phone"
                                                className="input-field"
                                                country="BY"
                                                placeholder="375291119900"
                                                value={contactPhoneNumber}
                                                onChange={setContactPhoneNumber}
                                    />
                            </div>
                        </div>

                        <label className="section-label">Устройство</label>

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
                                onChange={e => setCustomModelName(e.target.value)}
                            />
                        )}

                        {/* Галочка ручного ввода доступна, только если модель не задана жестко услугой */}
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
                            style={{marginTop: '10px'}}
                        />
                    </div>

                    {/* БЛОК 2: ОПИСАНИЕ И ФОТО */}
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
                                            <img src={item.previewUrl} alt="preview" />
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
    );
};