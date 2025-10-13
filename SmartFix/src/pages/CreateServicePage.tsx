import React from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/CreateServicePage.css';

export const CreateServicePage: React.FC = () => {
    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="form-header">
                    <h1 className="form-title">Создание новой услуги</h1>
                    <p className="form-subtitle">Заполните все поля, чтобы добавить услугу в каталог</p>
                </div>

                <div className="form-container">
                    <form>
                        <div className="form-grid">
                            {/* Название услуги */}
                            <div className="input-group">
                                <label htmlFor="service-name" className="form-label">Название услуги</label>
                                <input type="text" id="service-name" className="form-input"
                                       placeholder="Например, Замена экрана iPhone 14 Pro"/>
                            </div>

                            {/* Категория услуги */}
                            <div className="input-group">
                                <label htmlFor="service-category" className="form-label">Категория</label>
                                <select id="service-category" className="form-select">
                                    <option value="">Выберите категорию</option>
                                    <option value="smartphones">Ремонт смартфонов</option>
                                    <option value="laptops">Ремонт ноутбуков</option>
                                    <option value="data_recovery">Восстановление данных</option>
                                </select>
                            </div>

                            {/* Описание услуги (на всю ширину) */}
                            <div className="input-group full-width">
                                <label htmlFor="service-description" className="form-label">Подробное описание</label>
                                <textarea id="service-description" className="form-textarea"
                                          placeholder="Опишите, что входит в услугу, какие детали используются и т.д."
                                          rows={4}></textarea>
                            </div>

                            {/* Цена */}
                            <div className="input-group">
                                <label htmlFor="service-price" className="form-label">Цена (руб.)</label>
                                <input type="number" id="service-price" className="form-input" placeholder="100.00"
                                       step="0.01"/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="warranty" className="form-label">Срок гарантии (месяцы)</label>
                                <input type="number" id="warranty" className="form-input"
                                       placeholder="Срок гарантии"/>
                            </div>

                            {/* Загрузка изображения (на всю ширину) */}
                            <div className="input-group full-width">
                                <label htmlFor="service-image" className="form-label">Изображение для услуги</label>
                                <input type="file" id="service-image" className="form-file-input"/>
                            </div>

                            {/* Статус доступности (на всю ширину) */}
                            <div className="checkbox-group full-width">
                                <input type="checkbox" id="is-available" className="form-checkbox" defaultChecked/>
                                <label htmlFor="is-available" className="checkbox-label">Сделать услугу доступной для
                                    клиентов сразу</label>
                            </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="form-actions">
                            <button type="button" className="action-button cancel-button">Отмена</button>
                            <button type="submit" className="action-button submit-button">Создать услугу</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
