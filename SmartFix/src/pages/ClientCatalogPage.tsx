import React from 'react';
import '../styles/ClientCatalog.css';
import ClientHeader from "../components/ClientHeader.tsx";
import {useNavigate} from "react-router-dom";

// Определяем структуру данных для одной услуги
interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    executionTime: string;
    description: string;
    imageUrl: string;
}

// "Заглушка" с данными для примера. Нужно больше данных для пагинации.
const mockServices: Service[] = [
    {
        id: 1,
        name: 'Диагностика ноутбука',
        category: 'Ремонт ноутбуков',
        price: 1500,
        executionTime: '1-2 дня',
        description: 'Полная аппаратная и программная диагностика для выявления неисправностей.',
        imageUrl: 'https://rms.kufar.by/v1/list_thumbs_2x/adim1/1d9fc6f9-8473-44c4-86aa-7279c165c064.jpg'
    },
    {
        id: 2,
        name: 'Замена экрана смартфона',
        category: 'Ремонт смартфонов',
        price: 4500,
        executionTime: '2-4 часа',
        description: 'Установка оригинального дисплейного модуля на вашу модель смартфона.',
        imageUrl: 'https://via.placeholder.com/300x200/F1FAEE/000000?text=Phone'
    },
    {
        id: 3,
        name: 'Чистка от пыли и замена термопасты',
        category: 'Ремонт ноутбуков',
        price: 2000,
        executionTime: '1 час',
        description: 'Профилактическая чистка системы охлаждения для предотвращения перегрева.',
        imageUrl: 'https://via.placeholder.com/300x200/457B9D/FFFFFF?text=Cooling'
    },
    {
        id: 4,
        name: 'Восстановление данных с HDD',
        category: 'Восстановление данных',
        price: 5000,
        executionTime: '3-5 дней',
        description: 'Программное восстановление удаленных файлов с жесткого диска.',
        imageUrl: 'https://via.placeholder.com/300x200/E63946/FFFFFF?text=Data'
    },
    {
        id: 5,
        name: 'Замена аккумулятора iPhone',
        category: 'Ремонт смартфонов',
        price: 2500,
        executionTime: '30 минут',
        description: 'Быстрая замена изношенного аккумулятора на новый оригинальный.',
        imageUrl: 'https://via.placeholder.com/300x200/F1FAEE/000000?text=Battery'
    },
    {
        id: 6,
        name: 'Установка Windows и драйверов',
        category: 'Обслуживание ПК',
        price: 1800,
        executionTime: '1-2 часа',
        description: 'Чистая установка операционной системы и всех необходимых драйверов.',
        imageUrl: 'https://via.placeholder.com/300x200/1D3557/FFFFFF?text=Windows'
    },
    {
        id: 7,
        name: 'Ремонт материнской платы',
        category: 'Ремонт ноутбуков',
        price: 8000,
        executionTime: '5-7 дней',
        description: 'Сложный компонентный ремонт материнской платы после залития или скачка напряжения.',
        imageUrl: 'https://via.placeholder.com/300x200/A8DADC/000000?text=Motherboard'
    },
    {
        id: 8,
        name: 'Замена разъема зарядки',
        category: 'Ремонт смартфонов',
        price: 1200,
        executionTime: '1 час',
        description: 'Перепайка или замена неисправного порта зарядки USB-C / Lightning.',
        imageUrl: 'https://via.placeholder.com/300x200/F1FAEE/000000?text=Port'
    },
];

export const ClientCatalogPage: React.FC = () => {
    var navigate = useNavigate();
    return (
        <div>
            <ClientHeader/>
            <div className="catalog-page-container">
                {/* ========================================================== */}
                {/* ===================== СТРОКА ПОИСКА ====================== */}
                {/* ========================================================== */}
                <div className="search-bar-container">
                    <div className="search-input-wrapper">
                        <input type="text" className="search-input" placeholder="Найти услугу..."/>
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                  clipRule="evenodd"/>
                        </svg>
                    </div>
                </div>

                {/* ========================================================== */}
                {/* ==================== ОСНОВНОЙ МАКЕТ ====================== */}
                {/* ========================================================== */}
                <div className="catalog-layout">
                    {/* --- Левая колонка: Фильтры --- */}
                    <aside className="filters-sidebar">
                        <h2 className="filters-title">Фильтры</h2>
                        <div className="filter-group">
                            <label className="filter-label">Категория</label>
                            <select className="filter-select">
                                <option>Все категории</option>
                                <option>Ремонт ноутбуков</option>
                                <option>Ремонт смартфонов</option>
                                <option>Восстановление данных</option>
                                <option>Обслуживание ПК</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Цена</label>
                            <div className="radio-group">
                                <div className="radio-item"><input type="radio" name="price" id="price-any"
                                                                   defaultChecked/><label
                                    htmlFor="price-any">Любая</label></div>
                                <div className="radio-item"><input type="radio" name="price" id="price-1"/><label
                                    htmlFor="price-1">До 50 руб.</label></div>
                                <div className="radio-item"><input type="radio" name="price" id="price-2"/><label
                                    htmlFor="price-2">50 - 100 руб.</label></div>
                                <div className="radio-item"><input type="radio" name="price" id="price-3"/><label
                                    htmlFor="price-3">От 100 руб.</label></div>
                            </div>
                        </div>
                        <button className='action-button-secondary'>Применить фильтры</button>
                    </aside>

                    {/* --- Правая колонка: Карточки и пагинация --- */}
                    <main className="services-content">
                        <div className="services-grid">
                            {mockServices.map(service => (
                                <div key={service.id} className="service-card" onClick={() => navigate('/catalog/details')}>
                                    <img src={service.imageUrl} alt={service.name} className="card-image"/>
                                    <div className="card-content">
                                        <span className="card-category">{service.category}</span>
                                        <h3 className="card-title">{service.name}</h3>
                                        <p className="card-description">{service.description}</p>
                                        <div className="card-footer">
                                            <span className="card-price">{service.price} руб.</span>
                                            {/*<button className="card-button">Подробнее</button>*/}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- Пагинация --- */}
                        <nav className="pagination-container">
                            <button className="pagination-button">&laquo; Назад</button>
                            <button className="pagination-button active">1</button>
                            <button className="pagination-button">2</button>
                            <button className="pagination-button">3</button>
                            <button className="pagination-button">Вперед &raquo;</button>
                        </nav>
                    </main>
                </div>
            </div>
        </div>
    );
};