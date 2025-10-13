import React from 'react';
import './StatisticsPage.css';

export const StatisticsPage: React.FC = () => {
    return (
        <div className="statistics-page-container">
            {/* ========================================================== */}
            {/* ======================= ЗАГОЛОВОК ======================== */}
            {/* ========================================================== */}
            <div className="page-header">
                <h1 className="page-title">Статистика и отчеты</h1>
                <div className="toolbar">
                    <div className="period-selector">
                        <label htmlFor="period" className="toolbar-label">Период:</label>
                        <select id="period" className="toolbar-select">
                            <option>За последнюю неделю</option>
                            <option>За последний месяц</option>
                            <option>За последний квартал</option>
                        </select>
                    </div>
                    <button className="download-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Скачать отчет
                    </button>
                </div>
            </div>

            {/* ========================================================== */}
            {/* =================== КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ ================== */}
            {/* ========================================================== */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <h3 className="kpi-title">Новых заявок</h3>
                    <p className="kpi-value">42</p>
                    <span className="kpi-trend positive">+15%</span>
                </div>
                <div className="kpi-card">
                    <h3 className="kpi-title">Заявок в работе</h3>
                    <p className="kpi-value">18</p>
                    <span className="kpi-trend neutral">-5%</span>
                </div>
                <div className="kpi-card">
                    <h3 className="kpi-title">Среднее время ремонта</h3>
                    <p className="kpi-value">4.2 дня</p>
                    <span className="kpi-trend negative">+0.5 дня</span>
                </div>
                <div className="kpi-card">
                    <h3 className="kpi-title">Удовлетворенность (CSAT)</h3>
                    <p className="kpi-value">4.6 / 5</p>
                    <span className="kpi-trend positive">+0.2</span>
                </div>
            </div>

            {/* ========================================================== */}
            {/* ========================= ГРАФИКИ ======================== */}
            {/* ========================================================== */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="card-title">Динамика заявок</h3>
                    <div className="chart-placeholder">
                        {/* Здесь будет компонент линейного графика */}
                        <p className="placeholder-text">Line Chart: Новые vs Закрытые заявки</p>
                    </div>
                </div>
                <div className="chart-card">
                    <h3 className="card-title">Заявки по статусам</h3>
                    <div className="chart-placeholder">
                        {/* Здесь будет компонент круговой диаграммы */}
                        <p className="placeholder-text">Pie Chart: Новые, В работе, На диагностике, и т.д.</p>
                    </div>
                </div>
            </div>

            {/* ========================================================== */}
            {/* ================== РЕЙТИНГ СПЕЦИАЛИСТОВ ================== */}
            {/* ========================================================== */}
            <div className="table-card">
                <h3 className="card-title">Эффективность специалистов</h3>
                <table className="rating-table">
                    <thead>
                    <tr>
                        <th>Специалист</th>
                        <th>Закрыто заявок</th>
                        <th>Среднее время</th>
                        <th>Средняя оценка</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Сидоров А.В.</td>
                        <td>15</td>
                        <td>3.8 дня</td>
                        <td>4.8</td>
                    </tr>
                    <tr>
                        <td>Козлов Н.Н.</td>
                        <td>12</td>
                        <td>4.5 дня</td>
                        <td>4.5</td>
                    </tr>
                    <tr>
                        <td>Петров Б.Е.</td>
                        <td>9</td>
                        <td>4.1 дня</td>
                        <td>4.6</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};