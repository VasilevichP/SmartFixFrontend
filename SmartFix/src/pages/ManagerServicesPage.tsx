import React from 'react';
import '../styles/ManagerPages.css';

// Определяем структуру данных для одной услуги
interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    executionTime: string;
    isAvailable: boolean;
}

// "Заглушка" с данными для примера
const mockServices: Service[] = [
    { id: 1, name: 'Диагностика ноутбука', category: 'Ремонт ноутбуков', price: 1500.00, executionTime: '1-2 дня', isAvailable: true },
    { id: 2, name: 'Замена экрана смартфона', category: 'Ремонт смартфонов', price: 4500.00, executionTime: '2-4 часа', isAvailable: true },
    { id: 3, name: 'Чистка системы охлаждения', category: 'Ремонт ноутбуков', price: 2000.00, executionTime: '1 час', isAvailable: true },
    { id: 4, name: 'Восстановление данных с HDD', category: 'Восстановление данных', price: 5000.00, executionTime: '3-5 дней', isAvailable: false },
    { id: 5, name: 'Замена аккумулятора', category: 'Ремонт смартфонов', price: 2500.00, executionTime: '30 минут', isAvailable: true },
];

// Функция-помощник для получения CSS-класса в зависимости от доступности
const getAvailabilityClassName = (isAvailable: boolean) => {
    return isAvailable ? 'status-available' : 'status-hidden';
};

const ServicesPage: React.FC = () => {
    return (
        <div className="page-container">
            <h1 className="title">Управление услугами</h1>

            {/* Панель с фильтрами и кнопкой добавления */}
            <div className="filter-toolbar">
                <div className="filter-group">
                    <label htmlFor="availability-filter">Фильтр по доступности:</label>
                    <select id="availability-filter" className="filter-select">
                        <option value="all">Все</option>
                        <option value="available">Доступные</option>
                        <option value="hidden">Скрытые</option>
                    </select>
                </div>
                <div className="action-group">
                    <button className="add-button">
                        + Добавить услугу
                    </button>
                </div>
            </div>

            {/* Контейнер для таблицы */}
            <div className="table-container">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Название услуги</th>
                        <th>Категория</th>
                        <th>Цена</th>
                        <th>Время выполнения</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mockServices.map((service) => (
                        <tr key={service.id}>
                            <td>{service.name}</td>
                            <td>{service.category}</td>
                            <td>{`${service.price.toFixed(2)} ₽`}</td>
                            <td>{service.executionTime}</td>
                            <td>
                  <span className={`status-badge ${getAvailabilityClassName(service.isAvailable)}`}>
                    {service.isAvailable ? 'Доступна' : 'Скрыта'}
                  </span>
                            </td>
                            <td className="actions-cell">
                                <button className="action-button">Редактировать</button>
                                <button className={`action-button ${service.isAvailable ? 'action-button-secondary' : 'action-button-tertiary'}`}>
                                    {service.isAvailable ? 'Скрыть' : 'Показать'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesPage;