import {useEffect, useState} from "react";

interface CustomServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, price: number) => void;
}
export const CustomServiceModal: React.FC<CustomServiceModalProps> = ({isOpen, onClose, onConfirm}) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName("");
            setPrice("");
        }
    }, [isOpen]);
    if (!isOpen) return null;
    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Добавить произвольную работу</h3>
                <div className="form-group" style={{marginBottom: '10px'}}>
                    <label className="form-label">Название работы</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Например: Чистка после залития" />
                </div>
                <div className="form-group">
                    <label className="form-label">Стоимость (руб.)</label>
                    <input className="form-input" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="modal-actions">
                    <button className="modal-btn modal-btn-cancel" onClick={onClose}>Отмена</button>
                    <button
                        className="modal-btn modal-btn-save"
                        onClick={() => { if(name && price) onConfirm(name, parseFloat(price)); }}
                    >
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
};
