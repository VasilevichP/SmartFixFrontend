import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {type MasterDto, mastersApi} from "../api/mastersApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" className="filter-icon">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

export const ManagerMastersPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [masters, setMasters] = useState<MasterDto[]>([]);
    const [showFilters, setShowFilters] = useState(true);

    // Фильтры
    const [searchName, setSearchName] = useState("");
    const [searchPhone, setSearchPhone] = useState("");
    const [includeDeleted, setIncludeDeleted] = useState(false);

    const loadData = async () => {
        try {
            setIsLoading(true);

            const data = await mastersApi.getAllMasters(token, {
                nameSearch: searchName,
                phoneSearch: searchPhone
            });
            setMasters(data);
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
    }, [searchName, searchPhone, includeDeleted]);

    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        setSearchName("");
        setSearchPhone("");
        setIncludeDeleted(false);
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <div className="page-wrapper">

                    {/* САЙДБАР С ФИЛЬТРАМИ */}
                    {showFilters && (
                        <aside className="filters-sidebar">
                            <div className="filters-header">
                                <h3 className="filters-title">Поиск</h3>
                                <a href="#" onClick={handleReset} className="reset-link">Сбросить</a>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">ФИО мастера</label>
                                <input type="text" className="search-input" placeholder="Иванов Иван..."
                                       value={searchName} onChange={(e) => setSearchName(e.target.value)}/>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Номер телефона</label>
                                <input type="text" className="search-input" placeholder="+375..."
                                       value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)}/>
                            </div>
                        </aside>
                    )}

                    {/* КОНТЕНТ (ТАБЛИЦА) */}
                    <main className="content-area">
                        <div className="content-header">
                            <div className="content-header-left">
                                <button className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                                        onClick={() => setShowFilters(!showFilters)}>
                                    <FilterIcon/> <span>Фильтры</span>
                                </button>
                                <h1 className="page-title">Мастера</h1>
                            </div>
                            <button className="add-button" onClick={() => navigate('/manager/masters/create')}>
                                <span>+</span> Добавить мастера
                            </button>
                        </div>

                        <div className="table-card">
                            {isLoading ? (
                                <p style={{padding: '40px', textAlign: 'center'}}>Загрузка...</p>
                            ) : (
                                <div className="table-scroll-wrapper">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>ФИО</th>
                                            <th>Телефон</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {masters?.map(m => (
                                            <tr key={m.id} onClick={() => navigate(`/manager/masters/${m.id}`)}>
                                                <td style={{fontWeight: 500}}>{m.name}</td>
                                                <td>{m.phoneNumber}</td>
                                            </tr>
                                        ))}
                                        {(!masters || masters.length === 0) && (
                                            <tr>
                                                <td colSpan={5} style={{textAlign: 'center', padding: '30px'}}>Мастеров
                                                    не найдено
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