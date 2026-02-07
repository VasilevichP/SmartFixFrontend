import React, {useEffect, useState} from 'react';
import '../styles/Modal.css';
import '../styles/DictionaryPage.css';
import type {DeviceType} from "../api/deviceTypesApi.ts";
import type {Manufacturer} from "../api/manufacturersApi.ts"; // Для стилей инпутов

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    title: string;
    mode: 'simple' | 'model';
    initialData: {
        id: string;
        name: string;
        deviceTypeId?: string;
        manufacturerId?: string;
    };
    types?: DeviceType[];
    manufacturers?: Manufacturer[];
}


export interface EditingItemState {
    type: 'category' | 'model' | 'specialist' | 'type' | 'manufacturer'; // Тип редактируемой сущности
    data: {
        id: string;
        name: string;
        deviceTypeId?: string;    // Только для модели
        manufacturerId?: string;  // Только для модели
    }
}

export const EditDictionaryModal: React.FC<EditModalProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  onSave,
                                                                  title,
                                                                  mode,
                                                                  initialData,
                                                                  types,
                                                                  manufacturers
                                                              }) => {
    // State для полей формы
    const [name, setName] = useState("");
    const [typeId, setTypeId] = useState("");
    const [manufId, setManufId] = useState("");

    // При открытии окна заполняем поля текущими данными
    useEffect(() => {
        if (isOpen) {
            setName(initialData.name);
            setTypeId(initialData.deviceTypeId || "");
            setManufId(initialData.manufacturerId || "");
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (mode === 'simple') {
            onSave({id: initialData.id, name});
        } else {
            onSave({
                id: initialData.id,
                name,
                deviceTypeId: typeId,
                manufacturerId: manufId
            });
        }
        onClose();
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>

                {/* Поле 1: Тип устройства (только для модели) */}
                {mode === 'model' && (
                    <div className="modal-form-group">
                        <label className="modal-label">Тип устройства</label>
                        <select
                            className="form-select"
                            value={typeId}
                            onChange={e => setTypeId(e.target.value)}
                        >
                            {types?.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Поле 2: Производитель (только для модели) */}
                {mode === 'model' && (
                    <div className="modal-form-group">
                        <label className="modal-label">Производитель</label>
                        <select
                            className="form-select"
                            value={manufId}
                            onChange={e => setManufId(e.target.value)}
                        >
                            {manufacturers?.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Поле 3: Название (Для всех) */}
                <div className="modal-form-group">
                    <label className="modal-label">
                        {mode === 'model' ? 'Название модели' : 'Название'}
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="modal-actions">
                    <button className="modal-btn modal-btn-cancel" onClick={onClose}>Отмена</button>
                    <button className="modal-btn modal-btn-save" onClick={handleSave}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};