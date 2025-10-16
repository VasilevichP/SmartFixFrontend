// import React from 'react';
import '../styles/Header.css'; // Используем тот же общий файл стилей
import logo from '../assets/logo.png'

const ManagerHeader = () => {
    return (
        <header className="header-container">
            <div className="header-content">
                <div className="header-left">
                    {/* Место для вашего логотипа */}
                    <a href="/manager/requests" className="header-logo">
                        <img src={logo} alt="SmartFix Logo" />
                    </a>
                    <nav className="header-nav">
                        <a href="/manager/requests" className="nav-link">
                            Заявки
                        </a>
                        <a href="/manager/services" className="nav-link">
                            Услуги
                        </a>
                        <a href="/manager/dictionaries" className="nav-link">
                            Справочники
                        </a>
                        <a href="/manager/statistics" className="nav-link">
                            Статистика
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

export default ManagerHeader;