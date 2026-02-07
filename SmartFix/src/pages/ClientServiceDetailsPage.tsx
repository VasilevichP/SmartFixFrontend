import React, {useEffect, useState} from 'react';
import ClientHeader from "../components/ClientHeader.tsx";
import '../styles/ClientServiceDetailsPage.css';
import {useNavigate, useParams} from "react-router-dom";
import {type ServiceDetailsDto, servicesApi} from "../api/servicesApi.ts";
import {CreateRequestModal} from "../components/CreateRequestModal.tsx";
import {CreateReviewModal} from "../components/CreateReviewModal.tsx";

export const ClientServiceDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- ДАННЫЕ УСЛУГИ ---
    const [service, setService] = useState<ServiceDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- СОСТОЯНИЯ МОДАЛОК ---
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);


    const token = localStorage.getItem("token") || "";

    // Загрузка данных услуги
    const fetchServiceDetails = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const data = await servicesApi.getServiceById(token, id);
            setService(data);
        } catch (error) {
            console.error("Ошибка загрузки услуги", error);
            alert("Не удалось загрузить данные об услуге");
            navigate('/catalog');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchServiceDetails();
    }, [id]);

    if (isLoading) return <div style={{textAlign: 'center', padding: '50px'}}>Загрузка...</div>;
    if (!service) return <div style={{textAlign: 'center', padding: '50px'}}>Услуга не найдена</div>;

    return (
        <div>
            <ClientHeader/>
            <div className="client-service-page-container">
                <div className="details-page-wrapper">

                    {/* === ЛЕВАЯ КОЛОНКА: ИНФОРМАЦИЯ === */}
                    <div className="info-column">
                        <div className="info-card">
                            <div className="category-badge">{service.categoryName}</div>

                            <h1 className="service-title">{service.name}</h1>

                            <div className="device-tag">
                                Устройство: <strong>
                                {service.deviceModelName
                                    ? `${service.manufacturerName} ${service.deviceModelName}`
                                    : `${service.deviceTypeName} (Все модели)`}
                            </strong>
                            </div>

                            {service.averageRating > 0 && (
                                <div className="rating-badge">
                                    ★ {service.averageRating} <span
                                    className="rating-count">({service.reviews.length} отзывов)</span>
                                </div>
                            )}

                            <hr className="divider"/>

                            <h3 className="description-title">Описание услуги</h3>
                            <p className="description-text">{service.description || "Описание отсутствует."}</p>

                            <div className="pricing-block">
                                <div className="price-row">
                                    <span className="label">Стоимость:</span>
                                    <span className="value price">{service.price.toFixed(2)} руб.</span>
                                </div>
                                <div className="price-row">
                                    <span className="label">Гарантия:</span>
                                    <span className="value">{service.warrantyPeriod} мес.</span>
                                </div>
                            </div>

                            <button className="apply-button-large" onClick={() => setIsRequestModalOpen(true)}>
                                Оформить заявку
                            </button>
                        </div>
                    </div>

                    {/* === ПРАВАЯ КОЛОНКА: ОТЗЫВЫ === */}
                    <div className="reviews-column">
                        <div className="reviews-header-row">
                            <h2 className="section-title">Отзывы ({service.reviews.length})</h2>
                            <button className="secondary-button" onClick={() => setIsReviewModalOpen(true)}>
                                Написать отзыв
                            </button>
                        </div>

                        <div className="reviews-list">
                            {service.reviews.length > 0 ? (
                                service.reviews.map(review => (
                                    <div key={review.id} className="review-card">
                                        <div className="review-card-header">
                                            <strong className="review-author">{review.clientName}</strong>
                                            <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                        </div>
                                        <div className="review-stars">
                                            {'★'.repeat(review.rating)}
                                            <span className="empty-stars">{'☆'.repeat(5 - review.rating)}</span>
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-reviews">
                                    <p>Отзывов пока нет.</p>
                                    <p>Ваше мнение может стать первым!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === МОДАЛЬНЫЕ ОКНА === */}

                    {/* 1. Заявка */}
                    <CreateRequestModal
                        isOpen={isRequestModalOpen}
                        onClose={() => setIsRequestModalOpen(false)}
                        initialData={{
                            serviceId: service.id,
                            serviceName: service.name,
                            deviceTypeId: service.deviceTypeId,
                            manufacturerId: service.manufacturerId,
                            deviceModelId: service.deviceModelId
                        }}
                    />

                    {/* 2. Отзыв (Наш новый компонент) */}
                    <CreateReviewModal
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        serviceId={service.id}
                        onSuccess={fetchServiceDetails} // Обновляем страницу после успеха
                    />

                </div>
            </div>
        </div>
    );
};