import React from 'react';
import '../styles/DictionaryPage.css';
import ManagerHeader from "../components/ManagerHeader.tsx";

// Определяем структуры данных
interface ServiceCategory {
    id: number;
    name: string;
}

interface Specialist {
    id: number;
    name: string;
}

// "Заглушки" с данными для примера
const mockCategories: ServiceCategory[] = [
    {id: 1, name: 'Ремонт ноутбуков'},
    {id: 2, name: 'Ремонт смартфонов'},
    {id: 3, name: 'Восстановление данных'},
    {id: 4, name: 'Обслуживание ПК'},
];

const mockSpecialists: Specialist[] = [
    {id: 1, name: 'Сидоров А.В.'},
    {id: 2, name: 'Козлов Н.Н.'},
    {id: 3, name: 'Петров Б.Е.'},
];

export const ManagerDictionariesPage: React.FC = () => {
    return (
        <div>
            <ManagerHeader/>
            <div className="dictionaries-page-container">
                <h1 className="page-title">Управление справочниками</h1>

                <div className="dictionaries-grid">
                    {/* ========================================================== */}
                    {/* ================= КОЛОНКА "КАТЕГОРИИ" =================== */}
                    {/* ========================================================== */}
                    <div className="dictionary-card">
                        <h2 className="card-title">Категории услуг</h2>
                        <div className="add-item-form">
                            <input type="text" className="form-input" placeholder="Название новой категории..."/>
                            <button className="download-button add-button">Добавить</button>
                        </div>
                        <ul className="items-list">
                            {mockCategories.map(category => (
                                <li key={category.id} className="list-item">
                                    <span className="item-name">{category.name}</span>
                                    <div className="item-actions">
                                        <button className="icon-button edit-button">✏️</button>
                                        <button className="icon-button delete-button">🗑️</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ========================================================== */}
                    {/* ================= КОЛОНКА "СПЕЦИАЛИСТЫ" ================= */}
                    {/* ========================================================== */}
                    <div className="dictionary-card">
                        <h2 className="card-title">Специалисты</h2>
                        <div className="add-item-form">
                            <input type="text" className="form-input" placeholder="ФИО нового специалиста..."/>
                            <button className="download-button add-button">Добавить</button>
                        </div>
                        <ul className="items-list">
                            {mockSpecialists.map(specialist => (
                                <li key={specialist.id} className="list-item">
                                    <span className="item-name">{specialist.name}</span>
                                    <div className="item-actions">
                                        <button className="icon-button edit-button">✏️</button>
                                        <button className="icon-button delete-button">🗑️</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};