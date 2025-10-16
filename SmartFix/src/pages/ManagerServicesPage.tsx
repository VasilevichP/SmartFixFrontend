import React from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ManagerPages.css';
import {useNavigate} from "react-router-dom";

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
    {
        id: 1,
        name: 'Диагностика ноутбука',
        category: 'Ремонт ноутбуков',
        price: 1500.00,
        executionTime: '1-2 дня',
        isAvailable: true
    },
    {
        id: 2,
        name: 'Замена экрана смартфона',
        category: 'Ремонт смартфонов',
        price: 4500.00,
        executionTime: '2-4 часа',
        isAvailable: true
    },
    {
        id: 3,
        name: 'Чистка системы охлаждения',
        category: 'Ремонт ноутбуков',
        price: 2000.00,
        executionTime: '1 час',
        isAvailable: true
    },
    {
        id: 4,
        name: 'Восстановление данных с HDD',
        category: 'Восстановление данных',
        price: 5000.00,
        executionTime: '3-5 дней',
        isAvailable: false
    },
    {
        id: 5,
        name: 'Замена аккумулятора',
        category: 'Ремонт смартфонов',
        price: 2500.00,
        executionTime: '30 минут',
        isAvailable: true
    },
];

// Функция-помощник для получения CSS-класса в зависимости от доступности
const getAvailabilityClassName = (isAvailable: boolean) => {
    return isAvailable ? 'status-available' : 'status-hidden';
};

export const ManagerServicesPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <ManagerHeader/>
            <div className="page-container">
                <h1 className="title">Управление услугами</h1>

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
                            <label htmlFor="availability-filter" className="filter-label">Статус</label>
                            <select id="availability-filter" className="filter-select">
                                <option value="all">Все</option>
                                <option value="available">Доступные</option>
                                <option value="hidden">Скрытые</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="category-filter" className="filter-label">Категория</label>
                            <select id="category-filter" className="filter-select">
                                <option value="all">Все</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="sort" className="filter-label">Сортировка</label>
                            <select id="sort" className="filter-select">
                                <option value="0">По названию (возр)</option>
                                <option value="1">По названию (убыв)</option>
                                <option value="2">По цене (возр)</option>
                                <option value="3">По цене (убыв)</option>
                                <option value="4">По времени выполнения (возр)</option>
                                <option value="5">По времени выполнения (убыв)</option>
                            </select>
                        </div>

                        <input type="text" className="search-input"
                               placeholder="Введите название услуги или категории"/>
                    </div>
                </div>

                <div className='form-action'>
                    <button className="download-button" onClick={() => navigate('/manager/services/create')}>Добавить услугу</button>
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
                        </tr>
                        </thead>
                        <tbody>
                        {mockServices.map((service) => (
                            <tr key={service.id} onClick={() => navigate('/manager/services/details/')}>
                                <td>{service.name}</td>
                                <td>{service.category}</td>
                                <td>{`${service.price.toFixed(2)} `}</td>
                                <td>{service.executionTime}</td>
                                <td>
                  <span className={`status-badge ${getAvailabilityClassName(service.isAvailable)}`}>
                    {service.isAvailable ? 'Доступна' : 'Скрыта'}
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