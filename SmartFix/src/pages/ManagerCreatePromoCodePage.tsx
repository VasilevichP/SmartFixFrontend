import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useApi} from "../hooks/useApi.ts";
import {loyaltyProgramsApi} from "../api/loyaltyProgramsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";

export const ManagerCreatePromoCodePage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    const [formData, setFormData] = useState({
        code: '',
        type: '0',
        value: '',
        expirationDate: '',
        usageLimit: '1'
    });

    const [createPromo, {isLoading: isSaving}] = useApi(loyaltyProgramsApi.createPromoCode);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.id]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const command = {
            code: formData.code,
            type: parseInt(formData.type),
            value: parseFloat(formData.value),
            expirationDate: new Date(formData.expirationDate).toISOString(),
            usageLimit: parseInt(formData.usageLimit)
        };
        console.log("in submit");
        const result = await createPromo(token, command);
        if (result !== undefined) navigate('/manager/loyaltyPrograms');
    };

    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/loyaltyPrograms" className="back-link">&larr; К списку</Link>
                    <h1 className="create-service-title">Создание промокода</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="code" className="form-label">* Текст промокода</label>
                                <input type="text" id="code" className="form-input" style={{textTransform: 'uppercase'}}
                                       value={formData.code} onChange={handleChange}
                                       placeholder="SUMMER2025" required/>
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
                                <label htmlFor="expirationDate" className="form-label">* Действует до</label>
                                <input type="date" id="expirationDate" className="form-input"
                                       value={formData.expirationDate} onChange={handleChange} required/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="usageLimit" className="form-label">* Лимит активаций (всего)</label>
                                <input type="number" id="usageLimit" className="form-input" value={formData.usageLimit}
                                       onChange={handleChange} required/>
                            </div>
                        </div>

                        <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button type="submit" className="action-button submit-button" disabled={isSaving}>
                                {isSaving ? 'Создание...' : 'Создать промокод'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}