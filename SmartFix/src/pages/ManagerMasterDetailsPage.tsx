import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useApi} from "../hooks/useApi.ts";
import {mastersApi} from "../api/mastersApi.ts";
import ManagerHeader from "../components/ManagerHeader.tsx";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

export const ManagerMasterDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        activeRequestsCount: 0
    });
    const [phoneError, setPhoneError] = useState("");

    const [updateMaster, {isLoading: isSaving}] = useApi(mastersApi.updateMaster);
    const [deleteMaster] = useApi(mastersApi.deleteMaster);

    const fetchMaster = async () => {
        if (!id) return;
        const data = await mastersApi.getMasterById(token, id);

        setFormData({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            activeRequestsCount: data.activeRequestsCount
        });
    };

    const [loadMaster, {isLoading: isFetching}] = useApi(fetchMaster, false);

    useEffect(() => {
        if (!id) return;
        if (!token) {
            navigate('/');
            return;
        }
        loadMaster();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
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
        const command = {
            id: id!,
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber
        };

        const result = await updateMaster(token, command);
        if (result !== undefined) navigate('/manager/masters');
    };

    const handleDelete = async () => {
        if (formData.activeRequestsCount > 0) {
            alert(`Нельзя уволить мастера, у которого есть активные заявки (${formData.activeRequestsCount} шт.). Переназначьте их на другого специалиста.`);
            return;
        }

        if (window.confirm("Вы уверены, что хотите удалить (уволить) мастера? Он потеряет доступ к системе.")) {
            await deleteMaster(token, id!);
            navigate('/manager/masters');
        }
    };

    if (isFetching) return <div>Загрузка...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="details-page-container">
                <div className="service-details-page-header">
                    <Link to="/manager/masters" className="back-link">&larr; К списку</Link>
                    <h1 className="service-details-title">
                        Профиль мастера: {formData.name}
                    </h1>
                </div>

                <div className="form-container card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label htmlFor="name" className="form-label">ФИО</label>
                                <input type="text" id="name" className="form-input" value={formData.name}
                                       onChange={handleChange} required/>
                            </div>

                            <div className="input-group">
                                <label htmlFor="phoneNumber" className="form-label">Телефон</label>
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
                                <label htmlFor="email" className="form-label">Email (Логин)</label>
                                <input type="email" id="email" className="form-input" value={formData.email}
                                       onChange={handleChange} required/>
                            </div>

                            {/* Блок информации */}
                            <div className="input-group full-width" style={{
                                marginTop: '10px',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                boxSizing: 'border-box',
                            }}>
                                <strong style={{color:'#333'}}>Заявок в работе: </strong>
                                <span style={{color: formData.activeRequestsCount > 0 ? '#2563eb' : '#333'}}>
                                    {formData.activeRequestsCount} шт.
                                </span>
                            </div>
                        </div>

                        <div className="form-actions" style={{justifyContent: 'center', marginTop: '20px'}}>
                            <button type="button" className="action-button delete-button" onClick={handleDelete}>
                                Удалить
                            </button>
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