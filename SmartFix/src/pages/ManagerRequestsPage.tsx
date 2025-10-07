import React from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ManagerPages.css';

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
    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <h1 className="title">Управление заявками</h1>

                <div className="filter-toolbar">
                    <div className="filter-group">
                        <label htmlFor="status-filter">Фильтр по статусу:</label>
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
                        <label htmlFor="date-sort">Сортировка по дате:</label>
                        <select id="date-sort" className="filter-select">
                            <option value="0">От новых к старым</option>
                            <option value="1">От старых к новым</option>
                        </select>
                    </div>
                    <div className="search-group">
                        <div className="search-input-wrapper">
                            <input type="text" className="search-input" placeholder="Поиск ..."/>
                            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
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
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mockRequests.map((request) => (
                            <tr key={request.id}>
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
                                <td>
                                    <div className="button-container">
                                        <button className="action-button">Детали</button>
                                        <button className="action-button-cancel action-button ">Отменить</button>
                                    </div>
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