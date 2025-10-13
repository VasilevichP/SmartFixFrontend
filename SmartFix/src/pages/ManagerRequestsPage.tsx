import React from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ManagerPages.css';
import {useNavigate} from "react-router-dom";

// Определяем структуру данных для одной заявки (это хорошая практика в TypeScript)
interface ServiceRequest {
    id: string;
    clientName: string;
    service: string;
    createdAt: string;
    specialist: string | null;
    status: 'Новая' | 'В работе' | 'На диагностике' | 'Готова' | 'Закрыта' | 'Отменена'; // <-- Добавлен новый статус
}

// "Заглушка" с данными, чтобы наполнить таблицу для примера
const mockRequests: ServiceRequest[] = [
    {
        id: 'SF-1025',
        clientName: 'Сергеев Игорь',
        service: 'Замена термопасты',
        createdAt: '2025-10-27 11:00',
        specialist: null,
        status: 'Отменена'
    },
    {
        id: 'SF-1024',
        clientName: 'Иванов Иван',
        service: 'Диагностика ноутбука',
        createdAt: '2025-10-26 10:30',
        specialist: null,
        status: 'Новая'
    },
    {
        id: 'SF-1023',
        clientName: 'Петрова Анна',
        service: 'Замена экрана смартфона',
        createdAt: '2025-10-26 09:15',
        specialist: 'Сидоров А.В.',
        status: 'В работе'
    },
    {
        id: 'SF-1022',
        clientName: 'Васильев Петр',
        service: 'Чистка системы охлаждения',
        createdAt: '2025-10-25 18:00',
        specialist: 'Сидоров А.В.',
        status: 'Готова'
    },
    {
        id: 'SF-1021',
        clientName: 'Михайлова Ольга',
        service: 'Восстановление данных',
        createdAt: '2025-10-25 15:20',
        specialist: 'Козлов Н.Н.',
        status: 'На диагностике'
    },
    {
        id: 'SF-1020',
        clientName: 'Алексеев Дмитрий',
        service: 'Замена аккумулятора',
        createdAt: '2025-10-24 11:45',
        specialist: 'Сидоров А.В.',
        status: 'Закрыта'
    },
];

// Функция-помощник для получения CSS-класса в зависимости от статуса
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

    const navigate = useNavigate();
    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <h1 className="title">Управление заявками</h1>

                <div className="filter-panel">
                    <div className="filter-header">
                        <div className="filter-title-wrapper">
                            <h2 className="filter-title">Фильтр</h2>
                        </div>
                        <div className="filter-actions">
                            <a href="#" className="filter-action-link">Сбросить</a>
                            <button className='action-button-secondary'>Применить фильтры</button>
                        </div>
                    </div>

                    <div className="filter-controls">
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
                               placeholder="Введите название услуги, клиента или исполнителя"/>
                    </div>
                </div>

                <div className="table-container">
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
                        {mockRequests.map((request) => (
                            <tr key={request.id} onClick={() => navigate('/manager/requests/details')}>
                                <td>{request.id}</td>
                                <td>{request.clientName}</td>
                                <td>{request.service}</td>
                                <td>{request.createdAt}</td>
                                <td>{request.specialist || 'Не назначен'}</td>
                                <td>
                  <span className={`status-badge ${getStatusClassName(request.status)}`}>
                    {request.status}
                  </span>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};