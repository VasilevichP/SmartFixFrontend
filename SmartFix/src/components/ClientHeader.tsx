// import React from 'react';
import '../styles/Header.css'; // Используем общий файл стилей для хэдеров
import logo from '../assets/logo.png'

const ClientHeader= () => {
    return (
        <header className="header-container">
            <div className="header-content">
                <div className="header-left">
                    <a href="/catalog" className="header-logo">
                        <img src={logo} alt="SmartFix" />
                    </a>
                    <nav className="header-nav">
                        <a href="/catalog" className="nav-link">
                            Каталог услуг
                        </a>
                    </nav>
                </div>
                <div className="header-right">
                    <a href="/profile" className="profile-link" title="Личный кабинет">
                        <svg className="profile-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </a>
                    <a href="/" className="nav-link">
                        Выйти
                    </a>
                </div>
            </div>
        </header>
    );
};

export default ClientHeader;