import React, {useEffect, useState} from "react";
import {mastersApi} from "../api/mastersApi.ts";
import {useApi} from "../hooks/useApi.ts";
import {useNavigate} from "react-router-dom";
import MasterHeader from "../components/MasterHeader.tsx";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

export const MasterProfilePage: React.FC = () => {
    const token = localStorage.getItem('token') || '';
    const navigate = useNavigate();
    const[formData, setFormData] = useState({ id: '',name: '', email: '', phoneNumber: '' });
    const [phoneError, setPhoneError] = useState("");

    const[updateProfile, { isLoading: isSaving }] = useApi(mastersApi.updateMaster);

    const loadProfile = async () => {
        const [master] = [
            await mastersApi.getMasterProfile(token)
        ];
        setFormData(master);
    };
    const [loadData, {isLoading}] = useApi(loadProfile, false);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        loadData();
    },[token]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    const handlePhoneChange = (value?: string) => {
        setFormData(prev => ({...prev, phone: value || ''}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");
        if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
            setPhoneError("Некорректный формат номера телефона");
            return;
        }
        await updateProfile(token, {
            id: formData.id,
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber
        });
    };

    if (isLoading) return <div style={{textAlign: 'center', padding: '50px'}}>Загрузка профиля...</div>;

    return (
        <div>
            <MasterHeader />
            <div className="page-container">
                <h1 className="page-title">Мой профиль</h1>

                <div className="card" style={{ padding: '30px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">

                            {/* Email обычно нельзя менять самостоятельно, так как это логин */}
                            <div className="input-group full-width">
                                <label htmlFor="email" className="form-label">* Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group full-width">
                                <label htmlFor="name" className="form-label">* ФИО</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group full-width">
                                <label htmlFor="phone" className="form-label">* Телефон</label>
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
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '30px' }}>
                            <button type="submit" className="action-button save-button" disabled={isSaving}>
                                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};