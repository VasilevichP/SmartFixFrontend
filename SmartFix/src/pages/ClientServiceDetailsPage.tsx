import React, {useState} from 'react';
import ClientHeader from "../components/ClientHeader.tsx";
import '../styles/ClientServiceDetailsPage.css';

// Определяем структуру данных для услуги
interface Service {
    id: number;
    name: string;
    category: string;
    price: number;
    warranty: number;
    description: string;
    imageUrl: string;
}

interface Review {
    id: number;
    clientName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

// "Заглушка" с данными для примера
const mockService: Service = {
    id: 2,
    name: 'Замена экрана смартфона',
    category: 'Ремонт смартфонов',
    price: 4500.00,
    warranty: 6,
    description: 'Включает в себя стоимость оригинального дисплейного модуля и работу мастера. Используются только сертифицированные комплектующие. Гарантия на выполненные работы - 6 месяцев. Подходит для моделей iPhone 12-14, Samsung Galaxy S20-S23.',
    imageUrl: 'https://rms.kufar.by/v1/list_thumbs_2x/adim1/1d9fc6f9-8473-44c4-86aa-7279c165c064.jpg'
};

const mockReviews: Review[] = [
    {
        id: 1,
        clientName: 'Петрова Анна',
        rating: 5,
        comment: 'Все сделали очень быстро и качественно! Экран как новый. Спасибо!',
        createdAt: '26.10.2025'
    },
    {
        id: 2,
        clientName: 'Алексеев Дмитрий',
        rating: 4,
        comment: 'В целом все хорошо, но пришлось немного подождать. К качеству работы претензий нет.',
        createdAt: '22.10.2025'
    },
];

export const ClientServiceDetailsPage: React.FC = () => {
    // --- Состояние для управления видимостью модального окна ---
    const [isApplicationModalOpen, setApplicationModalOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

    // --- Функции для открытия и закрытия модального окна ---
    const handleOpenModal = () => setApplicationModalOpen(true);

    const handleApplicationSubmit = () => {
        // Здесь в реальном приложении будет логика отправки данных на сервер
        // Закрываем форму заявки
        setApplicationModalOpen(false);
        // Открываем окно с подтверждением
        setSuccessModalOpen(true);
    };

    return (
        <div>
            <ClientHeader/>
            <div className="service-details-client-page">
                <div className="details-layout">
                    {/* --- Левая колонка: Изображение --- */}
                    <div className="details-image-container">
                        <img src={mockService.imageUrl} alt={mockService.name} className="details-image"/>
                    </div>

                    {/* --- Правая колонка: Информация и кнопка --- */}
                    <div className="details-info-container">
                        <span className="details-category">{mockService.category}</span>
                        <h1 className="details-title">{mockService.name}</h1>
                        <p className="details-description">{mockService.description}</p>

                        <div className="details-meta">
                            <div className="meta-item">
                                <span className="meta-label">Цена:</span>
                                <span className="meta-value price">{mockService.price.toFixed(2)} руб.</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Срок гарантии:</span>
                                <span className="meta-value">{mockService.warranty} месяц(ев)</span>
                            </div>
                        </div>

                        <button className="apply-button" onClick={handleOpenModal}>
                            Подать заявку на эту услугу
                        </button>
                    </div>
                </div>


                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2 className="section-title">Отзывы клиентов ({mockReviews.length})</h2>
                        <button className="secondary-button" onClick={() => setReviewModalOpen(true)}>
                            Оставить отзыв
                        </button>
                    </div>
                    <div className="reviews-list">
                        {mockReviews.map(review => (
                            <div key={review.id} className="review-item">
                                <strong className="review-author">{review.clientName}</strong>
                                <div className="review-header">
                                    <span
                                        className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                    <p>{review.createdAt}</p>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ========================================================== */}
                {/* ==================== МОДАЛЬНОЕ ОКНО ====================== */}
                {/* ========================================================== */}
                {isApplicationModalOpen && (
                    <div className="modal-overlay" onClick={() => setApplicationModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Новая заявка: {mockService.name}</h2>
                                <button className="modal-close-button"
                                        onClick={() => setApplicationModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <form className="application-form">
                                    {/* --- НОВЫЙ БЛОК: Персональные данные --- */}
                                    <div className="form-row">
                                        <div className="input-group">
                                            <label htmlFor="last-name" className="form-label">* Фамилия</label>
                                            <input type="text" id="last-name" className="form-input"
                                                   placeholder="Иванов"/>
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="first-name" className="form-label">* Имя</label>
                                            <input type="text" id="first-name" className="form-input"
                                                   placeholder="Иван"/>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="middle-name" className="form-label">Отчество</label>
                                        <input type="text" id="middle-name" className="form-input"
                                               placeholder="Иванович"/>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="phone" className="form-label">* Контактный телефон</label>
                                        <input type="tel" id="phone" className="form-input" placeholder="375293334455"/>
                                    </div>

                                    <hr className="form-divider"/>
                                    {/* --- Конец нового блока --- */}
                                    <div className="form-row">
                                        <div className="input-group">
                                            <label htmlFor="device-model" className="form-label">* Модель вашего
                                                устройства</label>
                                            <input type="text" id="device-model" className="form-input"
                                                   placeholder="Например, Apple iPhone 14 Pro"/>
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="serial-number" className="form-label">* Серийный
                                                номер</label>
                                            <input type="text" id="serial-number" className="form-input"
                                                   placeholder="Можно найти на коробке или в настройках"/>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="problem-description" className="form-label">Опишите
                                            проблему</label>
                                        <textarea id="problem-description" className="form-textarea" rows={4}
                                                  placeholder="Например, трещина в правом верхнем углу..."></textarea>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="files" className="form-label">Прикрепите фото/видео
                                            (необязательно)</label>
                                        <input type="file" id="files" className="form-file-input" multiple/>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button className="action-button cancel-button"
                                        onClick={() => setApplicationModalOpen(false)}>Отмена
                                </button>
                                <button className="action-button submit-button"
                                        onClick={handleApplicationSubmit}>Отправить заявку
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isReviewModalOpen && (
                    <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Оставить отзыв об услуге</h2>
                                <button className="modal-close-button"
                                        onClick={() => setReviewModalOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <form className="review-form">
                                    <div className="input-group">
                                        <label className="form-label">Ваша оценка</label>
                                        <div className="rating-input">
                                            {/* В реальном приложении здесь будет интерактивный компонент звезд */}
                                            <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="review-comment" className="form-label">Комментарий</label>
                                        <textarea id="review-comment" className="form-textarea" rows={5}
                                                  placeholder="Поделитесь вашими впечатлениями о качестве сервиса..."></textarea>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button className="action-button cancel-button"
                                        onClick={() => setReviewModalOpen(false)}>Отмена
                                </button>
                                <button className="action-button submit-button">Отправить отзыв</button>
                            </div>
                        </div>
                    </div>
                )}

                {isSuccessModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-body">
                                <div className="success-icon-container">
                                    <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                                         viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <h2 className="success-title">Заявка успешно создана!</h2>
                                <p className="success-message">
                                    Вашей заявке присвоен номер <strong>#SF-1026</strong>. <br/>
                                    Вы можете скачать цифровую квитанцию для сохранения. <br/>
                                    (Квитанция также будет доступна в личном кабинете)
                                </p>
                            </div>
                            <div className="modal-footer centered-footer">
                                {/* --- Кнопка для скачивания --- */}
                                <a
                                    href="/path/to/your/receipt.pdf" // Здесь будет реальный путь к файлу
                                    download="Квитанция_SF-1026.pdf" // Имя файла при скачивании
                                    className="action-button download-button"
                                >
                                    Скачать квитанцию
                                </a>
                                <button className="action-button cancel-button"
                                        onClick={() => setSuccessModalOpen(false)}>Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
