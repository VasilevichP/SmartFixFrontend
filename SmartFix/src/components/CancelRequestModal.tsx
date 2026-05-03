import React, {useState} from "react";

interface CancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export const CancelRequestModal: React.FC<CancelModalProps> = ({isOpen, onClose, onConfirm}) => {
    const [reason, setReason] = useState("");
    if (!isOpen) return null;
    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Отмена заявки</h3>
                <div className="modal-form-group">
                    <label className="modal-label">* Причина отмены</label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Клиент отказался из-за стоимости..."
                        required={true}
                    />
                </div>
                <div className="modal-actions">
                    <button className="modal-btn modal-btn-cancel" onClick={onClose}>Назад</button>
                    <button
                        className="modal-btn modal-btn-delete" // Красная кнопка
                        onClick={() => {
                            if (reason) onConfirm(reason); else alert("Укажите причину");
                        }}
                    >
                        Подтвердить отмену
                    </button>
                </div>
            </div>
        </div>
    );
};
