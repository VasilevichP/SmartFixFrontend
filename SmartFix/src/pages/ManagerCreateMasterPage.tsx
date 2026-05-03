import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useApi} from "../hooks/useApi.ts";
import {mastersApi} from "../api/mastersApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

export const ManagerCreateMasterPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [phoneError, setPhoneError] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: ''
    });

    const [createMaster, { isLoading: isSaving }] = useApi(mastersApi.createMaster);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handlePhoneChange = (value?: string) => {
        setFormData(prev => ({...prev, phoneNumber: value || ''}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");
        if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        const result = await createMaster(token, formData);
        if (result !== undefined) {
            navigate('/manager/masters');
        }
    };

    return (
        <div>
            <ManagerHeader />
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/masters" className="back-link">&larr; К списку мастеров</Link>
                    <h1 className="create-service-title">Регистрация нового мастера</h1>
                </div>

                <div className="form-container card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="name" className="form-label">* ФИО мастера</label>
                                <input type="text" id="name" className="form-input" value={formData.name} onChange={handleChange} required
                                placeholder="Иванов Иван Иванович"/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="phoneNumber" className="form-label">* Телефон</label>
                                <PhoneInput
                                    country="BY"
                                    value={formData.phoneNumber}
                                    onChange={handlePhoneChange}
                                    className="form-input"
                                    required={true}
                                    placeholder="3751115500"
                                />
                                {phoneError &&
                                    <p className="input-error-text">{phoneError}</p>
                                }
                            </div>

                            <div className="input-group">
                                <label htmlFor="email" className="form-label">* Email (Логин для входа)</label>
                                <input type="email" id="email" className="form-input" value={formData.email} onChange={handleChange}
                                       placeholder="ivanov@gmail.com" required />
                            </div>

                        </div>

                        <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button type="submit" className="action-button submit-button" disabled={isSaving}>
                                {isSaving ? 'Сохранение...' : 'Добавить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};