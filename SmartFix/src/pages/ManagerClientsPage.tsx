import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {CLIENT_STATUS_NUMBER_MAP, type ClientBriefDto, clientsApi} from "../api/clientsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

export const ManagerClientsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [clients, setClients] = useState<ClientBriefDto[]>([]);
    const [showFilters, setShowFilters] = useState(true);


    const[nameSearch, setNameSearch] = useState("");
    const[phoneSearch, setPhoneSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const[sortOrder, setSortOrder] = useState("1"); // 1 - А-Я, 2 - Я-А

    const loadData = async () => {
        try {
            setIsLoading(true);

            const data = await clientsApi.getAllClients(token, {
                nameSearch,
                phoneSearch,
                status: statusFilter !== "all" ? parseInt(statusFilter) : undefined,
                sortOrder
            });
            setClients(data);
        } catch (error) {
            console.log("Не удалось загрузить список мастеров", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        const timer = setTimeout(() => {
            loadData();
        }, 500);

        return () => clearTimeout(timer);
    }, [nameSearch, phoneSearch, statusFilter, sortOrder]);

    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setNameSearch("");
        setPhoneSearch("");
        setStatusFilter("all");
        setSortOrder("1");
    };

    return (
        <div>
            <ManagerHeader />
            <div className="page-container">
                <div className="page-wrapper">

                    {showFilters && (
                        <aside className="filters-sidebar">
                            <div className="filters-header">
                                <h3 className="filters-title">Поиск</h3>
                                <a href="#" onClick={handleReset} className="reset-link">Сбросить</a>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">ФИО</label>
                                <input type="text" className="search-input" placeholder="Иванов"
                                       value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Телефон</label>
                                <input type="text" className="search-input" placeholder="+375..."
                                       value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Статус</label>
                                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">Все статусы</option>
                                    <option value="0">Новый</option>
                                    <option value="1">Постоянный</option>
                                    <option value="2">VIP-клиент</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Сортировка</label>
                                <select className="filter-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                    <option value="1">ФИО (А-Я)</option>
                                    <option value="2">ФИО (Я-А)</option>
                                </select>
                            </div>
                        </aside>
                    )}

                    <main className="content-area">
                        <div className="content-header">
                            <div className="content-header-left">
                                <button className={`filter-toggle-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                                    <FilterIcon /> <span>Фильтры</span>
                                </button>
                                <h1 className="page-title">Клиенты</h1>
                            </div>
                            <button className="add-button" onClick={() => navigate('/manager/clients/create')}>
                                <span>+</span> Добавить клиента
                            </button>
                        </div>

                        <div className="table-card">
                            {isLoading ? (
                                <p style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</p>
                            ) : (
                                <div className="table-scroll-wrapper">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>ФИО</th>
                                            <th>Телефон</th>
                                            <th>Email</th>
                                            <th>Статус</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {clients?.map(c => (
                                            <tr key={c.id} onClick={() => navigate(`/manager/clients/${c.id}`)}>
                                                <td style={{fontWeight: 500}}>{c.name}</td>
                                                <td>{c.phone}</td>
                                                <td>{c.email}</td>
                                                <td>
                                                        <span className={`status-badge ${c.status === 2 ? 'status-diagnostics' : 'status-new'}`}>
                                                            {CLIENT_STATUS_NUMBER_MAP[c.status]}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!clients || clients.length === 0) && (
                                            <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px'}}>Клиентов не найдено</td></tr>
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