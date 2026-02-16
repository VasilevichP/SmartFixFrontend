import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/RequestDetailsPage.css';
import {type RequestDetailsDto, requestsApi, STATUS_NUMBER_MAP} from "../api/requestsApi.ts";
import {specialistsApi, type SpecialistWithLoad} from "../api/specialistsApi.ts";

export const ManagerRequestDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // --- State ---
    const [request, setRequest] = useState<RequestDetailsDto | null>(null);
    const [specialists, setSpecialists] = useState<SpecialistWithLoad[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [selectedStatus, setSelectedStatus] = useState<number>(0);
    const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");
    const [price, setPrice] = useState<string>("");

    // Загрузка данных
    useEffect(() => {
        if (!token || !id) {
            navigate('/');
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                const [reqData, specData] = await Promise.all([
                    requestsApi.getById(token, id),
                    specialistsApi.getAllSpecialistsWithLoad(token)
                ]);

                setRequest(reqData);
                setSpecialists(specData);

                // Инициализация формы
                setSelectedStatus(reqData.status);
                setSelectedSpecialist(reqData.specialistId || "");
                setPrice(reqData.price ? reqData.price.toString() : "");

            } catch (error) {
                console.error("Ошибка загрузки", error);
                alert("Ошибка при загрузке данных");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, token, navigate]);

    // Сохранение изменений
    const handleSave = async () => {
        if (!token || !request) return;

        try {

            if (price && parseFloat(price) !== request.price) {
                console.log('price', price);
                await requestsApi.assignPrice(token, request.id, parseFloat(price));
            }
            if (selectedSpecialist !== (request.specialistId || "")) {
                if (selectedSpecialist) {
                    console.log('specialists',selectedSpecialist);
                    await requestsApi.assignSpecialist(token, request.id, selectedSpecialist);
                }
            }
            if (selectedStatus !== request.status) {
                console.log('status',selectedStatus);
                await requestsApi.updateStatus(token, request.id, selectedStatus);
            }
            window.location.reload();
        } catch (error:any) {
            console.error(error);
            const msg = error.response?.data?.detail || error.response?.data || "Ошибка при сохранении";
            alert(msg);
        }
    };

    // Скачивание квитанции (Заглушка или реальный вызов)
    const handleDownloadReceipt = () => {
        // window.open(`${API_URL}/Requests/${id}/receipt`, '_blank');
        alert("Скачивание квитанции...");
    };

    if (isLoading) return <div className="loading-container">Загрузка...</div>;
    if (!request) return <div className="error-container">Заявка не найдена</div>;

    // Базовый URL для картинок (зависит от настроек сервера)
    const BASE_IMG_URL = "http://localhost:5251/";

    return (
        <div>
            <ManagerHeader/>
            <div className="request-details-page">

                {/* --- ХЕДЕР --- */}
                <div className="page-header">
                    <div>
                        <h1 className="details-title">Заявка #{request.id.substring(0, 8)}...</h1>
                        <span className={`status-badge-large ${STATUS_NUMBER_MAP[request.status]?.class || ''}`}>
                            {STATUS_NUMBER_MAP[request.status]?.label || request.statusName}
                        </span>
                    </div>
                    <div className="header-actions">
                        <button type="button" className="action-button secondary-button"
                                onClick={handleDownloadReceipt}>
                            Скачать квитанцию
                        </button>
                        <button type="button" className="action-button save-button" onClick={handleSave}>
                            Сохранить изменения
                        </button>
                    </div>
                </div>

                <div className="details-layout">

                    {/* --- ЛЕВАЯ КОЛОНКА (ДЕТАЛИ) --- */}
                    <div className="main-content">
                        <div className="card">
                            <h2 className="card-title">Информация о заявке</h2>
                            <div className="info-grid">
                                <div className="info-block">
                                    <strong className="info-label">Создана:</strong>
                                    <span className="info-value">{new Date(request.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Закрыта:</strong>
                                    <span className="info-value">
                                        {request.closedAt ? new Date(request.closedAt).toLocaleString() : '—'}
                                    </span>
                                </div>

                                <div className="info-block">
                                    <strong className="info-label">Устройство:</strong>
                                    <span className="info-value">{request.deviceType} {request.deviceModel}</span>
                                    <div style={{
                                        fontSize: '0.85em',
                                        color: '#666'
                                    }}>SN: {request.deviceSerialNumber || "Нет"}</div>
                                </div>

                                <div className="info-block">
                                    <strong className="info-label">Услуга:</strong>
                                    <span className="info-value">{request.serviceName? request.serviceName : 'Индивидуальная услуга'}</span>
                                </div>
                            </div>

                            <h2 className="card-title">Информация о клиенте</h2>
                            <div className="info-grid">

                                <div className="info-block">
                                    <strong className="info-label">ФИО:</strong>
                                    <span className="info-value">{request.clientName}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Телефон:</strong>
                                    <span className="info-value">{request.clientPhone}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Email:</strong>
                                    <span className="info-value">{request.clientEmail}</span>
                                </div>

                            </div>

                            {/* Описание */}
                            <div className="info-block full-width" style={{marginTop: '20px'}}>
                                <strong className="info-label">Описание проблемы:</strong>
                                <p className="info-description">{request.description}</p>
                            </div>

                            {/* Фотографии */}
                            {request.photoPaths && request.photoPaths.length > 0 && (
                                <div className="info-block full-width" style={{marginTop: '20px'}}>
                                    <strong className="info-label">Прикрепленные фото:</strong>
                                    <div className="files-list">
                                        {request.photoPaths.map((path, idx) => (
                                            <a
                                                key={idx}
                                                href={`${BASE_IMG_URL}${path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="file-preview-link"
                                            >
                                                <img
                                                    src={`${BASE_IMG_URL}${path}`}
                                                    alt={`Фото ${idx + 1}`}
                                                    className="file-thumbnail"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- ПРАВАЯ КОЛОНКА (УПРАВЛЕНИЕ) --- */}
                    <div className="sidebar-content">
                        <div className="card">
                            <h2 className="card-title">Управление</h2>
                            <div className="sidebar-form">

                                {/* Статус */}
                                <div className="input-group">
                                    <label htmlFor="request-status" className="form-label">Статус:</label>
                                    <select
                                        id="request-status"
                                        className="form-select"
                                        value={selectedStatus}
                                        disabled={request.status==4 || request.status==5}
                                        onChange={e => setSelectedStatus(parseInt(e.target.value))}
                                    >
                                        {Object.entries(STATUS_NUMBER_MAP).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Специалист */}
                                <div className="input-group">
                                    <label htmlFor="request-specialist" className="form-label">Исполнитель:</label>
                                    <select
                                        id="request-specialist"
                                        className="form-select"
                                        disabled={request.status==4 || request.status==5}
                                        value={selectedSpecialist}
                                        onChange={e => setSelectedSpecialist(e.target.value)}
                                    >
                                        <option value="">Не назначен</option>
                                        {specialists.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} — {s.activeRequestsCount} заяв.
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Цена */}
                                <div className="input-group">
                                    <label htmlFor="request-price" className="form-label">
                                        Итоговая цена (руб.):
                                    </label>
                                    <input
                                        id="request-price"
                                        className="form-select"
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        disabled={!!request.price && request.price > 0}
                                        title={request.price ? "Цена уже установлена" : "Введите цену"}
                                    />
                                    {request.price && request.price > 0 && (
                                        <div style={{fontSize: '0.8rem', color: 'green', marginTop: '4px'}}>
                                            ✔ Цена утверждена
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* История статусов */}
                        <div className="card">
                            <h2 className="card-title">История статусов</h2>
                            <div className="history-list">
                                {request.history && request.history.length > 0 ? (
                                    request.history.map((h, idx) => (
                                        <div key={idx} className="history-item">
                                            <span
                                                className={`status-badge-small ${STATUS_NUMBER_MAP[parseInt(h.status)]?.class || ''}`}>
                                                {STATUS_NUMBER_MAP[parseInt(h.status)]?.label || ''} {/* Или маппить текст если с бэка приходит строка */}
                                            </span>
                                            <span className="history-date">
                                                {new Date(h.date).toLocaleString()}
                                            </span>
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