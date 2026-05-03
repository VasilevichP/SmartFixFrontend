import React, {useEffect, useState} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ServiceDetailsPage.css';
import {
    type DeleteServiceCommand,
    servicesApi,
    type UpdateServiceCommand
} from "../api/servicesApi.ts";
import {categoriesApi, type Category} from "../api/categoriesApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {useApi} from "../hooks/useApi.ts";


export const ManagersServiceDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- Состояние формы ---
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        warrantyPeriod: '',
        isAvailable: false,
        categoryId: '',
        deviceTypeId: '',
        manufacturerId: '',
        deviceModelId: ''
    });

    // --- Справочники ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    const token = localStorage.getItem('token') || '';

    const [updateService, {isLoading: isServiceUpdated}] = useApi(servicesApi.updateService);
    const [deleteService] = useApi(servicesApi.deleteService);

    const loadDictionariesAndService = async () => {
        if (!id) return;
        const [cats, types, manufs, serviceData] = await Promise.all([
            categoriesApi.getAllServiceCategories(token),
            deviceTypesApi.getAllDeviceTypes(token),
            manufacturersApi.getAllManufacturers(token),
            servicesApi.getServiceById(token, id)
        ]);

        setCategories(cats);
        setDeviceTypes(types);
        setManufacturers(manufs);
        setFormData(serviceData);

        if (serviceData.deviceTypeId) {
            const modelsData = await deviceModelsApi.getDeviceModelsByTypeAndManufacturer(
                token,
                serviceData.deviceTypeId,
                serviceData.manufacturerId || undefined
            );
            setModels(modelsData);
        }
    };

    const [loadData, {isLoading}] = useApi(loadDictionariesAndService, false);

    // 1. ЗАГРУЗКА ВСЕХ ДАННЫХ
    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        if (!id) return;

        loadData();
    }, [id, navigate]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {id, value} = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, isAvailable: e.target.checked}));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            deviceTypeId: val,
            manufacturerId: '',
            deviceModelId: ''
        }));
        handleCascadeLoad(val, undefined);
    };

    const handleManufacturerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            manufacturerId: val,
            deviceModelId: ''
        }));
        handleCascadeLoad(formData.deviceTypeId, val);
    };

    // --- СОХРАНЕНИЕ ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const command: UpdateServiceCommand = {
            id: id,
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            warrantyPeriod: parseInt(formData.warrantyPeriod),
            isAvailable: formData.isAvailable,
            categoryId: formData.categoryId,
            deviceTypeId: formData.deviceTypeId,
            manufacturerId: formData.manufacturerId || undefined,
            deviceModelId: formData.deviceModelId || undefined
        };

        await updateService(token, command);

    };

    // --- УДАЛЕНИЕ УСЛУГИ ---
    const handleDeleteService = async () => {
        if (!id) return;
        if (window.confirm("Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.")) {

            const command: DeleteServiceCommand = {
                id: id
            }
            deleteService(token, command)
        }
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="details-page-container">
                <div className="service-details-page-header">
                    <Link to="/manager/services" className="back-link">&larr; К списку услуг</Link>
                    <h1 className="service-details-title">{formData.name}</h1>
                </div>

                <div className="form-container card">
                    <form id="service-details-form" onSubmit={handleSave}>

                        <div className="form-fields"
                        >
                            <div className="fields-row">
                                <div className="input-group">
                                    <label htmlFor="name" className="form-label">Название услуги</label>
                                    <input type="text" id="name" className="form-input" value={formData.name}
                                           onChange={handleChange} required/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="categoryId" className="form-label">Категория</label>
                                    <select id="categoryId" className="form-select" value={formData.categoryId}
                                            onChange={handleChange} required>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="fields-row">
                                <div className="input-group">
                                    <label htmlFor="deviceTypeId" className="form-label">Тип устройства</label>
                                    <select id="deviceTypeId" className="form-select" value={formData.deviceTypeId}
                                            onChange={handleTypeChange} required>
                                        <option value="">Выберите тип</option>
                                        {deviceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="manufacturerId" className="form-label">Производитель</label>
                                    <select id="manufacturerId" className="form-select" value={formData.manufacturerId}
                                            onChange={handleManufacturerChange} disabled={!formData.deviceTypeId}>
                                        <option value="">Любой / Не выбран</option>
                                        {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="fields-row">
                                <div className="input-group">
                                    <label htmlFor="deviceModelId" className="form-label">Модель (специфичная)</label>
                                    <select id="deviceModelId" className="form-select" value={formData.deviceModelId}
                                            onChange={handleChange} disabled={!formData.deviceTypeId}>
                                        <option value="">Подходит для всех моделей бренда</option>
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="fields-row">
                                <div className="input-group">
                                    <label htmlFor="price" className="form-label">Цена (руб.)</label>
                                    <input type="number" id="price" className="form-input" value={formData.price}
                                           onChange={handleChange} step="0.01" required={true}/>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="warrantyPeriod" className="form-label">Гарантия (мес.)</label>
                                    <input type="number" id="warrantyPeriod" className="form-input"
                                           value={formData.warrantyPeriod} onChange={handleChange}/>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="description" className="form-label">Описание</label>
                                <textarea id="description" className="form-textarea" rows={5}
                                          value={formData.description} onChange={handleChange}></textarea>
                            </div>

                            <div className="checkbox-group">
                                <input type="checkbox" id="isAvailable" className="form-checkbox"
                                       checked={formData.isAvailable} onChange={handleCheckboxChange}/>
                                <label htmlFor="isAvailable" className="checkbox-label">Услуга доступна для
                                    клиентов</label>
                            </div>
                        </div>

                        <div className="header-actions">
                            <button type="button" className="action-button delete-button"
                                    onClick={handleDeleteService}>Удалить услугу
                            </button>
                            <button type="submit" className="action-button save-button">{isServiceUpdated?'Идет сохранение...':'Сохранить'}</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};