import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useApi} from "../hooks/useApi.ts";
import {clientsApi} from "../api/clientsApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

export const ManagerCreateClientPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';
    const [phoneError, setPhoneError] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        personalDiscount: '0'
    });

    const[createClient, { isLoading }] = useApi(clientsApi.createClient);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    const handlePhoneChange = (value?: string) => {
        setFormData(prev => ({...prev, phone: value || ''}));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");
        if (formData.phone && !isValidPhoneNumber(formData.phone)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        const result = await createClient(token, {
            ...formData,
            personalDiscount: parseFloat(formData.personalDiscount)
        });
        if (result !== undefined) navigate('/manager/clients');
    };

    return (
        <div>
            <ManagerHeader />
            <div className="create-service-page-container">
                <div className="create-service-header">
                    <Link to="/manager/clients" className="back-link">&larr; К списку</Link>
                    <h1 className="create-service-title">Регистрация нового клиента</h1>
                </div>

                <div className="form-container card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="name" className="form-label">* ФИО клиента</label>
                                <input type="text" id="name" className="form-input" value={formData.name}
                                       placeholder="ivanov@gmail.com" onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label htmlFor="phoneNumber" className="form-label">* Телефон</label>
                                <PhoneInput
                                    country="BY"
                                    value={formData.phone}
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
                                <label htmlFor="email" className="form-label">* Email (логин)</label>
                                <input type="email" id="email" className="form-input" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label htmlFor="personalDiscount" className="form-label">Персональная скидка (%)</label>
                                <input type="number" id="personalDiscount" className="form-input" min="0" max="100" value={formData.personalDiscount} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button type="submit" className="action-button submit-button" disabled={isLoading}>
                                {isLoading ? 'Сохранение...' : 'Зарегистрировать'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};