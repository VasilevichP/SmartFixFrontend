import React, {useEffect, useState} from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ManagerPages.css';
import {useNavigate} from "react-router-dom";
import {servicesApi, type Service} from "../api/servicesApi.ts";
import {categoriesApi, type Category} from "../api/categoriesApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";

const getAvailabilityClassName = (isAvailable: boolean) => {
    return isAvailable ? 'status-available' : 'status-hidden';
};
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="filter-icon">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);
export const ManagerServicesPage: React.FC = () => {
    const navigate = useNavigate();
    const [showFilters, setShowFilters] = useState(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<DeviceType[]>([]);
    const [manufs, setManufs] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [manufFilter, setManufFilter] = useState("all");
    const [modelFilter, setModelFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("0");
    const fetchServices = async (token: string) => {
        try {
            setIsLoading(true);

            const params = {
                searchTerm: searchQuery.toLowerCase(),
                status: statusFilter,
                sortOrder: sortOrder,
                categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
                deviceTypeId: typeFilter !== 'all' ? typeFilter : undefined,
                manufacturerId: manufFilter !== 'all' ? manufFilter : undefined,
                deviceModelId: modelFilter !== 'all' ? modelFilter : undefined,
            };

            const data = await servicesApi.getAllServicesForManager(token, params);
            setServices(data);
        } catch (error) {
            console.log("Не удалось загрузить список услуг", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const loadDictionaries = async () => {
            try {
                const [cats, types, manufs] = await Promise.all([
                    categoriesApi.getAllServiceCategories(token),
                    deviceTypesApi.getAllDeviceTypes(token),
                    manufacturersApi.getAllManufacturers(token),
                ]);
                setCategories(cats);
                setTypes(types);
                setManufs(manufs);
            } catch (e) {
                console.log("Ошибка загрузки справочников", e);
            }
        };
        loadDictionaries();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchServices(token)
    }, [statusFilter, categoryFilter, typeFilter, manufFilter, modelFilter, sortOrder, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const loadModels = async () => {
            const typeId = typeFilter !== 'all' ? typeFilter : undefined;
            const manufId = manufFilter !== 'all' ? manufFilter : undefined;

            // Грузим модели, только если выбран хотя бы тип (или можно разрешить грузить все, если бэк позволяет)
            if (typeId) {
                try {
                    const data = await deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token, typeId, manufId);
                    setModels(data);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setModels([]); // Очищаем модели, если тип не выбран
            }
        };
        loadModels();
    }, [typeFilter, manufFilter]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        ;
        const delayDebounceFn = setTimeout(() => {
            fetchServices(token);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'all') {
            setStatusFilter(undefined);
        } else if (val === 'true') {
            setStatusFilter(true);
        } else if (val === 'false') {
            setStatusFilter(false);
        }
    };

    const currentStatusValue = statusFilter === undefined ? 'all' : statusFilter.toString();

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTypeFilter(e.target.value);
        setManufFilter("all"); // Сброс бренда
        setModelFilter("all"); // Сброс модели
    };

    const handleManufChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setManufFilter(e.target.value);
        setModelFilter("all"); // Сброс модели при смене бренда
    };
    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setSearchQuery("");
        setStatusFilter(undefined);
        setCategoryFilter("all");
        setTypeFilter("all");
        setManufFilter("all"); // Сброс бренда
        setModelFilter("all");
        setSortOrder("0");
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">

                <div className="page-wrapper">

                    {showFilters && (
                        <aside className="filters-sidebar">
                            <div className="filters-header">
                                <h3 className="filters-title">Фильтры</h3>
                                <a href="#" onClick={handleReset} className="reset-link">Сбросить</a>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Поиск</label>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Название или категория..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Статус</label>
                                <select
                                    className="filter-select"
                                    value={currentStatusValue}
                                    onChange={handleStatusChange}
                                >
                                    <option value="all">Все</option>
                                    <option value="true">Доступные</option>
                                    <option value="false">Скрытые</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Категория</label>
                                <select
                                    className="filter-select"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="all">Все</option>
                                    {categories.map((category) => (
                                        <option value={category.id}>{category.name}</option>))}
                                </select>
                            </div>
                            {/* Тип устройства */}
                            <div className="filter-group">
                                <label className="filter-label">Тип устройства</label>
                                <select className="filter-select" value={typeFilter} onChange={handleTypeChange}>
                                    <option value="all">Все типы</option>
                                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            {/* Производитель */}
                            <div className="filter-group">
                                <label className="filter-label">Производитель</label>
                                <select
                                    className="filter-select"
                                    value={manufFilter}
                                    onChange={handleManufChange}
                                    disabled={typeFilter === 'all'} // Блокируем пока не выбран тип
                                >
                                    <option value="all">Все бренды</option>
                                    {manufs.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>

                            {/* Модель */}
                            <div className="filter-group">
                                <label className="filter-label">Модель</label>
                                <select
                                    className="filter-select"
                                    value={modelFilter}
                                    onChange={(e) => setModelFilter(e.target.value)}
                                    disabled={models.length === 0} // Блокируем если нет моделей
                                >
                                    <option value="all">Все модели</option>
                                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>


                            <div className="filter-group">
                                <label className="filter-label">Сортировка</label>
                                <select
                                    className="filter-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="0">По названию (А-Я)</option>
                                    <option value="1">По названию (Я-А)</option>
                                    <option value="2">По цене (сначала дешевле)</option>
                                    <option value="3">По цене (сначала дороже)</option>
                                </select>
                            </div>

                        </aside>
                    )};

                    {/* --- ПРАВАЯ КОЛОНКА: КОНТЕНТ --- */}
                    <main className="content-area">
                        <div className="content-header">
                            <div className="content-header-left">
                                <h1 className="page-title">Услуги</h1>
                                <button
                                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    title={showFilters ? "Скрыть фильтры" : "Показать фильтры"}
                                >
                                    <FilterIcon/>
                                    <span>Фильтры</span>
                                </button>
                            </div>
                            <button
                                className="add-button"
                                onClick={() => navigate('/manager/services/create')}
                            >
                                <span>+</span> Добавить услугу
                            </button>
                        </div>

                        <div className="table-card">
                            {isLoading ? (
                                <p style={{padding: '40px', textAlign: 'center', color: '#666'}}>Загрузка...</p>
                            ) : (
                                <div className="table-scroll-wrapper">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>Название услуги</th>
                                            <th>Категория</th>
                                            <th>Тип устройства</th>
                                            <th>Производитель</th>
                                            <th>Модель</th>
                                            <th>Цена (руб.)</th>
                                            <th>Статус</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {services.length > 0 ? (
                                            services.map((service) => (
                                                <tr key={service.id}
                                                    onClick={() => navigate(`/manager/services/${service.id}`)}>
                                                    <td>{service.name}</td>
                                                    <td>{service.categoryName ? service.categoryName : 'Без категории'}</td>
                                                    <td>{service.deviceTypeName}</td>
                                                    <td>{service.manufacturerName ? service.manufacturerName : 'Любой производитель'}</td>
                                                    <td>{service.deviceModelName ? service.deviceModelName : 'Любая модель'}</td>
                                                    <td>{service.price}</td>
                                                    <td>
                                                <span
                                                    className={`status-badge ${getAvailabilityClassName(service.isAvailable)}`}>
                                                    {service.isAvailable ? 'Доступна' : 'Скрыта'}
                                                </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6}
                                                    style={{textAlign: 'center', padding: '30px', color: '#888'}}>
                                                    По вашему запросу ничего не найдено
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );

};