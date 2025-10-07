import React from 'react';
import '../styles/Header.css'; // Используем общий файл стилей для хэдеров
import logo from '../assets/logo.png'

// Пропсы компонента (пока не используются, но это задел на будущее)

const ClientHeader= () => {
    return (
        <header className="header-container">
            <div className="header-content">
                <div className="header-left">
                    {/* Место для вашего логотипа */}
                    <a href="/dashboard" className="header-logo">
                        <img src={logo} alt="SmartFix" />
                    </a>
                    <nav className="header-nav">
                        <a href="/my-requests" className="nav-link">
                            Мои заявки
                        </a>
                        <a href="/services" className="nav-link">
                            Каталог услуг
                        </a>
                    </nav>
                </div>
                <div className="header-right">
                    <a href="/logout" className="nav-link">
                        Выйти
                    </a>
                </div>
            </div>
        </header>
    );
};

export default ClientHeader;