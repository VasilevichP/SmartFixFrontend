import React, {useState} from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ManagerPages.css';
import {useNavigate} from "react-router-dom";

interface ServiceRequest {
    id: string;
    clientName: string;
    service: string;
    createdAt: string;
    specialist: string | null;
    status: 'Новая' | 'В работе' | 'На диагностике' | 'Готова' | 'Закрыта' | 'Отменена'; // <-- Добавлен новый статус
}

const getStatusClassName = (status: ServiceRequest['status']) => {
    switch (status) {
        case 'Новая':
            return 'status-new';
        case 'В работе':
            return 'status-in-progress';
        case 'На диагностике':
            return 'status-diagnostics';
        case 'Готова':
            return 'status-ready';
        case 'Закрыта':
            return 'status-closed';
        case 'Отменена':
            return 'status-cancelled'; // <-- Добавлен класс для нового статуса
        default:
            return '';
    }
};


export const ManagerRequestsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [requests, setRequests] = useState([]);

    const navigate = useNavigate();
    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <div className="page-wrapper">

                    <aside className="filters-sidebar">
                        <div className="filter-panel">
                            <div className="filters-header">
                                <h3 className="filters-title">Фильтры</h3>
                                <a href="#" className="reset-link">Сбросить</a>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="status-filter" className="filter-label">Статус</label>
                                <select id="status-filter" className="filter-select">
                                    <option value="all">Все</option>
                                    <option value="new">Новые</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="ready">Готовы</option>
                                    <option value="closed">Закрыты</option>
                                    <option value="cancelled">Отменены</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="date-sort" className="filter-label">Дата</label>
                                <select id="date-sort" className="filter-select">
                                    <option value="0">От новых к старым</option>
                                    <option value="1">От старых к новым</option>
                                </select>
                            </div>

                            <input type="text" className="search-input"
                                   placeholder="Услуга, клиент, исполнитель..."/>
                        </div>
                    </aside>

                    <main className="content-area">
                        <div className="content-header">
                            <h1 className="page-title">Заявки</h1>
                        </div>
                        <div className="table-container">
                            <div className="table-card">
                                {isLoading ? (
                                    <p style={{padding: '40px', textAlign: 'center', color: '#666'}}>Загрузка...</p>
                                ) : (
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th>ID Заявки</th>
                                            <th>Клиент</th>
                                            <th>Услуга</th>
                                            <th>Дата создания</th>
                                            <th>Исполнитель</th>
                                            <th>Статус</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {/*      {requests.map((request) => (*/}
                                        {/*          <tr key={request.id} onClick={() => navigate('/manager/requests/details')}>*/}
                                        {/*              <td>{request.id}</td>*/}
                                        {/*              <td>{request.clientName}</td>*/}
                                        {/*              <td>{request.service}</td>*/}
                                        {/*              <td>{request.createdAt}</td>*/}
                                        {/*              <td>{request.specialist || 'Не назначен'}</td>*/}
                                        {/*              <td>*/}
                                        {/*<span className={`status-badge ${getStatusClassName(request.status)}`}>*/}
                                        {/*  {request.status}*/}
                                        {/*</span>*/}
                                        {/*              </td>*/}

                                        {/*          </tr>*/}
                                        {/*      ))}*/}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};