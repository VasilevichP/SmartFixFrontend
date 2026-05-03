import {useEffect, useState} from "react";
import {
    CATEGORY_NUMBER_MAP,
    type DiscountDto,
    loyaltyProgramsApi,
    type PromoCodeDto, TYPE_NUMBER_MAP
} from "../api/loyaltyProgramsApi.ts";
import {useNavigate} from "react-router-dom";
import ManagerHeader from "../components/ManagerHeader.tsx";

export const ManagerLoyaltyProgramsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [activeTab, setActiveTab] = useState<'discounts' | 'promocodes'>('discounts');
    const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCodeDto[]>([]);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        loadData();
    }, [activeTab]);

    const fetchDiscounts = async (token: string) => {
        try {
            setIsLoading(true);

            const data = await loyaltyProgramsApi.getAllDiscounts(token);
            setDiscounts(data);
        } catch (error) {
            console.log("Не удалось загрузить список скидок", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPromos = async (token: string) => {
        try {
            setIsLoading(true);

            const data = await loyaltyProgramsApi.getAllPromoCodes(token);
            console.log(data);
            setPromoCodes(data);
        } catch (error) {
            console.log("Не удалось загрузить список промокодов", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadData = async () => {
        if (activeTab === 'discounts') {
            await fetchDiscounts(token);
        } else {
            await fetchPromos(token);
        }
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <main className="content-area" style={{width: '100%',margin:'24px 0'}}>

                    <div className="content-header">
                        <h1 className="page-title">Программы лояльности</h1>
                        <button
                            className="add-button"
                            onClick={() => navigate(activeTab === 'discounts' ? '/manager/loyaltyPrograms/discount/create' : '/manager/loyaltyPrograms/promo/create')}
                        >
                            <span>+</span> Добавить {activeTab === 'discounts' ? 'скидку' : 'промокод'}
                        </button>
                    </div>

                    {/* Табы переключения */}
                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeTab === 'discounts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('discounts')}
                        >
                            Скидки
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'promocodes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('promocodes')}
                        >
                            Промокоды
                        </button>
                    </div>

                    <div className="table-card">
                        {(isLoading) ? (
                            <p style={{padding: '40px', textAlign: 'center'}}>Загрузка...</p>
                        ) : activeTab === 'discounts' ? (
                            <div className="table-scroll-wrapper">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Категория</th>
                                        <th>Тип</th>
                                        <th>Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {discounts.map(d => (
                                        <tr key={d.id}
                                            onClick={() => navigate(`/manager/loyaltyPrograms/discount/${d.id}`)}>
                                            <td style={{fontWeight: 500}}>{d.name}</td>
                                            <td>{CATEGORY_NUMBER_MAP[d.category]}</td>
                                            <td>{TYPE_NUMBER_MAP[d.type]}</td>
                                            <td>
                                                    <span
                                                        className={`status-badge ${d.isActive ? 'status-available' : 'status-hidden'}`}>
                                                        {d.isActive ? 'Активна' : 'Отключена'}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {discounts.length === 0 && <tr>
                                        <td colSpan={6} style={{textAlign: 'center'}}>Скидок нет</td>
                                    </tr>}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // ТАБЛИЦА ПРОМОКОДОВ
                            <div className="table-scroll-wrapper">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Код</th>
                                        <th>Действует до</th>
                                        <th>Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {promoCodes.map(p => (
                                        <tr key={p.id}
                                            onClick={() => navigate(`/manager/loyaltyPrograms/promo/${p.id}`)}>
                                            <td style={{fontWeight: 'bold', color: '#2563eb'}}>{p.code}</td>
                                            <td>{new Date(p.expirationDate).toLocaleDateString()}</td>
                                            <td>
                                                    <span
                                                        className={`status-badge ${p.isValid ? 'status-available' : 'status-hidden'}`}>
                                                        {p.isValid ? 'Действителен' : 'Недействителен'}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {promoCodes.length === 0 && <tr>
                                        <td colSpan={5} style={{textAlign: 'center'}}>Промокодов нет</td>
                                    </tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}