import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
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
import type {ReviewDto} from "../api/reviewsApi.ts";


export const ManagersServiceDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- Состояние данных ---
    // const [service, setService] = useState<ServiceDetailsDto | null>(null);
    const [reviews, setReviews] = useState<ReviewDto[]>([]);

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

    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 1. ЗАГРУЗКА ВСЕХ ДАННЫХ
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        setToken(token);
        const loadData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Грузим параллельно справочники и саму услугу
                const [cats, types, manufs, serviceData] = await Promise.all([
                    categoriesApi.getAllServiceCategories(token),
                    deviceTypesApi.getAllDeviceTypes(token),
                    manufacturersApi.getAllManufacturers(token),
                    servicesApi.getServiceById(token, id)
                ]);

                setCategories(cats);
                setDeviceTypes(types);
                setManufacturers(manufs);
                // setService(serviceData);
                setReviews(serviceData.reviews);

                // Заполняем форму данными с бэка
                setFormData({
                    name: serviceData.name,
                    description: serviceData.description || '',
                    price: serviceData.price,
                    warrantyPeriod: serviceData.warrantyPeriod,
                    isAvailable: serviceData.isAvailable,
                    categoryId: serviceData.categoryId,
                    deviceTypeId: serviceData.deviceTypeId,
                    manufacturerId: serviceData.manufacturerId || '',
                    deviceModelId: serviceData.deviceModelId || ''
                });


                if (serviceData.deviceTypeId) {
                    const modelsData = await deviceModelsApi.getDeviceModelsByTypeAndManufacturer(
                        token,
                        serviceData.deviceTypeId,
                        serviceData.manufacturerId || undefined
                    );
                    setModels(modelsData);
                }

            } catch (error) {
                console.log("Ошибка загрузки данных", error);
                alert("Не удалось загрузить услугу");
                navigate('/manager/services');
            } finally {
                console.log("fd", formData)
                setIsLoading(false);
            }
        };
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

        try {
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

            await servicesApi.updateService(token, command);
            alert("Изменения сохранены!");
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении");
        }
    };

    // --- УДАЛЕНИЕ УСЛУГИ ---
    const handleDeleteService = async () => {
        if (!id) return;
        if (window.confirm("Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.")) {
            try {
                const command: DeleteServiceCommand = {
                    id: id
                }
                await servicesApi.deleteService(token, command);
                alert("Услуга удалена");
                navigate('/manager/services');
            } catch (error: any) {
                const msg = error.response?.data?.title || "Ошибка удаления (возможно, есть активные заявки)";
                alert(msg);
            }
        }
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="details-page-container">
                <div className="page-header">
                    <h1 className="details-title">Редактирование услуги</h1>
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
                            <button type="submit" className="action-button save-button">Сохранить</button>
                        </div>
                    </form>
                </div>

                {/* Блок Отзывов */}
                <div className="reviews-container card">
                    <h2 className="card-title">Отзывы клиентов ({reviews.length})</h2>
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <div key={review.id} className="review-item">
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <strong className="review-author">{review.clientName}</strong>
                                    </div>
                                    <div className="review-header">
                                        <span
                                            className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                        <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p style={{color: '#888', fontStyle: 'italic'}}>Отзывов пока нет</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};