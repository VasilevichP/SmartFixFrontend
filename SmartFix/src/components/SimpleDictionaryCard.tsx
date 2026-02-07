import {useState} from "react";
import '../styles/DictionaryPage.css';

interface DictionaryItem{
    id: string;
    name: string;
}

interface SimpleCardProps {
    title: string;
    items: DictionaryItem[];
    onAdd: (name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onEdit: (id: string, name: string) => void;
}

export const SimpleDictionaryCard: React.FC<SimpleCardProps> = ({ title, items, onAdd, onDelete, onEdit }) => {
    const [newItemName, setNewItemName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = async () => {
        if (!newItemName.trim()) return;
        setIsSubmitting(true);
        try {
            await onAdd(newItemName);
            setNewItemName("");
        } catch (e) {
            alert("Ошибка при добавлении");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm("Вы уверены? Это может повлиять на существующие услуги.")) {
            await onDelete(id);
        }
    };

    return (
        <div className="dictionary-card">
            <h2 className="card-title">{title}</h2>

            <div className="add-item-row">
                <input
                    type="text"
                    className="form-input"
                    placeholder="Название..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                />
                <button className="add-btn" onClick={handleAdd} disabled={isSubmitting}>
                    {isSubmitting ? "..." : "Добавить"}
                </button>
            </div>

            <ul className="items-list">
                {items.map(item => (
                    <li key={item.id} className="list-item">
                        <span className="item-name">{item.name}</span>
                        <div className="item-actions">
                            <button className="text-btn edit-btn" onClick={() => onEdit(item.id, item.name)}>Ред.</button>
                            <button className="text-btn delete-btn" onClick={() => handleDeleteClick(item.id)}>Удал.</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};