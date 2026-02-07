import {useState} from "react";
import type {DeviceModelDetails} from "../api/deviceModelsApi.ts";
import type {DeviceType} from "../api/deviceTypesApi.ts";
import type {Manufacturer} from "../api/manufacturersApi.ts";
import '../styles/DictionaryPage.css';

interface ModelsCardProps {
    models: DeviceModelDetails[];
    types: DeviceType[];
    manufacturers: Manufacturer[];
    onAdd: (name: string, typeId: string, manufId: string) => Promise<void>;
    onEdit: (id: string, name: string, deviceTypeId: string, manufacturerId: string) => void;
    onDelete: (id: string) => Promise<void>;
}

export const ModelsDictionaryCard: React.FC<ModelsCardProps> = ({models, types, manufacturers, onAdd, onDelete, onEdit}) => {
    const [name, setName] = useState("");
    const [typeId, setTypeId] = useState("");
    const [manufId, setManufId] = useState("");

    const handleAdd = async () => {
        if (!name || !typeId || !manufId) {
            alert("Заполните все поля для модели");
            return;
        }
        await onAdd(name, typeId, manufId);
        setName("");
    };

    return (
        <div className="dictionary-card wide-card">
            <h2 className="card-title">Модели устройств</h2>

            <div className="add-model-grid">
                <select className="form-select" value={typeId} onChange={e => setTypeId(e.target.value)}>
                    <option value="">Выберите тип</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select className="form-select" value={manufId} onChange={e => setManufId(e.target.value)}>
                    <option value="">Выберите бренд</option>
                    {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input
                    type="text" className="form-input" placeholder="Название модели..."
                    value={name} onChange={e => setName(e.target.value)}
                />
                <button className="add-btn" onClick={handleAdd}>Добавить</button>
            </div>

            <div className="table-wrapper">
                <table className="simple-table">
                    <thead>
                    <tr>
                        <th>Модель</th>
                        <th>Бренд</th>
                        <th>Тип</th>
                        <th style={{width: '100px'}}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {models.map(m => (
                        <tr key={m.id}>
                            <td>{m.name}</td>
                            <td>{m.manufacturerName}</td>
                            <td>{m.deviceTypeName}</td>
                            <td>
                                <div className="item-actions">
                                <button className="text-btn edit-btn" onClick={() => onEdit(m.id, m.name, m.deviceTypeId, m.manufacturerId)}>Ред.</button>
                                <button className="text-btn delete-btn" onClick={() => onDelete(m.id)}>Удал.</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};