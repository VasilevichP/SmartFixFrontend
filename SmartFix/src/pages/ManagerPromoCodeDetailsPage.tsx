import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useApi} from "../hooks/useApi.ts";
import {loyaltyProgramsApi} from "../api/loyaltyProgramsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";

const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const ManagerPromoCodeDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    const [formData, setFormData] = useState({
        code: '',
        type: '0',
        value: '',
        expirationDate: '',
        usageLimit: '1'
    });

    const [updatePromo, {isLoading: isSaving}] = useApi(loyaltyProgramsApi.updatePromoCode);
    const [deactivatePromo] = useApi(loyaltyProgramsApi.deactivatePromoCode);

    const fetchPromo = async () => {
        if (!id) return;
        const data = await loyaltyProgramsApi.getPromoCodeById(token, id);

        setFormData({
            code: data.code,
            type: data.type.toString(),
            value: data.value.toString(),
            expirationDate: formatDateForInput(data.expirationDate),
            usageLimit: data.usageLimit.toString()
        });
    };

    const [loadData, {isLoading}] = useApi(fetchPromo, false);

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
            code: formData.code,
            type: parseInt(formData.type),
            value: parseFloat(formData.value),
            expirationDate: new Date(formData.expirationDate).toISOString(),
            usageLimit: parseInt(formData.usageLimit)
        };

        const result = await updatePromo(token, command);
        if (result !== undefined) navigate('/manager/loyaltyPrograms');
    };

    const handleDeactivate = async () => {
        if (window.confirm("Аннулировать этот промокод? Клиенты больше не смогут его применить.")) {
            await deactivatePromo(token, id!);
            navigate('/manager/loyaltyPrograms');
        }
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/loyaltyPrograms" className="back-link">&larr; К списку</Link>
                    <h1 className="create-service-title">Редактирование промокода</h1>
                </div>

                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="code" className="form-label">* Текст промокода</label>
                                <input type="text" id="code" className="form-input" style={{textTransform: 'uppercase'}}
                                       value={formData.code} onChange={handleChange} required/>
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
                                <label htmlFor="usageLimit" className="form-label">* Лимит активаций</label>
                                <input type="number" id="usageLimit" className="form-input" value={formData.usageLimit}
                                       onChange={handleChange} required/>
                            </div>
                        </div>

                        <div className="form-actions" style={{justifyContent: 'space-between', marginTop: '20px'}}>
                            <button type="button" className="action-button cancel-button"
                                    onClick={handleDeactivate}>Аннулировать код
                            </button>
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