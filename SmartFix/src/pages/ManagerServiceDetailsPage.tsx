import React from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/ServiceDetailsPage.css';

// Определяем структуру данных для услуги
interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    warranty: number;
    isAvailable: boolean;
    description: string;
    imageUrl?: string; // необязательное поле для изображения
}

// Определяем структуру для отзыва
interface Review {
    id: number;
    clientName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

// "Заглушка" с данными для конкретной услуги
const mockService: Service = {
    id: 2,
    name: 'Замена экрана смартфона',
    category: 'Ремонт смартфонов',
    price: 4500.00,
    warranty: 2,
    isAvailable: true,
    description: 'Включает в себя стоимость оригинального дисплейного модуля и работу мастера. Используются только сертифицированные комплектующие. Гарантия на выполненные работы - 6 месяцев.',
    imageUrl: 'https://rms.kufar.by/v1/list_thumbs_2x/adim1/1d9fc6f9-8473-44c4-86aa-7279c165c064.jpg'
};

// "Заглушка" с данными для отзывов
const mockReviews: Review[] = [
    {
        id: 1,
        clientName: 'Петрова Анна',
        rating: 5,
        comment: 'Все сделали очень быстро и качественно! Экран как новый. Спасибо большое мастеру Сидорову!',
        createdAt: '2025-10-26'
    },
    {
        id: 2,
        clientName: 'Алексеев Дмитрий',
        rating: 4,
        comment: 'В целом все хорошо, но пришлось немного подождать. К качеству работы претензий нет.',
        createdAt: '2025-10-22'
    },
    {id: 3, clientName: 'Иванов Иван', rating: 5, comment: 'Отличный сервис!', createdAt: '2025-10-19'},
];


export const ManagersServiceDetailsPage: React.FC = () => {
    return (
        <div>
            <ManagerHeader />
            <div className="details-page-container">
                {/* ========================================================== */}
                {/* ========= ЗАГОЛОВОК С КНОПКАМИ ДЕЙСТВИЙ (ИЗМЕНЕНО) ======== */}
                {/* ========================================================== */}
                <div className="page-header">
                    <h1 className="details-title">Детали услуги</h1>

                </div>

                {/* ========================================================== */}
                {/* ============== ОСНОВНАЯ ФОРМА (ИЗМЕНЕНО) ================= */}
                {/* ========================================================== */}
                <div className="form-container card">
                    <h2 className="card-title">Основная информация</h2>
                    <form id="service-details-form">
                        {/*<div className="form-grid">*/}
                            {/* Левая часть - поля */}
                            <div className="form-fields">
                                <div className="fields-row">
                                    <div className="input-group">
                                        <label htmlFor="service-name" className="form-label">Название услуги</label>
                                        <input type="text" id="service-name" className="form-input" defaultValue={mockService.name} />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="service-category" className="form-label">Категория</label>
                                        <select id="service-category" className="form-select" defaultValue={mockService.category}>
                                            <option>Ремонт смартфонов</option>
                                            <option>Ремонт ноутбуков</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="fields-row">
                                    <div className="input-group">
                                        <label htmlFor="service-price" className="form-label">Цена (руб.)</label>
                                        <input type="number" id="service-price" className="form-input" defaultValue={mockService.price} />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="warranty" className="form-label">Срок гарантии (мес.)</label>
                                        <input type="number" id="warranty" className="form-input" defaultValue={mockService.warranty} />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="service-description" className="form-label">Описание</label>
                                    <textarea id="service-description" className="form-textarea" rows={5} defaultValue={mockService.description}></textarea>
                                </div>

                                <div className="checkbox-group">
                                    <input type="checkbox" id="is-available" className="form-checkbox" defaultChecked={mockService.isAvailable} />
                                    <label htmlFor="is-available" className="checkbox-label">Услуга доступна для клиентов</label>
                                </div>
                            </div>
                        {/*</div>*/}
                        <div className="header-actions">
                            <button type="button" className="action-button delete-button">Удалить</button>
                            <button type="submit" form="service-details-form" className="action-button save-button">Сохранить</button>
                        </div>
                    </form>
                </div>

                <div className="reviews-container card">
                    <h2 className="card-title">Отзывы клиентов ({mockReviews.length})</h2>
                    <div className="reviews-list">
                        {mockReviews.map(review => (
                            <div key={review.id} className="review-item">
                                <strong className="review-author">{review.clientName}</strong>
                                <div className="review-header">
                                    <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                    <p>{review.createdAt}</p>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};