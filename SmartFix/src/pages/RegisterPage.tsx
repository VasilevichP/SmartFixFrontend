import {useState} from 'react';
import '../styles/LoginPage.css';
import {Link, useNavigate} from "react-router-dom";
import {authApi} from "../api/authApi.ts";
import PhoneInput, {isValidPhoneNumber} from "react-phone-number-input/input";

export const RegisterPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [name, setName] = useState("");

    const [error, setError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setPhoneError("")

        if (phone && !isValidPhoneNumber(phone)) {
            setPhoneError("Некорректный формат номера телефона");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {

            const registerData = {
                email: email,
                password: password,
                name: name,
                phone: phone
            };
            await authApi.register(registerData);
            navigate('/');
        } catch (err: any) {
            console.error("Ошибка регистрации:", err);
            const serverMessage = err.message || "Произошла ошибка при регистрации. Попробуйте позже.";
            setError(serverMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <h1 className="login-title">Регистрация</h1>
                <p className="login-subtitle">Введите данные для создания аккаунта</p>

                <form className="login-form" onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="middleName" className="input-label">
                            * ФИО
                        </label>
                        <input required={true}
                               type="text"
                               id="middleName"
                               className="input-field"
                               placeholder="Иванов Иван Иванович"
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="phone" className="input-label">
                            * Номер телефона
                        </label>
                        <PhoneInput required={true}
                                    id="phone"
                                    className={`input-field ${phoneError ? 'input-error' : ''}`}
                                    country="BY"
                                    placeholder="375291119900"
                                    value={phone}
                                    onChange={setPhone}
                        />
                        <p className="input-error-text">{phoneError}</p>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email" className="input-label">
                            * Адрес эл. почты
                        </label>
                        <input required={true}
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
                        <input required={true}
                               type="password"
                               id="password"
                               className="input-field"
                               placeholder="••••••••"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error &&
                        <p className="error-text">{error}</p>
                    }

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Регистрация..." : "Создать аккаунт"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Уже зарегистрированы? <Link to="/" className="footer-link">Войти</Link></p>
                </div>

            </div>
        </div>
    );
};