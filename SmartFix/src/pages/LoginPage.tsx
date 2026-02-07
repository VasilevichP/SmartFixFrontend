import {useEffect, useState} from 'react';
import '../styles/LoginPage.css';
import {useNavigate} from "react-router-dom";
import {authApi} from "../api/authApi.ts";

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("token");
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const credentials = {email: email, password: password};
        try {
            const response = await authApi.login(credentials);
            localStorage.setItem('token', response.token);
            const payload = JSON.parse(atob(response.token.split('.')[1]));
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            if (role =='Manager') {
                navigate('/manager/requests');
            } else if (role =='Client') {
                navigate('/catalog');
            }
        } catch (error:any) {
            setError(error.response.data);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <h1 className="login-title">Вход</h1>
                <p className="login-subtitle">Введите данные для входа</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">
                            Адрес эл. почты
                        </label>
                        <input
                            type="email"
                            id="email"
                            required={true}
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
                            required={true}
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <p className="error-text">{error}</p>
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