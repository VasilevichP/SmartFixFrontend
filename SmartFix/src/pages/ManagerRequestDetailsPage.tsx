import React from 'react';
import ManagerHeader from "../components/ManagerHeader.tsx";
import '../styles/RequestDetailsPage.css';

// Определяем необходимые структуры данных
interface ServiceRequest {
    id: string; // PublicId
    status: 'Новая' | 'В работе' | 'На диагностике' | 'Готова' | 'Закрыта' | 'Отменена';
    description: string;
    deviceSerialNumber: string;
    executionTime: number; // в часах
    createdAt: string;
    closedAt: string | null;
    deviceType: string;
    deviceModel: string;
    clientName: string;
    serviceName: string;
    specialistName: string | null;
}

interface AttachedFile {
    id: number;
    name: string;
    url: string; // ссылка для просмотра/скачивания
    size: string;
}

interface ClientHistoryRequest {
    id: string;
    status: ServiceRequest['status'];
    createdAt: string;
}

// "Заглушка" с данными для текущей заявки
const mockCurrentRequest: ServiceRequest = {
    id: 'SF-1023',
    status: 'В работе',
    description: 'На экране появилась трещина после падения с небольшой высоты. Сенсор в верхней части экрана не реагирует на касания. Прошу провести диагностику и замену дисплейного модуля.',
    deviceSerialNumber: 'F5K-D9G-3H7-J1L',
    executionTime: 4, // 4 часа
    createdAt: '2025-10-26 09:15',
    closedAt: null,
    deviceType: 'Смартфон',
    deviceModel: 'Apple iPhone 14 Pro',
    clientName: 'Петрова Анна',
    serviceName: 'Замена экрана смартфона',
    specialistName: 'Сидоров А.В.',
};

// "Заглушка" для прикрепленных файлов
const mockFiles: AttachedFile[] = [
    {id: 1, name: 'photo_crack_1.jpg', url: '#', size: '1.2 MB'},
    {id: 2, name: 'photo_crack_2.jpg', url: '#', size: '1.4 MB'},
];

// "Заглушка" для истории заявок клиента
const mockClientHistory: ClientHistoryRequest[] = [
    {id: 'SF-0812', status: 'Закрыта', createdAt: '2024-05-11'},
    {id: 'SF-0654', status: 'Закрыта', createdAt: '2023-11-20'},
];

// Функция-помощник для статусов (из прошлых примеров)
const getStatusClassName = (status: ServiceRequest['status']) => {
    const classMap = {
        'Новая': 'status-new', 'В работе': 'status-in-progress', 'На диагностике': 'status-diagnostics',
        'Готова': 'status-ready', 'Закрыта': 'status-closed', 'Отменена': 'status-cancelled'
    };
    return classMap[status] || '';
};

export const ManagerRequestDetailsPage: React.FC = () => {
    return (
        <div>
            <ManagerHeader />
            <div className="request-details-page">
                {/* --- ЗАГОЛОВОК С ДЕЙСТВИЯМИ --- */}
                <div className="page-header">
                    <div>
                        <h1 className="details-title">Заявка #{mockCurrentRequest.id}</h1>
                        <span className={`status-badge-large ${getStatusClassName(mockCurrentRequest.status)}`}>
            {mockCurrentRequest.status}
          </span>
                    </div>
                    <div className="header-actions">
                        <button type="button" className="action-button secondary-button">Скачать квитанцию</button>
                        <button type="submit" className="action-button save-button">Сохранить изменения</button>
                    </div>
                </div>

                <div className="details-layout">
                    {/* --- ОСНОВНАЯ ИНФОРМАЦИЯ О ЗАЯВКЕ (ЛЕВАЯ КОЛОНКА) --- */}
                    <div className="main-content">
                        <div className="card">
                            <h2 className="card-title">Детали заявки</h2>
                            <div className="info-grid">
                                <div className="info-block">
                                    <strong className="info-label">Время создания:</strong>
                                    <span className="info-value">{mockCurrentRequest.createdAt}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Время закрытия:</strong>
                                    <span className="info-value">{mockCurrentRequest.closedAt || '—'}</span>
                                </div>
                                {/* Блок Устройство */}
                                <div className="info-block">
                                    <strong className="info-label">Устройство:</strong>
                                    <span
                                        className="info-value">{mockCurrentRequest.deviceType} {mockCurrentRequest.deviceModel}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Серийный номер:</strong>
                                    <span className="info-value">{mockCurrentRequest.deviceSerialNumber}</span>
                                </div>
                                {/* Блок Клиент */}
                                <div className="info-block">
                                    <strong className="info-label">Клиент:</strong>
                                    <span className="info-value">{mockCurrentRequest.clientName}</span>
                                </div>
                                <div className="info-block">
                                    <strong className="info-label">Услуга:</strong>
                                    <span className="info-value">{mockCurrentRequest.serviceName}</span>
                                </div>
                            </div>
                            {/* Описание проблемы */}
                            <div className="info-block full-width">
                                <strong className="info-label">Описание проблемы от клиента:</strong>
                                <p className="info-description">{mockCurrentRequest.description}</p>
                            </div>
                            {/* Прикрепленные файлы */}
                            <div className="info-block full-width">
                                <strong className="info-label">Прикрепленные файлы:</strong>
                                <div className="files-list">
                                    {mockFiles.map(file => (
                                        <a key={file.id} href={file.url} className="file-item" target="_blank"
                                           rel="noopener noreferrer">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{file.size}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ (ПРАВАЯ КОЛОНКА) --- */}
                    <div className="sidebar-content">
                        <div className="card">
                            <h2 className="card-title">Управление</h2>
                            <div className="sidebar-form">
                                <div className="input-group">
                                    <label htmlFor="request-status" className="form-label">Изменить статус:</label>
                                    <select id="request-status" className="form-select"
                                            defaultValue={mockCurrentRequest.status}>
                                        <option>Новая</option>
                                        <option>В работе</option>
                                        <option>На диагностике</option>
                                        <option>Готова</option>
                                        <option>Закрыта</option>
                                        <option>Отменена</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="request-specialist" className="form-label">Назначить
                                        специалиста:</label>
                                    <select id="request-specialist" className="form-select"
                                            defaultValue={mockCurrentRequest.specialistName || ''}>
                                        <option value="">Не назначен</option>
                                        <option>Сидоров А.В.</option>
                                        <option>Козлов Н.Н.</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="request-exec-time" className="form-label">Назначить
                                        длительность выполнения:</label>
                                    <input id="request-exec-time" className="form-select" type='number'
                                            value={mockCurrentRequest.executionTime || ''}>
                                    </input>
                                </div>

                            </div>
                        </div>
                        <div className="card">
                            <h2 className="card-title">История клиента</h2>
                            <div className="history-list">
                                {mockClientHistory.map(req => (
                                    <div key={req.id} className="history-item">
                                        <span className="history-id">Заявка #{req.id}</span>
                                        <span
                                            className={`status-badge-small ${getStatusClassName(req.status)}`}>{req.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};