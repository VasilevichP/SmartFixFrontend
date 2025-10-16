import React, {useState} from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
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
import {Line, Doughnut, Bar} from 'react-chartjs-2';
import '../styles/StatisticsPage.css';

// --- Типы для секции "Заявки" ---

// Для KPI-карточек
export interface RequestKpiData {
    newRequests: { value: number; trend: number; };
    inProgress: { value: number; trend: number; };
    avgRepairTimeDays: { value: number; trend: number; };
    csat: { value: number; trend: number; };
}

// Для линейного графика динамики
export interface RequestDynamicsDataPoint {
    date: string;
    new: number;
    closed: number;
}

// Для круговой диаграммы по статусам
export interface RequestStatusDistributionDataPoint {
    name: 'Новые' | 'В работе' | 'На диагностике' | 'Готовы';
    value: number;
}

// Для таблицы эффективности специалистов
export interface SpecialistPerformanceData {
    name: string;
    closedCount: number;
    avgTimeDays: number;
    avgRating: number;
}

// --- Типы для секции "Услуги" ---

// Для KPI-карточек по услугам
export interface ServiceKpiData {
    totalServices: number;
    mostPopular: { name: string; count: number; };
    highestRated: { name: string; rating: number; };
}

// Для гистограммы популярности услуг
export interface ServicePopularityDataPoint {
    name: string;
    requestCount: number;
}

const mockRequestData = {
    kpis: {
        newRequests: {value: 42, trend: 15},
        inProgress: {value: 18, trend: -5},
        avgRepairTimeDays: {value: 4.2, trend: 0.5},
        csat: {value: 4.6, trend: 0.2},
    },
    dynamics: [
        {date: '20.10', new: 15, closed: 12},
        {date: '21.10', new: 18, closed: 14},
        {date: '22.10', new: 12, closed: 16},
        {date: '23.10', new: 20, closed: 15},
        {date: '24.10', new: 17, closed: 18},
    ],
    statusDistribution: [
        {name: 'Новые', value: 42},
        {name: 'В работе', value: 18},
        {name: 'На диагностике', value: 8},
        {name: 'Готовы', value: 12},
    ],
    specialistPerformance: [
        {name: 'Сидоров А.В.', closedCount: 15, avgTimeDays: 3.8, avgRating: 4.8},
        {name: 'Козлов Н.Н.', closedCount: 12, avgTimeDays: 4.5, avgRating: 4.5},
        {name: 'Петров Б.Е.', closedCount: 9, avgTimeDays: 4.1, avgRating: 4.6},
    ]
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// "Заглушка" для вкладки "Услуги"
const mockServiceData = {
    kpis: {
        totalServices: 28,
        mostPopular: {name: 'Замена экрана', count: 56},
        highestRated: {name: 'Чистка ноутбука', rating: 4.9},
    },
    popularity: [
        {name: 'Замена экрана', requestCount: 56},
        {name: 'Диагностика', requestCount: 45},
        {name: 'Замена аккумулятора', requestCount: 38},
        {name: 'Чистка ноутбука', requestCount: 32},
        {name: 'Восстановление данных', requestCount: 15},
    ]
};

const lineChartData = {
    labels: mockRequestData.dynamics.map(d => d.date),
    datasets: [
        {
            label: 'Новые заявки',
            data: mockRequestData.dynamics.map(d => d.new),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.3,
        },
        {
            label: 'Закрытые заявки',
            data: mockRequestData.dynamics.map(d => d.closed),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            tension: 0.3,
        },
    ],
};

// --- 2. Круговая диаграмма: Заявки по статусам ---
const doughnutChartData = {
    labels: mockRequestData.statusDistribution.map(d => d.name),
    datasets: [
        {
            label: 'Кол-во заявок',
            data: mockRequestData.statusDistribution.map(d => d.value),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', // Синий
                'rgba(245, 158, 11, 0.8)', // Желтый
                'rgba(139, 92, 246, 0.8)', // Фиолетовый
                'rgba(239, 68, 68, 0.8)',   // Красный
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 1,
        },
    ],
};

// --- 3. Гистограмма: Популярность услуг ---
const barChartData = {
    labels: mockServiceData.popularity.map(s => s.name),
    datasets: [{
        label: 'Количество выполненных заявок',
        data: mockServiceData.popularity.map(s => s.requestCount),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
    }]
};
const barChartOptions = {
    indexAxis: 'y' as const, // Делаем гистограмму горизонтальной
    responsive: true,
    plugins: {
        legend: {
            display: false, // Можно скрыть легенду для чистоты
        },
    },
};
export const ManagerStatisticsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'services'>('requests');
    return (
        <div>
            <ManagerHeader/>
            <div className="statistics-page-container">
                {/* ========================================================== */}
                {/* ================= ОБЩИЙ ЗАГОЛОВОК ======================= */}
                {/* ========================================================== */}
                <div className="page-header">
                    <h1 className="page-title">Статистика и отчеты</h1>
                    <div className="page-header-actions">
                        <div className="period-selector">
                            <label htmlFor="period" className="toolbar-label">Период:</label>
                            <select id="period" className="toolbar-select">
                                <option>За последний месяц</option>
                                <option>За последнюю неделю</option>
                            </select>
                        </div>
                        <button className="download-button">
                            Скачать отчет
                        </button>
                    </div>
                </div>

                {/* ========================================================== */}
                {/* ================= ПЕРЕКЛЮЧАТЕЛЬ СЕКЦИЙ ================== */}
                {/* ========================================================== */}
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Статистика по заявкам
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Статистика по услугам
                    </button>
                </div>

                {/* ========================================================== */}
                {/* ================== КОНТЕНТ СЕКЦИЙ ======================== */}
                {/* ========================================================== */}
                <div className="tab-content">
                    {/* --- Секция "Заявки" --- */}
                    {activeTab === 'requests' && (
                        <div id="requests-section">
                            <div className="kpi-grid">
                                {/* ... KPI карточки для заявок ... */}
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Новых заявок</h3>
                                    <p className="kpi-value">{mockRequestData.kpis.newRequests.value}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Среднее время в работе</h3>
                                    <p className="kpi-value">{mockRequestData.kpis.avgRepairTimeDays.value}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">CSAT</h3>
                                    <p className="kpi-value">{mockRequestData.kpis.csat.value}</p>
                                </div>
                            </div>
                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3 className="card-title">Динамика заявок</h3>
                                    <Line options={{responsive: true}} data={lineChartData}/>
                                </div>
                                <div className="chart-card">
                                    <h3 className="card-title">Заявки по статусам</h3>
                                    <Doughnut data={doughnutChartData}/>
                                </div>
                            </div>
                            <div className="table-card">
                                <h3 className="card-title">Эффективность специалистов</h3>
                                <table className="rating-table">
                                    <thead>
                                    <tr>
                                        <th>Специалист</th>
                                        <th>Закрыто заявок</th>
                                        <th>Среднее время</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {mockRequestData.specialistPerformance.map((specialist) => (
                                        <tr key={specialist.name}>
                                            <td>{specialist.name}</td>
                                            <td>{specialist.closedCount}</td>
                                            <td>{specialist.avgTimeDays}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- Секция "Услуги" --- */}
                    {activeTab === 'services' && (
                        <div id="services-section">
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Всего услуг в каталоге</h3>
                                    <p className="kpi-value">{mockServiceData.kpis.totalServices}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Самая популярная</h3>
                                    <p className="kpi-value small">{mockServiceData.kpis.mostPopular.name}</p>
                                </div>
                                <div className="kpi-card">
                                    <h3 className="kpi-title">Самый высокий рейтинг</h3>
                                    <p className="kpi-value small">{mockServiceData.kpis.highestRated.name}</p>
                                </div>
                            </div>
                            <div className="charts-grid-full">
                                <div className="chart-card">
                                    <h3 className="card-title">Популярность услуг</h3>
                                    <div className="chart-placeholder">
                                        {/* Здесь будет гистограмма */}
                                        <Bar options={barChartOptions} data={barChartData} />
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