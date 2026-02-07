import React, {useEffect, useState} from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ManagerPages.css';
import {useNavigate} from "react-router-dom";
import {type RequestDto, requestsApi} from "../api/requestsApi.ts";

const getStatusName = (status: number) => {
    switch (status) {
        case 0:
            return 'Новая';
        case 1:
            return 'Диагностика';
        case 2:
            return 'В работе';
        case 3:
            return 'Готова';
        case 4:
            return 'Закрыта';
        case 5:
            return 'Отменена';
        default:
            return 'Неизвестно';
    }
};

// Хелпер для статусов (цвет)
const getStatusClassName = (status: number) => {
    switch (status) {
        case 0:
            return 'status-new';        // Синий/Зеленый
        case 1:
            return 'status-diagnostics'; // Желтый
        case 2:
            return 'status-in-progress'; // Оранжевый
        case 3:
            return 'status-ready';      // Зеленый
        case 4:
            return 'status-closed';     // Серый
        case 5:
            return 'status-cancelled';  // Красный
        default:
            return '';
    }
};

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="filter-icon">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

export const ManagerRequestsPage: React.FC = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [requests, setRequests] = useState<RequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true);

    // --- ФИЛЬТРЫ ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // "all" или число (0,1,2...)
    const [sortOrder, setSortOrder] = useState("0"); // 0=Новые, 1=Старые

    // Функция загрузки
    const fetchRequests = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            setIsLoading(true);
            const data = await requestsApi.getAllRequestsForManager(token, {
                searchTerm: searchQuery,
                status: statusFilter !== "all" ? parseInt(statusFilter) : undefined,
                sortOrder: sortOrder
            });
            setRequests(data);
        } catch (error) {
            console.error("Ошибка загрузки заявок", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Дебаунс для поиска
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Обновление при смене фильтров
    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, sortOrder]);

    // Сброс фильтров
    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setSearchQuery("");
        setStatusFilter("all");
        setSortOrder("0");
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <div className="page-wrapper">

                    {/* --- САЙДБАР ФИЛЬТРОВ --- */}
                    {showFilters && (
                        <aside className="filters-sidebar">
                            <div className="filters-header">
                                <h3 className="filters-title">Фильтры</h3>
                                <a href="#" onClick={handleReset} className="reset-link">Сбросить</a>
                            </div>

                            {/* Поиск */}
                            <div className="filter-group">
                                <label className="filter-label">Поиск</label>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Клиент, устройство, услуга..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Статус */}
                            <div className="filter-group">
                                <label className="filter-label">Статус</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="0">Новая</option>
                                    <option value="1">На диагностике</option>
                                    <option value="2">В работе</option>
                                    <option value="3">Готова к выдаче</option>
                                    <option value="4">Закрыта</option>
                                    <option value="5">Отменена</option>
                                </select>
                            </div>

                            {/* Сортировка */}
                            <div className="filter-group">
                                <label className="filter-label">Сортировка</label>
                                <select
                                    className="filter-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="0">Сначала новые</option>
                                    <option value="1">Сначала старые</option>
                                </select>
                            </div>
                        </aside>
                    )}

                    {/* --- КОНТЕНТ --- */}
                    <main className="content-area">
                        <div className="content-header">
                            <div className="content-header-left">
                                <button
                                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    title={showFilters ? "Скрыть фильтры" : "Показать фильтры"}
                                >
                                    <FilterIcon/>
                                    <span>Фильтры</span>
                                </button>
                                <h1 className="page-title">Заявки</h1>
                            </div>
                            {/* Здесь можно добавить кнопку "Экспорт в Excel" если нужно */}
                        </div>

                        <div className="table-card">
                            {isLoading ? (
                                <p style={{padding: '40px', textAlign: 'center', color: '#666'}}>Загрузка...</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Клиент</th>
                                        <th>Услуга / Устройство</th>
                                        <th>Дата</th>
                                        <th>Исполнитель</th>
                                        <th>Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {requests.length > 0 ? (
                                        requests.map((request) => (
                                            <tr key={request.id}
                                                onClick={() => navigate(`/manager/requests/${request.id}`)}>
                                                <td style={{fontWeight: 500}}>{request.clientName}</td>
                                                <td>
                                                    <div>{request.serviceName}</div>
                                                    <div style={{fontSize: '0.85em', color: '#888'}}>
                                                        {request.deviceModelName || "Устройство не указано"}
                                                    </div>
                                                </td>
                                                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                                                <td>{request.specialistName}</td>
                                                <td>
                                                <span className={`status-badge ${getStatusClassName(request.status)}`}>
                                                    {getStatusName(request.status)}
                                                </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5}
                                                style={{textAlign: 'center', padding: '30px', color: '#888'}}>
                                                Заявок не найдено
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};