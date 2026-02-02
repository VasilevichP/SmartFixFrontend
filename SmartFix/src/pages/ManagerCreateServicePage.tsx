import React, {useEffect, useState} from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/CreateServicePage.css';
import {categoriesApi, type Category} from "../api/categoriesApi.ts";
import {type CreateServiceCommand, servicesApi} from "../api/servicesApi.ts";
import {useNavigate} from "react-router-dom";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";

export const ManagerCreateServicePage: React.FC = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const tempToken = localStorage.getItem("token");
        if (!tempToken) {
            navigate('/');
            return;
        }
        setToken(tempToken);
        const loadStaticData = async () => {
            try {
                const [cats, types, manufs] = await Promise.all([
                    categoriesApi.getAllServiceCategories(token as string),
                    deviceTypesApi.getAllDeviceTypes(token as string),
                    manufacturersApi.getAllManufacturers(token as string)
                ]);
                setCategories(cats);
                setDeviceTypes(types);
                setManufacturers(manufs);
            } catch (err) {
                console.log("Ошибка загрузки справочников", err);
                setError("Не удалось загрузить справочники. Проверьте соединение.");
            }
        };
        loadStaticData();
    }, [navigate]);

    // Состояние формы
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        deviceTypeId: '',
        manufacturerId: '',
        deviceModelId: '',
        description: '',
        price: '',
        warrantyPeriod: '',
        isAvailable: true
    });

    useEffect(() => {
        const loadModels = async () => {
            // Грузим модели только если выбран Тип (как минимум)
            if (formData.deviceTypeId) {
                try {
                    // Передаем пустую строку как undefined, если производитель не выбран
                    const manufId = formData.manufacturerId || undefined;
                    const data = await deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token as string, formData.deviceTypeId, manufId);
                    setModels(data);
                } catch (err) {
                    console.error("Ошибка загрузки моделей", err);
                }
            } else {
                setModels([]); // Если тип не выбран, список моделей пуст
            }
        };
        loadModels();
    }, [formData.deviceTypeId, formData.manufacturerId]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {id, value} = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, isAvailable: e.target.checked}));
    };

    // Спец. обработчик для Типа (сбрасываем дочерние поля)
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            deviceTypeId: value,
            manufacturerId: '', // Сброс бренда
            deviceModelId: ''   // Сброс модели
        }));
    };

    // Спец. обработчик для Производителя (сбрасываем модель)
    const handleManufacturerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            manufacturerId: value,
            deviceModelId: ''   // Сброс модели, т.к. список моделей изменится
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Простая валидация
        if (!formData.name || !formData.categoryId || !formData.price || !formData.warrantyPeriod) {
            setError("Пожалуйста, заполните все обязательные поля");
            setIsLoading(false);
            return;
        }

        try {
            // Формируем объект для отправки (DTO)
            const command: CreateServiceCommand = {
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                deviceTypeId: formData.deviceTypeId,
                manufacturerId: formData.manufacturerId,
                deviceModelId: formData.deviceModelId,
                price: parseFloat(formData.price),
                warrantyPeriod: parseInt(formData.warrantyPeriod)
            };

            await servicesApi.createService(token as string, command);

            navigate('/manager/services');
        } catch (err: any) {
            console.log("Ошибка создания услуги", err);
            const msg = err.response?.data || "Произошла ошибка при создании услуги";
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setFormData(prev => ({
            ...prev,
            name: '',
            categoryId: '',
            deviceTypeId: '',
            manufacturerId: '',
            deviceModelId: '',
            description: '',
            price: '',
            warrantyPeriod: '',
            isAvailable: true
        }));
    };


    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="form-header">
                    <h1 className="form-title">Создание новой услуги</h1>
                    <p className="form-subtitle">Заполните все поля, чтобы добавить услугу в каталог</p>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="name" className="form-label">Название услуги</label>
                                <input type="text" id="name" className="form-input"
                                       required={true} value={formData.name} onChange={handleChange}
                                       placeholder="Например, Замена экрана iPhone 14 Pro"/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="categoryId" className="form-label">Категория</label>
                                <select id="categoryId" className="form-select"
                                        value={formData.categoryId}
                                        onChange={handleChange} required={true}>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="deviceTypeId" className="form-label">Тип устройства *</label>
                                <select
                                    id="deviceTypeId"
                                    className="form-select"
                                    value={formData.deviceTypeId}
                                    onChange={handleTypeChange} // Каскадный сброс
                                    required
                                >
                                    <option value="">Выберите тип...</option>
                                    {deviceTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Производитель (Опционально, но желательно) */}
                            <div className="input-group">
                                <label htmlFor="manufacturerId" className="form-label">Производитель (Бренд)</label>
                                <select
                                    id="manufacturerId"
                                    className="form-select"
                                    value={formData.manufacturerId}
                                    onChange={handleManufacturerChange} // Каскадный сброс модели
                                    disabled={!formData.deviceTypeId} // Блокируем, пока не выбран тип
                                >
                                    <option value="">Любой / Не выбран</option>
                                    {manufacturers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Модель (Опционально) */}
                            <div className="input-group full-width">
                                <label htmlFor="deviceModelId" className="form-label">
                                    Конкретная модель
                                    <span className="hint-text"> (Выберите, если услуга уникальна для модели)</span>
                                </label>
                                <select
                                    id="deviceModelId"
                                    className="form-select"
                                    value={formData.deviceModelId}
                                    onChange={handleChange}
                                    disabled={!formData.deviceTypeId} // Модели зависят от типа
                                >
                                    <option value="">Подходит для всех моделей выбранного бренда/типа</option>
                                    {models.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="price" className="form-label">Цена (руб.)</label>
                                <input type="number" id="price" className="form-input"
                                       placeholder="100.00" step="0.01"
                                       value={formData.price} onChange={handleChange} required={true}
                                       />
                            </div>

                            <div className="input-group">
                                <label htmlFor="warrantyPeriod" className="form-label">Срок гарантии (месяцы)</label>
                                <input type="number" id="warrantyPeriod" className="form-input"
                                       required={true} placeholder="Срок гарантии"
                                       value={formData.warrantyPeriod} onChange={handleChange}/>
                            </div>
                            <div className="input-group full-width">
                                <label htmlFor="description" className="form-label">Подробное описание</label>
                                <textarea id="description" className="form-textarea"
                                          placeholder="Опишите, что входит в услугу, какие детали используются и т.д."
                                          rows={4} value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="checkbox-group full-width">
                                <label htmlFor="is-available" className="checkbox-label">Сделать услугу доступной для
                                    клиентов сразу</label>
                                <input type="checkbox" id="is-available" className="form-checkbox"
                                       checked={formData.isAvailable} onChange={handleCheckboxChange}/>
                            </div>
                        </div>
                        <p>{error}</p>
                        <div className="form-actions">
                            <button type="button" className="action-button cancel-button" onClick={handleReset}>Очистить форму</button>
                            <button type="submit" className="action-button submit-button" disabled={isLoading}>
                                {isLoading ? 'Сохранение...' : 'Создать услугу'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
