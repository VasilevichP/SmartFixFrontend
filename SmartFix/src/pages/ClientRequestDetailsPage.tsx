import React, {useEffect, useState} from 'react';
import '../styles/ClientRequestDetails.css';
import ClientHeader from "../components/ClientHeader.tsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {type RequestDetailsDto, requestsApi, STATUS_NUMBER_MAP} from "../api/requestsApi.ts";
import {useApi} from "../hooks/useApi.ts";

export const ClientRequestDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const BASE_IMG_URL = "http://localhost:5251/";

    const [request, setRequest] = useState<RequestDetailsDto | null>(null);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");

    const [approve] = useApi(requestsApi.approveRequest);
    const [reject] = useApi(requestsApi.rejectRequest);
    const[submitReview, { isLoading: isReviewSubmitting }] = useApi(requestsApi.leaveReview);

    const fetchRequest = async () => {
        if (!id) return;

        const data = await requestsApi.getById(token, id);
        setRequest(data);
    };
    const [loadData, {isLoading}] = useApi(fetchRequest, false);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        loadData();
    }, [id, navigate]);

    const handleApprove = async () => {
        if (window.confirm("Вы согласны с итоговой стоимостью и списком работ?")) {
            await approve(token, id!);
            loadData(); // Перезагружаем страницу (статус изменится на "В ремонте")
        }
    };

    const handleReject = async () => {
        if (window.confirm("Вы уверены, что хотите отказаться от ремонта? Заявка будет отменена.")) {
            await reject(token, id!);
            loadData();
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitReview(token, id!, rating, reviewComment);
        loadData();
    };
    if (isLoading) return <div className="loading-state">Загрузка информации...</div>;
    if (!request) return <div className="error-state">Заявка не найдена</div>;

    const statusInfo = STATUS_NUMBER_MAP[request.status] || {label: 'Неизвестно', class: ''};

    return (
        <div>
            <ClientHeader/>
            <div className="request-details-client-page">

                <div className="page-header-row">
                    <Link to="/profile" className="back-link">&larr; Вернуться в профиль</Link>
                    <button className="action-button secondary-button small-btn">Скачать квитанцию</button>
                </div>

                {/* БЛОК СОГЛАСОВАНИЯ (Отображается только если статус == 3 "На согласовании") */}
                {request.status === 4 && (
                    <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: '#bae6fd', borderStyle: 'solid', borderWidth: '2px', padding: '25px', marginBottom: '25px' }}>
                        <h2 style={{ color: '#0369a1', marginTop: 0 }}>⚠️ Требуется ваше согласие</h2>
                        <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>
                            Мастер провел диагностику и обновил список необходимых работ. Итоговая стоимость составит <strong>{request.finalPrice.toFixed(2)} руб.</strong>
                            Пожалуйста, ознакомьтесь со списком ниже и примите решение.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="action-button save-button" style={{ backgroundColor: '#16a34a' }} onClick={handleApprove}>
                                Согласиться на ремонт
                            </button>
                            <button className="action-button cancel-button" onClick={handleReject}>
                                Отказаться
                            </button>
                        </div>
                    </div>
                )}

                {/* БЛОК ОТМЕНЫ */}
                {request.status === 7 && request.cancellationReason && (
                    <div className="card" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5', borderStyle: 'solid', borderWidth: '1px', padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ color: '#b91c1c', margin: '0 0 10px 0' }}>Заявка отменена</h3>
                        <p style={{ margin: 0, color: '#7f1d1d' }}>Причина: {request.cancellationReason}</p>
                    </div>
                )}

                <div className="card" style={{ padding: '30px', color:'#1a1a1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div>
                            <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Заявка #{request.id.substring(0, 8)}</h1>
                            <span className={`status-badge ${statusInfo.class}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', color: '#666' }}>Итого к оплате:</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: request.status === 3 ? '#ea580c' : '#111827' }}>
                                {request.finalPrice.toFixed(2)} руб.
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                        {/* ЛЕВАЯ КОЛОНКА (Детали) */}
                        <div>
                            <h3 style={{ marginTop: 0 }}>Устройство</h3>
                            <p><strong>Тип:</strong> {request.deviceTypeName}</p>
                            <p><strong>Модель:</strong> {request.deviceModelName}</p>
                            <p><strong>S/N:</strong> {request.deviceSerialNumber || "—"}</p>

                            <h3 style={{ marginTop: '25px' }}>Ваше описание проблемы</h3>
                            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
                                {request.description}
                            </div>

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
                                                <img src={`${BASE_IMG_URL}${path}`} alt="Фото" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {request.diagnosticResult && (
                                <>
                                    <h3 style={{ marginTop: '25px', color: '#2563eb' }}>Заключение мастера</h3>
                                    <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
                                        {request.diagnosticResult}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ПРАВАЯ КОЛОНКА (Чек и смета) */}
                        <div>
                            <h3 style={{ marginTop: 0 }}>Смета работ и услуг</h3>
                            {request.services.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {request.services.map(s => (
                                        <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                            <span>{s.serviceName}</span>
                                            <strong>{s.price.toFixed(2)} руб.</strong>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#999', fontSize: '14px' }}>Услуги еще не назначены.</p>
                            )}

                            {request.appliedDiscounts.length > 0 && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '14px' }}>Примененные скидки:</h4>
                                    {request.appliedDiscounts.map(d => (
                                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontSize: '14px', marginBottom: '5px' }}>
                                            <span>{d.name}</span>
                                            <span>-{d.savedAmount.toFixed(2)} руб.</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {request.type === 1 && (
                                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Логистика (Выездной ремонт)</h4>
                                    <p style={{ fontSize: '14px', margin: '0 0 5px 0' }}><strong>Адрес:</strong> {request.fieldAddress}</p>
                                    <p style={{ fontSize: '14px', margin: 0 }}><strong>Время:</strong> {new Date(request.scheduledTime!).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* БЛОК ОТЗЫВА (Только если статус "Закрыта" (7)) */}
                {request.status === 6 && (
                    <div className="card" style={{ marginTop: '25px', padding: '30px',color:'#1a1a1a' }}>
                        <h2 style={{ marginTop: 0 }}>Оценка качества обслуживания</h2>

                        {request.hasReview ? (
                            <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '24px', color: '#eab308', marginBottom: '10px' }}>
                                    {"★".repeat(request.reviewRating || 5)}{"☆".repeat(5 - (request.reviewRating || 5))}
                                </div>
                                <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>"{request.reviewComment || "Без комментария"}"</p>
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit}>
                                <p style={{ color: '#666', marginBottom: '20px' }}>Пожалуйста, оцените работу мастера и оставьте отзыв. Это поможет нам стать лучше!</p>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px' }}>Ваша оценка:</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num} type="button"
                                                onClick={() => setRating(num)}
                                                style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', color: rating >= num ? '#eab308' : '#d1d5db' }}
                                            >★</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '10px' }}>Комментарий:</label>
                                    <textarea className="form-textarea" rows={3} placeholder="Всё понравилось, мастер приехал вовремя..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} required />
                                </div>

                                <button type="submit" className="action-button save-button" disabled={isReviewSubmitting}>
                                    {isReviewSubmitting ? "Отправка..." : "Отправить отзыв"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};