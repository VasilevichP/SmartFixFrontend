import {useState} from 'react';
import '../styles/LoginPage.css';

export const RegisterPage = () => {
    // Состояния для всех полей
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    // const [error, setError] = useState("");

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper register-wrapper">
                <h1 className="login-title">Регистрация в SmartFix</h1>
                <p className="login-subtitle">Создайте аккаунт, чтобы управлять своими заявками</p>

                <form className="login-form">
                    {/* --- НОВЫЙ БЛОК: ФАМИЛИЯ И ИМЯ НА ОДНОЙ СТРОКЕ --- */}
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="lastName" className="input-label">
                                * Фамилия
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                className="input-field"
                                placeholder="Иванов"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="firstName" className="input-label">
                                * Имя
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                className="input-field"
                                placeholder="Иван"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="middleName" className="input-label">
                                Отчество
                            </label>
                            <input
                                type="text"
                                id="middleName"
                                className="input-field"
                                placeholder="Иванович"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* --- НОВЫЙ БЛОК: ОТЧЕСТВО --- */}


                    {/* --- НОВЫЙ БЛОК: ТЕЛЕФОН --- */}
                    <div className="input-group">
                        <label htmlFor="phone" className="input-label">
                            * Номер телефона
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            className="input-field"
                            placeholder="375293334455"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <hr className="form-divider" />

                    <div className="input-group">
                        <label htmlFor="email" className="input-label">
                            * Адрес эл. почты
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
                            * Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Создать аккаунт
                    </button>
                </form>

                <div className="login-footer">
                    <p>Уже зарегистрированы? <a href="/" className="footer-link">Войти</a></p>
                </div>

            </div>
        </div>
    );
};