import {Link, useNavigate, useParams} from "react-router-dom";
import {useApi} from "../hooks/useApi";
import {useEffect, useState} from "react";
import {loyaltyProgramsApi} from "../api/loyaltyProgramsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";

export const ManagerDiscountDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    const [formData, setFormData] = useState({
        name: '',
        category: '1',
        conditionValue: '',
        type: '0',
        value: '',
        priority: '10',
        isActive: true
    });

    const [updateDiscount, {isLoading: isSaving}] = useApi(loyaltyProgramsApi.updateDiscount);
    const [deactivateDiscount] = useApi(loyaltyProgramsApi.deactivateDiscount);

    const fetchDiscount = async () => {
        if (!id) return;
        const data = await loyaltyProgramsApi.getDiscountById(token, id);

        setFormData({
            name: data.name,
            category: data.category.toString(),
            conditionValue: data.conditionValue,
            type: data.type.toString(),
            value: data.value.toString(),
            priority: data.priority.toString(),
            isActive: data.isActive
        });
        console.log(formData);
    };

    const [loadData, {isLoading}] = useApi(fetchDiscount, false);

    useEffect(() => {
        if (!id) return;
        if (!token) {
            navigate('/');
            return;
        }
        loadData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.id]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const command = {
            id: id!,
            name: formData.name,
            category: parseInt(formData.category),
            conditionValue: formData.conditionValue,
            type: parseInt(formData.type),
            value: parseFloat(formData.value),
            priority: parseInt(formData.priority)
        };
        console.log(command);
        const result = await updateDiscount(token, command);
        if (result !== undefined) navigate('/manager/loyaltyPrograms');
    };

    const handleDeactivate = async () => {
        if (formData.isActive) {
            if (window.confirm("Деактивировать скидку? Она перестанет применяться к новым заказам.")) {
                await deactivateDiscount(token, id!);
                navigate('/manager/loyaltyPrograms');
            }
        } else {
            await deactivateDiscount(token, id!);
        }
    };

    const renderConditionInput = () => {
        if (formData.category === '1') {
            return (
                <input type="number" id="conditionValue" min="0" max="100" className="form-input"
                       value={formData.conditionValue} onChange={handleChange} required/>
            );
        } else if (formData.category === '2') {
            return (
                <select id="conditionValue" className="form-select" value={formData.conditionValue}
                        onChange={handleChange} required>
                    <option value="">Выберите день...</option>
                    <option value="1">Понедельник</option>
                    <option value="2">Вторник</option>
                    <option value="3">Среда</option>
                    <option value="4">Четверг</option>
                    <option value="5">Пятница</option>
                    <option value="6">Суббота</option>
                    <option value="0">Воскресенье</option>
                </select>
            );
        } else if (formData.category === '3') {
            return (
                <input type="number" id="conditionValue" className="form-input" step="0.01" min="0"
                       value={parseFloat(formData.conditionValue)} onChange={handleChange} required/>
            );
        }
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/loyaltyPrograms" className="back-link">&larr; К списку</Link>
                    <h1 className="create-service-title">Редактирование скидки</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="name" className="form-label">* Название</label>
                                <input type="text" id="name" className="form-input" value={formData.name}
                                       onChange={handleChange} required/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="categoryKey" className="form-label">* Категория правила</label>
                                <select id="categoryKey" className="form-select" value={formData.category} disabled>
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
                                <label htmlFor="priority" className="form-label">Приоритет</label>
                                <input type="number" id="priority" className="form-input" value={formData.priority}
                                       onChange={handleChange} required/>
                            </div>
                        </div>

                        <div className="form-actions" style={{justifyContent: 'space-between', marginTop: '20px'}}>
                            <button type="button" className="action-button cancel-button"
                                    onClick={handleDeactivate}>{formData.isActive ? "Отключить скидку" : "Активировать скидку"}</button>
                            <button type="submit" className="action-button submit-button" disabled={isSaving}>
                                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}