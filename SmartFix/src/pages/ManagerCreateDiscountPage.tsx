import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useApi} from "../hooks/useApi.ts";
import {loyaltyProgramsApi} from "../api/loyaltyProgramsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";

export const ManagerCreateDiscountPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    const [formData, setFormData] = useState({
        name: '',
        category: '1',
        conditionValue: '',
        type: '0',
        value: '',
        priority: '10'
    });

    const [createDiscount, {isLoading: isSaving}] = useApi(loyaltyProgramsApi.createDiscount);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {id, value} = e.target;

        if (id === 'categoryKey') {
            setFormData(prev => ({
                ...prev,
                category: value,
                conditionValue: ''
            }));
        } else {
            setFormData(prev => ({...prev, [id]: value}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const command = {
            name: formData.name,
            category: parseInt(formData.category),
            conditionValue: formData.conditionValue,
            type: parseInt(formData.type),
            value: parseFloat(formData.value),
            priority: parseInt(formData.priority)
        };

        const result = await createDiscount(token, command);
        if (result !== undefined) {
            navigate('/manager/loyaltyPrograms');
        }
    };

    const renderConditionInput = () => {
        const catKey = String(formData.category);
        if (catKey === '2') { // DayOfWeek
            return (
                <select id="conditionValue" className="form-select" value={formData.conditionValue}
                        onChange={handleChange} required>
                    <option value="" disabled>Выберите день...</option>
                    <option value="1">Понедельник</option>
                    <option value="2">Вторник</option>
                    <option value="3">Среда</option>
                    <option value="4">Четверг</option>
                    <option value="5">Пятница</option>
                    <option value="6">Суббота</option>
                    <option value="0">Воскресенье</option>
                </select>
            );
        }

        return (
            <input
                type="number"
                id="conditionValue"
                className="form-input"
                placeholder={catKey === '1' ? 'Кол-во заявок (напр. 5)' : 'Сумма в руб. (напр. 10000)'}
                value={formData.conditionValue}
                onChange={handleChange}
                required
                min="0"
            />
        );
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/loyaltyPrograms" className="back-link">&larr; К списку</Link>
                    <h1 className="create-service-title">Создание правила скидки</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="name" className="form-label">* Название (для чека и истории)</label>
                                <input type="text" id="name" className="form-input" value={formData.name}
                                       onChange={handleChange} required/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="categoryKey" className="form-label">* Категория правила</label>
                                <select id="categoryKey" className="form-select" value={formData.category}
                                        onChange={handleChange}>
                                    <option value="1">По количеству закрытых заявок</option>
                                    <option value="2">По дню недели (Счастливые часы)</option>
                                    <option value="3">По сумме текущего заказа</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="conditionValue" className="form-label">* Условие срабатывания</label>
                                {renderConditionInput()}
                            </div>

                            <div className="input-group">
                                <label htmlFor="type" className="form-label">* Тип скидки</label>
                                <select id="type" className="form-select" value={formData.type} onChange={handleChange}>
                                    <option value="0">Процент (%)</option>
                                    <option value="1">Фиксированная сумма (руб.)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="value" className="form-label">* Значение скидки</label>
                                <input type="number" id="value" className="form-input" step="0.01"
                                       value={formData.value} onChange={handleChange} required/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="priority" className="form-label">Приоритет (чем выше, тем
                                    важнее)</label>
                                <input type="number" id="priority" className="form-input" value={formData.priority}
                                       onChange={handleChange} required/>
                            </div>
                        </div>

                        <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button type="submit" className="action-button submit-button" disabled={isSaving}>
                                {isSaving ? 'Создание...' : 'Создать скидку'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}