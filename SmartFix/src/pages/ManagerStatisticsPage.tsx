import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/StatisticsPage.css';

// Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';

// API и Утилиты
import {
    statisticsApi,
    type GeneralStatsDto,
    type ServicesStatsDto,
    type SpecialistsStatsDto,
    type ClientsStatsDto
} from '../api/statisticsApi';
import {STATUS_NAME_MAP} from "../api/requestsApi.ts";

// Регистрация компонентов графиков
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement
);

export const ManagerStatisticsPage: React.FC = () => {
    const navigate = useNavigate();

    // --- STATE: ФИЛЬТРЫ ---
    const [period, setPeriod] = useState("month");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    // --- STATE: ВКЛАДКИ ---
    const [activeTab, setActiveTab] = useState<'general' | 'services' | 'specialists' | 'clients'>('general');
    const [isLoading, setIsLoading] = useState(false);

    // --- STATE: ДАННЫЕ (Храним отдельно, чтобы не перетирать при переключении) ---
    const [generalData, setGeneralData] = useState<GeneralStatsDto | null>(null);
    const [servicesData, setServicesData] = useState<ServicesStatsDto | null>(null);
    const [specData, setSpecData] = useState<SpecialistsStatsDto | null>(null);
    const [clientsData, setClientsData] = useState<ClientsStatsDto | null>(null);

    // --- ЗАГРУЗКА ДАННЫХ ---
    const fetchTabData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        // Если выбран Custom, но даты не заполнены — ждем нажатия "ОК"
        if (period === 'custom' && (!customStart || !customEnd)) return;

        setIsLoading(true);
        try {
            // Аргументы для API
            const p = period;
            const f = period === 'custom' ? customStart : undefined;
            const t = period === 'custom' ? customEnd : undefined;

            switch (activeTab) {
                case 'general':
                    const gData = await statisticsApi.getGeneralStatistics(token, p, f, t);
                    setGeneralData(gData);
                    break;
                case 'services':
                    const sData = await statisticsApi.getServicesStatistics(token, p, f, t);
                    setServicesData(sData);
                    break;
                case 'specialists':
                    const spData = await statisticsApi.getSpecialistsStatistics(token, p, f, t);
                    setSpecData(spData);
                    break;
                case 'clients':
                    const cData = await statisticsApi.getClientsStatistics(token, p, f, t);
                    setClientsData(cData);
                    break;
            }
        } catch (error) {
            console.error("Ошибка загрузки статистики", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (period !== 'custom') {
            fetchTabData();
        }
    }, [activeTab, period]);

    const handleApplyCustomDates = () => {
        if (customStart && customEnd) fetchTabData();
        else alert("Выберите обе даты");
    };

    // --- ПОДГОТОВКА ДАННЫХ ДЛЯ ГРАФИКОВ ---

    // 1. Линейный график (Поступление заявок)
    const getRequestsDynamicsChart = () => {
        if (!generalData) return { labels: [], datasets: [] };
        return {
            labels: generalData.requestsDynamics.map(d => d.date),
            datasets: [{
                label: 'Заявки',
                data: generalData.requestsDynamics.map(d => d.value),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
                ticks:{
                    stepsize:1
                },
            }],
        };
    };
    const lineChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // <--- ЭТО РЕШАЕТ ПРОБЛЕМУ (шаг всегда целый)
                    precision: 0 // Дополнительная гарантия отсутствия дробей
                }
            }
        },
        plugins: {
            legend: { position: 'top' as const },
            tooltip: { mode: 'index' as const, intersect: false }
        }
    };

    // 2. Пончик (Статусы с переводом)
    const getStatusChart = () => {
        if (!generalData) return { labels: [], datasets: [] };
        return {
            labels: generalData.statusDistribution.map(d => STATUS_NAME_MAP[d.label].label), // Перевод тут
            datasets: [{
                data: generalData.statusDistribution.map(d => d.value),
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6b7280'],
            }],
        };
    };

    // 3. Пирог (Выручка по типам)
    const getRevenueByDeviceChart = () => {
        if (!servicesData) return { labels: [], datasets: [] };
        return {
            labels: servicesData.revenueByDeviceType.map(d => d.label),
            datasets: [{
                label: 'Выручка',
                data: servicesData.revenueByDeviceType.map(d => d.value),
                backgroundColor: ['#0ea5e9', '#6366f1', '#ec4899', '#84cc16'],
            }]
        };
    };

    // 4. Бар (Топ услуг)
    const getTopServicesChart = () => {
        if (!servicesData) return { labels: [], datasets: [] };
        return {
            labels: servicesData.topServices.map(d => d.label),
            datasets: [{
                label: 'Кол-во заявок',
                data: servicesData.topServices.map(d => d.value),
                backgroundColor: '#3b82f6',
            }]
        };
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="statistics-page-container">

                {/* --- HEADER --- */}
                <div className="page-header">
                    <h1 className="page-title">Аналитика</h1>
                    <div className="page-header-actions">

                        <div className="period-selector-group">
                            <div className="period-selector">
                                <label htmlFor="period" className="toolbar-label">Период:</label>
                                <select
                                    id="period" className="toolbar-select"
                                    value={period} onChange={(e) => setPeriod(e.target.value)}
                                >
                                    <option value="month">Последние 30 дней</option>
                                    <option value="week">Последние 7 дней</option>
                                    <option value="custom">Выбрать даты...</option>
                                </select>
                            </div>

                            {period === 'custom' && (
                                <div className="custom-date-inputs">
                                    <input type="date" className="date-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                                    <span style={{color: '#666'}}>—</span>
                                    <input type="date" className="date-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                                    <button className="apply-dates-btn" onClick={handleApplyCustomDates}>ОК</button>
                                </div>
                            )}
                        </div>

                        <button className="download-button" onClick={() => window.print()}>
                            Печать
                        </button>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="tabs-container">
                    <button className={`tab-button ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                        Обзор
                    </button>
                    <button className={`tab-button ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                        Услуги и Финансы
                    </button>
                    <button className={`tab-button ${activeTab === 'specialists' ? 'active' : ''}`} onClick={() => setActiveTab('specialists')}>
                        Специалисты
                    </button>
                    <button className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
                        Клиенты
                    </button>
                </div>

                {/* --- CONTENT --- */}
                <div className="tab-content">
                    {isLoading && <div style={{textAlign:'center', padding:'40px'}}>Загрузка данных...</div>}

                    {/* 1. ОБЗОР */}
                    {!isLoading && activeTab === 'general' && generalData && (
                        <div>
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Новых заявок</h3>
                                    <p className="kpi-value">{generalData.newRequestsCount}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Закрыто заявок</h3>
                                    <p className="kpi-value">{generalData.closedRequestsCount}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Среднее время ремонта (часы)</h3>
                                    <p className="kpi-value">{generalData.avgRepairTimeHours}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Рейтинг (All-time)</h3>
                                    <p className="kpi-value" style={{color: '#f59e0b'}}>★ {generalData.averageRating}</p>
                                </div>
                            </div>

                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3 className="card-title">Динамика поступления</h3>
                                    <div style={{height: '300px'}}>
                                        <Line data={getRequestsDynamicsChart()} options={lineChartOptions}/>
                                    </div>
                                </div>
                                <div className="chart-card">
                                    <h3 className="card-title">Статусы заявок</h3>
                                    <div style={{height: '300px', display:'flex', justifyContent:'center'}}>
                                        <Doughnut data={getStatusChart()} options={{maintainAspectRatio: false}}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. УСЛУГИ И ФИНАНСЫ */}
                    {!isLoading && activeTab === 'services' && servicesData && (
                        <div>
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Общая выручка</h3>
                                    <p className="kpi-value" style={{color: '#10b981'}}>
                                        {servicesData.totalRevenue.toLocaleString()} ₽
                                    </p>
                                </div>
                            </div>

                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3 className="card-title">Топ-5 популярных услуг</h3>
                                    <div style={{height: '300px'}}>
                                        <Bar
                                            data={getTopServicesChart()}
                                            options={{indexAxis: 'y', maintainAspectRatio: false}}
                                        />
                                    </div>
                                </div>
                                <div className="chart-card">
                                    <h3 className="card-title">Выручка по типам устройств</h3>
                                    <div style={{height: '300px', display:'flex', justifyContent:'center'}}>
                                        <Pie
                                            data={getRevenueByDeviceChart()}
                                            options={{maintainAspectRatio: false}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. СПЕЦИАЛИСТЫ */}
                    {!isLoading && activeTab === 'specialists' && specData && (
                        <div>
                            <div className="table-card">
                                <h3 className="card-title">Эффективность персонала</h3>
                                <table className="rating-table">
                                    <thead>
                                    <tr>
                                        <th>ФИО Специалиста</th>
                                        <th>Закрыто (за период)</th>
                                        <th>В работе (сейчас)</th>
                                        <th>Ср. время (ч)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {specData.performance.map((spec, idx) => (
                                        <tr key={idx}>
                                            <td style={{fontWeight: 600}}>{spec.name}</td>
                                            <td>{spec.closedCount}</td>
                                            <td>{spec.inProgressCount}</td>
                                            <td>{spec.avgRepairTime}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 4. КЛИЕНТЫ */}
                    {!isLoading && activeTab === 'clients' && clientsData && (
                        <div className="kpi-grid" style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
                            <div className="kpi-card">
                                <h3 className="kpi-title">Всего клиентов в базе</h3>
                                <p className="kpi-value">{clientsData.totalClients}</p>
                                <div style={{color: '#666', marginTop: '10px', fontSize: '0.9rem'}}>
                                    Общее количество зарегистрированных
                                </div>
                            </div>
                            <div className="kpi-card">
                                <h3 className="kpi-title">Повторные обращения (Retention)</h3>
                                <p className="kpi-value" style={{color: '#6366f1'}}>
                                    {clientsData.returningClientsCount}
                                </p>
                                <div style={{color: '#666', marginTop: '10px', fontSize: '0.9rem'}}>
                                    Клиенты, создавшие более 1 заявки
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};