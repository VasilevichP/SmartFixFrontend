import React, {useState} from 'react';
import '../styles/LoginPage.css';
import {useNavigate} from "react-router-dom";

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        navigate('/manager/requests');
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <h1 className="login-title">Вход</h1>
                <p className="login-subtitle">Пожалуйста, введите ваши данные для входа</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">
                            Адрес эл. почты
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="input-label">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}                        />
                    </div>

                    <button type="submit" className="login-button">
                        Войти
                    </button>
                </form>

                <div className="login-footer">
                    <p>Нет учетной записи? <a href="/register" className="footer-link">Создать</a></p>
                </div>

            </div>
        </div>
    );
};