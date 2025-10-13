import {useState} from 'react';
import '../styles/LoginPage.css';

export const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [error, setError] = useState("");

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <h1 className="login-title">Регистрация</h1>
                <p className="login-subtitle">Пожалуйста, введите ваши данные для регистрации</p>

                <form className="login-form">
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
                            placeholder="Admin1234"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}                        />
                    </div>

                    <button type="submit" className="login-button">
                        Создать
                    </button>
                </form>

                <div className="login-footer">
                    <p>Уже зарегистрированы? <a href="/SmartFix/public" className="footer-link">Войти</a></p>
                </div>

            </div>
        </div>
    );
};