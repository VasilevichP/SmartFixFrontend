import React, {useState, useEffect} from 'react';

interface DownloadDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: (selectedDocs: { acceptance: boolean; act: boolean; warranty: boolean }) => void;
    requestStatus: number;
    isDownloading: boolean;
}

export const DownloadDocumentsModal: React.FC<DownloadDocumentsModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  onDownload,
                                                                                  requestStatus,
                                                                                  isDownloading
                                                                              }) => {
    const [docs, setDocs] = useState({
        acceptance: false,
        act: false,
        warranty: false
    });

    useEffect(() => {
        if (isOpen) {
            setDocs({
                acceptance: requestStatus <= 5,
                act: requestStatus >= 5,
                warranty: requestStatus === 6
            });
        }
    }, [isOpen, requestStatus]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!docs.acceptance && !docs.act && !docs.warranty) {
            alert("Выберите хотя бы один документ для скачивания");
            return;
        }
        onDownload(docs);
    };

    return (
        <div className="modal-overlay open" onClick={!isDownloading ? onClose : undefined}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '400px'}}>
                <h3 className="modal-title">Скачать документы</h3>
                <p style={{color: '#666', fontSize: '14px', marginBottom: '20px'}}>
                    Выберите документы, которые необходимо сформировать в формате PDF:
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginBottom: '25px',
                    color: '#1a1a1a'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}>
                        <input type="checkbox" checked={docs.acceptance}
                               onChange={e => setDocs({...docs, acceptance: e.target.checked})}
                               style={{width: '18px', height: '18px'}}/>
                        Приемная квитанция
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}>
                        <input type="checkbox" checked={docs.act}
                               onChange={e => setDocs({...docs, act: e.target.checked})}
                               style={{width: '18px', height: '18px'}}/>
                        Акт выполненных работ
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: requestStatus === 6 ? 'pointer' : 'not-allowed',
                        fontSize: '16px',
                        opacity: requestStatus === 6 ? 1 : 0.5
                    }}>
                        <input type="checkbox" disabled={requestStatus !== 6} checked={docs.warranty}
                               onChange={e => setDocs({...docs, warranty: e.target.checked})}
                               style={{width: '18px', height: '18px'}}/>
                        Гарантийный талон
                        {requestStatus !== 6 && <span style={{fontSize: '12px', color: '#dc2626', marginLeft: 'auto'}}>(Только для закрытых)</span>}
                    </label>
                </div>

                <div className="modal-actions" style={{justifyContent: 'space-between'}}>
                    <button className="action-button cancel-button" onClick={onClose} disabled={isDownloading}>
                        Отмена
                    </button>
                    <button className="action-button save-button" onClick={handleConfirm} disabled={isDownloading}>
                        {isDownloading ? 'Генерация...' : 'Скачать выбранное'}
                    </button>
                </div>
            </div>
        </div>
    );
};