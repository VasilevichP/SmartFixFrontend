import React, {useEffect, useState} from 'react';
import '../styles/ClientRequestDetails.css';
import ClientHeader from "../components/ClientHeader.tsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {type RequestDetailsDto, requestsApi, STATUS_NUMBER_MAP} from "../api/requestsApi.ts";

export const ClientRequestDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [request, setRequest] = useState<RequestDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    // Базовый URL для картинок (замените порт на свой, если отличается)
    const BASE_IMG_URL = "http://localhost:5251/";

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            if (!id) return;

            try {
                setIsLoading(true);
                const data = await requestsApi.getById(token,id);
                setRequest(data);
            } catch (error) {
                console.error("Ошибка загрузки", error);
                alert("Не удалось загрузить данные заявки");
                navigate('/profile');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    // const handleDownloadReceipt = async () => {
    //     const token = localStorage.getItem('token');
    //     if (!token || !request) return;
    //
    //     try {
    //         setIsDownloading(true);
    //         const blob = await requestsApi.downloadReceipt(request.id, token);
    //
    //         // Создаем ссылку в памяти браузера и кликаем по ней
    //         const url = window.URL.createObjectURL(blob);
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', `Receipt_${request.id.substring(0, 8)}.pdf`);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (error) {
    //         console.error("Ошибка скачивания", error);
    //         alert("Не удалось скачать квитанцию. Попробуйте позже.");
    //     } finally {
    //         setIsDownloading(false);
    //     }
    // };

    if (isLoading) return <div className="loading-state">Загрузка информации...</div>;
    if (!request) return <div className="error-state">Заявка не найдена</div>;

    const statusInfo = STATUS_NUMBER_MAP[request.status] || { label: 'Неизвестно', class: '' };

    return (
        <div>
            <ClientHeader/>
            <div className="request-details-client-page">

                {/* --- НАВИГАЦИЯ И ЗАГОЛОВОК --- */}
                <div className="page-header-row">
                    <div>
                        <Link to="/profile" className="back-link">&larr; К списку заявок</Link>
                        <div className="header-title-group">
                            <h1 className="details-title">Заявка #{request.id.substring(0, 8)}...</h1>
                            <span className={`status-badge-large ${statusInfo.class}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Кнопка скачивания теперь здесь */}
                    <button
                        className="download-button-header"
                        // onClick={handleDownloadReceipt}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Скачивание...' : 'Скачать квитанцию'}
                    </button>
                </div>

                <div className="card main-card">

                    <div className="status-highlight-section">
                        <div className="status-block">
                            <span className="info-label">Дата создания</span>
                            <span className="date-value">
                                {new Date(request.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div className="status-block">
                            <span className="info-label">Итоговая стоимость</span>
                            <span className="price-value">
                                {request.price ? `${request.price} руб.` : 'Рассчитывается'}
                            </span>
                        </div>
                    </div>

                    <div className="details-content-grid">

                        {/* --- ЛЕВАЯ ЧАСТЬ: ИНФО --- */}
                        <div className="details-section">
                            <h2 className="section-title">Основная информация</h2>
                            <div className="info-grid">
                                <div className="info-block full-width">
                                    <strong className="info-label">Услуга:</strong>
                                    <span className="info-value service-name-highlight">
                                        {request.serviceName || "Индивидуальный запрос"}
                                    </span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Тип:</strong>
                                    <span className="info-value">{request.deviceType}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Модель:</strong>
                                    <span className="info-value">{request.deviceModel}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Серийный номер:</strong>
                                    <span className="info-value">{request.deviceSerialNumber || "Не указан"}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Мастер:</strong>
                                    <span className="info-value">
                                        {request.specialistName || 'Назначается...'}
                                    </span>
                                </div>
                            </div>

                            <div className="info-block full-width" style={{marginTop: '20px'}}>
                                <strong className="info-label">Ваше описание проблемы:</strong>
                                <p className="info-description">{request.description}</p>
                            </div>

                            {/* Фотографии */}
                            {request.photoPaths && request.photoPaths.length > 0 && (
                                <div className="info-block full-width" style={{marginTop: '20px'}}>
                                    <strong className="info-label">Прикрепленные фото:</strong>
                                    <div className="client-files-list">
                                        {request.photoPaths.map((path, idx) => (
                                            <a
                                                key={idx}
                                                href={`${BASE_IMG_URL}${path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="client-file-item"
                                            >
                                                <img src={`${BASE_IMG_URL}${path}`} alt="Фото поломки" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- ПРАВАЯ ЧАСТЬ: ИСТОРИЯ --- */}
                        <div className="history-section">
                            <h2 className="section-title">История статусов</h2>
                            <div className="timeline">
                                {request.history && request.history.length > 0 ? (
                                    request.history.map((h, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <span className="timeline-status">{STATUS_NUMBER_MAP[parseInt(h.status)]?.label || h.status}</span>
                                                <span className="timeline-date">{new Date(h.date).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{color: '#999'}}>История пуста</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};