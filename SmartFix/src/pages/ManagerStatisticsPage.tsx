import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/StatisticsPage.css';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import { statisticsApi, type RequestsStatsDto, type ClientsStatsDto, type MastersStatsDto } from '../api/statisticsApi.ts';
import { useApi } from "../hooks/useApi.ts";
import { useToast } from "../components/ToastContext.tsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const STATUS_TRANSLATION: Record<string, string> = {
    'New': 'Новая', 'Accepted': 'Принята', 'Diagnostics': 'На диагностике',
    'Pending': 'На согласовании', 'InProgress': 'В ремонте', 'Ready': 'Готова',
    'Closed': 'Закрыта', 'Cancelled': 'Отменена'
};

const TYPE_TRANSLATION: Record<string, string> = {
    'InService': 'В сервисе', 'Field': 'Выездной', 'Warranty': 'Гарантийный'
};

const CHART_COLORS =['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#84cc16'];

export const ManagerStatisticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const token = localStorage.getItem('token') || '';

    const [period, setPeriod] = useState("week");
    const[customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [activeTab, setActiveTab] = useState<'requests' | 'clients' | 'masters'>('requests');

    const [reqData, setReqData] = useState<RequestsStatsDto | null>(null);
    const [clientsData, setClientsData] = useState<ClientsStatsDto | null>(null);
    const [mastersData, setMastersData] = useState<MastersStatsDto | null>(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const getDaysDifference = (start: string, end: string) => Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));

    const fetchTabData = async () => {
        if (!token) { navigate('/'); return; }
        if (period === 'custom' && (!customStart || !customEnd)) return;

        const p = period;
        const f = period === 'custom' ? customStart : undefined;
        const t = period === 'custom' ? customEnd : undefined;

        switch (activeTab) {
            case 'requests':
                setReqData(await statisticsApi.getRequestsStats(token, p, f, t));
                break;
            case 'clients':
                setClientsData(await statisticsApi.getClientsStats(token, p, f, t));
                break;
            case 'masters':
                setMastersData(await statisticsApi.getMastersStats(token, p, f, t));
                break;
        }
    };

    const [loadData, { isLoading }] = useApi(fetchTabData, false);

    useEffect(() => {
        if (period !== 'custom' || (customStart && customEnd)) {
            loadData();
        }
    },[activeTab, period]);

    const handleApplyCustomDates = () => {
        if (!customStart || !customEnd) return showToast("Выберите обе даты", "info");
        if (new Date(customEnd) < new Date(customStart)) return showToast("Конечная дата не может быть раньше начальной", "error");
        if (getDaysDifference(customStart, customEnd) > 366) return showToast("Период не может превышать 1 год.", "error");
        loadData();
    };

    const getDynamicsChart = () => {
        if (!reqData) return { labels: [], datasets:[] };
        const sortedDates = Object.keys(reqData.requestsByDay).sort();
        return {
            labels: sortedDates,
            datasets:[{
                label: 'Поступившие заявки',
                data: sortedDates.map(date => reqData.requestsByDay[date]),
                borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.5)', tension: 0.3
            }]
        };
    };

    const getStatusChart = () => {
        if (!reqData) return { labels: [], datasets:[] };
        const keys = Object.keys(reqData.requestsByStatus);
        return {
            labels: keys.map(k => STATUS_TRANSLATION[k] || k),
            datasets: [{ data: keys.map(k => reqData.requestsByStatus[k]), backgroundColor: CHART_COLORS }]
        };
    };

    const getTypeChart = () => {
        if (!reqData) return { labels:[], datasets:[] };
        const keys = Object.keys(reqData.requestsByType);
        return {
            labels: keys.map(k => TYPE_TRANSLATION[k] || k),
            datasets:[{ data: keys.map(k => reqData.requestsByType[k]), backgroundColor:['#8b5cf6', '#ec4899', '#f59e0b'] }]
        };
    };

    const getDeviceTypeChart = () => {
        if (!reqData) return { labels: [], datasets:[] };
        return {
            labels: Object.keys(reqData.requestsByDeviceType),
            datasets:[{ label: 'Кол-во заявок', data: Object.values(reqData.requestsByDeviceType), backgroundColor: '#0ea5e9' }]
        };
    };

    const getRatingDistributionChart = () => {
        if (!clientsData) return { labels: [], datasets:[] };
        // Выводим от 1 до 5 звезд
        const labels = ['1 звезда', '2 звезды', '3 звезды', '4 звезды', '5 звезд'];
        const data = [1, 2, 3, 4, 5].map(star => clientsData.ratingDistribution[star.toString()] || 0);
        return {
            labels,
            datasets:[{ label: 'Кол-во оценок', data, backgroundColor: '#f59e0b' }]
        };
    };

    const getRevenueByMasterChart = () => {
        if (!mastersData) return { labels: [], datasets:[] };
        return {
            labels: Object.keys(mastersData.revenueByMaster),
            datasets:[{ label: 'Выручка (руб.)', data: Object.values(mastersData.revenueByMaster), backgroundColor: '#10b981' }]
        };
    };

    const getRejectionRateChart = () => {
        if (!mastersData) return { labels: [], datasets:[] };
        return {
            labels: Object.keys(mastersData.rejectionRateByMaster),
            datasets:[{ label: '% отказов', data: Object.values(mastersData.rejectionRateByMaster), backgroundColor: '#ef4444' }]
        };
    };

    // Общие опции для Bar Charts
    const defaultBarOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } },
        plugins: { legend: { display: false } }
    };

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            const f = period === 'custom' ? customStart : undefined;
            const t = period === 'custom' ? customEnd : undefined;
            await statisticsApi.downloadReportPdf(token, period, f, t);
        } catch (error) {
            showToast("Ошибка при формировании отчета", "error");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="statistics-page-container">

                <div className="page-header">
                    <h1 className="page-title">Аналитика</h1>
                    <div className="page-header-actions">
                        <div className="period-selector-group">
                            <div className="period-selector">
                                <label htmlFor="period" className="toolbar-label">Период:</label>
                                <select id="period" className="toolbar-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                                    <option value="week">Последние 7 дней</option>
                                    <option value="month">Последние 30 дней</option>
                                    <option value="year">За год</option>
                                    <option value="custom">Выбрать даты...</option>
                                </select>
                            </div>
                            {period === 'custom' && (
                                <div className="custom-date-inputs">
                                    <input type="date" className="date-input" value={customStart} onChange={(e) => setCustomStart(e.target.value)}/>
                                    <span style={{color: '#666'}}>—</span>
                                    <input type="date" className="date-input" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}/>
                                    <button className="apply-dates-btn" onClick={handleApplyCustomDates}>ОК</button>
                                </div>
                            )}
                        </div>
                        <button className="secondary-button"
                                onClick={handleDownloadPdf}
                                disabled={isDownloadingPdf}>
                            {isDownloadingPdf ? (
                                <span>Формирование...</span>
                            ) : (
                                <span>Скачать отчет</span>
                            )}</button>
                    </div>
                </div>

                <div className="tabs-container">
                    <button className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                        Заявки и Финансы
                    </button>
                    <button className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
                        Клиенты и Маркетинг
                    </button>
                    <button className={`tab-button ${activeTab === 'masters' ? 'active' : ''}`} onClick={() => setActiveTab('masters')}>
                        Мастера (Исполнители)
                    </button>
                </div>

                <div className="tab-content">
                    {isLoading && <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>Загрузка данных...</div>}

                    {/* --- 1. ЗАЯВКИ И ФИНАНСЫ --- */}
                    {!isLoading && activeTab === 'requests' && reqData && (
                        <div>
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Поступило заявок</h3>
                                    <p className="kpi-value">{reqData.totalRequests}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Закрыто (Успешно)</h3>
                                    <p className="kpi-value" style={{color: '#16a34a'}}>{reqData.closedRequests}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Отменено</h3>
                                    <p className="kpi-value" style={{color: '#dc2626'}}>{reqData.cancelledRequests}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Общая выручка</h3>
                                    <p className="kpi-value" style={{color: '#2563eb'}}>{reqData.totalRevenue.toLocaleString()} руб.</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Средний чек</h3>
                                    <p className="kpi-value">{reqData.averageCheck.toFixed(2)} руб.</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Ср. время ремонта</h3>
                                    <p className="kpi-value">{reqData.averageRepairTimeHours} ч.</p>
                                </div>
                            </div>

                            <div className="charts-grid">
                                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                                    <h3 className="card-title">Динамика поступления заявок по дням</h3>
                                    <div style={{height: '300px'}}><Line data={getDynamicsChart()} options={{maintainAspectRatio: false}}/></div>
                                </div>
                                <div className="chart-card">
                                    <h3 className="card-title">Распределение по статусам</h3>
                                    <div style={{height: '300px', display: 'flex', justifyContent: 'center'}}><Doughnut data={getStatusChart()} options={{maintainAspectRatio: false}}/></div>
                                </div>
                                <div className="chart-card">
                                    <h3 className="card-title">Типы обращений</h3>
                                    <div style={{height: '300px', display: 'flex', justifyContent: 'center'}}><Pie data={getTypeChart()} options={{maintainAspectRatio: false}}/></div>
                                </div>
                                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                                    <h3 className="card-title">Заявки по типам устройств</h3>
                                    <div style={{height: '300px'}}><Bar data={getDeviceTypeChart()} options={defaultBarOptions}/></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 2. КЛИЕНТЫ --- */}
                    {!isLoading && activeTab === 'clients' && clientsData && (
                        <div>
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Новых клиентов за период</h3>
                                    <p className="kpi-value" style={{color: '#2563eb'}}>{clientsData.newClientsCount}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Обращений от постоянных (Retention)</h3>
                                    <p className="kpi-value" style={{color: '#8b5cf6'}}>{clientsData.returningClientRequestsCount}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Средняя оценка сервиса</h3>
                                    <p className="kpi-value" style={{color: '#f59e0b'}}>★ {clientsData.averageRating}</p>
                                </div>
                            </div>
                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3 className="card-title">Распределение оценок из отзывов</h3>
                                    <div style={{height: '300px'}}><Bar data={getRatingDistributionChart()} options={defaultBarOptions}/></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 3. МАСТЕРА --- */}
                    {!isLoading && activeTab === 'masters' && mastersData && (
                        <div>
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Задействовано мастеров</h3>
                                    <p className="kpi-value">{mastersData.activeMastersCount}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Топ-мастер (Больше всего закрыл)</h3>
                                    <p className="kpi-value" style={{fontSize: '20px', paddingTop: '10px'}}>{mastersData.topMasterName}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Среднее время диагностики</h3>
                                    <p className="kpi-value">{mastersData.averageDiagnosticTimeHours} ч.</p>
                                </div>
                            </div>

                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3 className="card-title">Сгенерированная выручка по мастерам</h3>
                                    <div style={{height: '300px'}}>
                                        <Bar data={getRevenueByMasterChart()} options={{...defaultBarOptions, indexAxis: 'y'}}/>
                                    </div>
                                </div>
                                <div className="chart-card">
                                    <h3 className="card-title">Процент отказов от ремонта (%)</h3>
                                    <div style={{height: '300px'}}>
                                        <Bar data={getRejectionRateChart()} options={defaultBarOptions}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};