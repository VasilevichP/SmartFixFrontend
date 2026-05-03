import React, {useEffect, useState} from 'react';
import '../styles/ClientCatalog.css';
import ClientHeader from "../components/ClientHeader.tsx";
import {useNavigate} from "react-router-dom";
import {categoriesApi, type Category} from "../api/categoriesApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModel, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {type ServiceForClient, servicesApi, type ServicesClientFilterParams} from "../api/servicesApi.ts";
import {CreateRequestModal} from "../components/CreateRequestModal.tsx";

export const ClientCatalogPage: React.FC = () => {
    var navigate = useNavigate();
    const [services, setServices] = useState<ServiceForClient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Флаг: искал ли пользователь что-то

    const [categories, setCategories] = useState<Category[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModel[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedManuf, setSelectedManuf] = useState("");
    const [selectedModel, setSelectedModel] = useState("");

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const token = localStorage.getItem('token') || "";

    useEffect(() => {
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
                setDeviceTypes(types);
                setManufacturers(manufs);
            } catch (e) {
                console.log("Ошибка загрузки справочников", e);
            }
        };
        loadDictionaries();
    }, []);

    useEffect(() => {
        const loadModels = async () => {
            if (selectedType && selectedManuf) {
                try {
                    const data = await deviceModelsApi.getDeviceModelsByTypeAndManufacturer(token, selectedType, selectedManuf);
                    setModels(data);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setModels([]);
            }
        };
        loadModels();
    }, [selectedType, selectedManuf]);

    const fetchServices = async () => {
        const isFilterActive = selectedCategory || selectedType || searchQuery;

        if (!isFilterActive) {
            setServices([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        try {
            const filters: ServicesClientFilterParams = {
                searchTerm: searchQuery,
                categoryId: selectedCategory || undefined,
                deviceTypeId: selectedType || undefined,
                manufacturerId: selectedManuf || undefined,
                deviceModelId: selectedModel || undefined
            }
            const data = await servicesApi.getAllServicesForClient(token, filters);
            setServices(data);
            setCurrentPage(1); // Сброс на первую страницу при новом поиске
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [selectedCategory, selectedModel, selectedType, selectedManuf]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) fetchServices();
        }, 600);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
        setSelectedManuf(""); // Сброс бренда
        setSelectedModel(""); // Сброс модели
    };

    const handleManufChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedManuf(e.target.value);
        setSelectedModel(""); // Сброс модели
    };

    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setSelectedCategory("");
        setSelectedType("");
        setSelectedManuf("");
        setSelectedModel("");
        setSearchQuery("");
    }

    const openIndividual = () => {
        setModalData(null);
        setIsRequestModalOpen(true);
    };

    const handleBookService = (e: React.MouseEvent, service: ServiceForClient) => {
        e.stopPropagation(); // Отменяем переход на страницу деталей
        setModalData({
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            deviceTypeId: service.deviceTypeId,
            deviceModelId: service.deviceModelId,
            manufacturerId: service.manufacturerId
        });
        setIsRequestModalOpen(true);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServices = services.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(services.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <ClientHeader/>
            <div className="catalog-page-container">

                {/* --- ПОИСК --- */}
                <div className="search-bar-container">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Например: Замена экрана..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                  clipRule="evenodd"/>
                        </svg>
                    </div>
                </div>

                <div className="catalog-layout">
                    {/* --- ЛЕВАЯ КОЛОНКА: ФИЛЬТРЫ --- */}
                    <aside className="client-filters-sidebar">
                        <div className="filters-header">
                            <h3 className="filters-title">Фильтры</h3>
                            <a href="#" onClick={handleReset} className="reset-link">Сбросить</a>
                        </div>

                        {/* 1. Категория работ */}
                        <div className="filter-group">
                            <label className="filter-label">Категория услуги</label>
                            <select className="filter-select" value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="">Все категории</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <hr style={{border: 0, borderTop: '1px solid #eee', margin: '15px 0'}}/>
                        <div style={{fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: '#555'}}>Ваше
                            устройство:
                        </div>

                        {/* 2. Тип устройства */}
                        <div className="filter-group">
                            <label className="filter-label">Тип</label>
                            <select className="filter-select" value={selectedType} onChange={handleTypeChange}>
                                <option value="">Не выбрано</option>
                                {deviceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        {/* 3. Производитель */}
                        <div className="filter-group">
                            <label className="filter-label">Бренд</label>
                            <select
                                className="filter-select"
                                value={selectedManuf}
                                onChange={handleManufChange}
                                disabled={!selectedType}
                            >
                                <option value="">Любой</option>
                                {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        {/* 4. Модель */}
                        <div className="filter-group">
                            <label className="filter-label">Модель</label>
                            <select
                                className="filter-select"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                disabled={models.length === 0}
                            >
                                <option value="">Любая / Не знаю</option>
                                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </aside>

                    {/* --- ПРАВАЯ КОЛОНКА: СПИСОК --- */}
                    <main className="services-content">

                        {/* Блок "Индивидуальная заявка" (Всегда сверху) */}
                        <div className="individual-request-banner" onClick={openIndividual}>
                            <div className="banner-icon">🛠️</div>
                            <div className="banner-text">
                                <h3>Не нашли нужную услугу?</h3>
                                <p>Оформите индивидуальную заявку, и мы рассчитаем стоимость ремонта вашего
                                    устройства.</p>
                            </div>
                            <button className="banner-button">Оформить заявку</button>
                        </div>

                        {/* Список услуг */}
                        {isLoading ? (
                            <p style={{textAlign: 'center', padding: '40px', color: '#666'}}>Поиск услуг...</p>
                        ) : !hasSearched ? (
                            <div style={{textAlign: 'center', padding: '60px', color: '#888'}}>
                                <h2>Выберите категорию или устройство</h2>
                                <p>Чтобы увидеть доступные услуги, воспользуйтесь фильтрами слева.</p>
                            </div>
                        ) : services.length > 0 ? (
                            <div className="services-grid">
                                {currentServices.map(service => (
                                    <div key={service.id} className="service-card"
                                         onClick={() => navigate(`/catalog/${service.id}`)}>

                                        <div className="card-content">
                                            <div>
                                                <span className="card-category">{service.categoryName}</span>

                                                <h3 className="card-title">{service.name}</h3>
                                            </div>
                                            <div className="card-middle">
                                                <div className="device-info-container">
                                                    <div className="device-info-badge">
                                                        Устройство: {service.deviceTypeName}
                                                    </div>
                                                    <div className="device-info-badge">
                                                        Бренд: {service.manufacturerName ? service.manufacturerName : 'Любой'}
                                                    </div>
                                                    <div className="device-info-badge">
                                                        Модель: {service.deviceModelName ? service.deviceModelName : 'Любая'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer">
                                                <span className="card-price">{service.price} руб.</span>
                                                <button className="action-button save-button small-btn" onClick={(e) => handleBookService(e, service)}>
                                                    Заказать
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                                <h3>Ничего не найдено</h3>
                                <p>Попробуйте изменить параметры фильтрации или оформите индивидуальную заявку.</p>
                            </div>
                        )}

                        {/* Пагинация */}
                        {services.length > itemsPerPage && (
                            <nav className="pagination-container">
                                <button
                                    className="pagination-button"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    &laquo; Назад
                                </button>

                                {Array.from({length: totalPages}, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => paginate(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    className="pagination-button"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Вперед &raquo;
                                </button>
                            </nav>
                        )}
                    </main>
                </div>
                <CreateRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    initialData={modalData}
                />
            </div>
        </div>
    );
};