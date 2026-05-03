import React, {useEffect, useState} from 'react';
import ClientHeader from "../components/ClientHeader.tsx";
import '../styles/ClientServiceDetailsPage.css';
import {useNavigate, useParams} from "react-router-dom";
import {type ServiceDetailsDto, servicesApi} from "../api/servicesApi.ts";
import {CreateRequestModal} from "../components/CreateRequestModal.tsx";
import {ExpandableDescription} from "../components/expandableDescription.tsx";
import {useApi} from "../hooks/useApi.ts";

export const ClientServiceDetailsPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- ДАННЫЕ УСЛУГИ ---
    const [service, setService] = useState<ServiceDetailsDto | null>(null);

    // --- СОСТОЯНИЯ МОДАЛОК ---
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);


    const token = localStorage.getItem("token") || "";

    // Загрузка данных услуги
    const fetchServiceDetails = async () => {
        if (!id) return;
        const data = await servicesApi.getServiceById(token, id);
        setService(data);
    };
    const [loadData, {isLoading}] = useApi(fetchServiceDetails, false);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        const result = loadData();
        if (result == undefined) {
            navigate('/catalog');
        }
    }, [id]);

    if (isLoading) return <div style={{textAlign: 'center', padding: '50px'}}>Загрузка...</div>;
    if (!service) return <div style={{textAlign: 'center', padding: '50px'}}>Услуга не найдена</div>;

    return (
        <div>
            <ClientHeader/>
            <div className="client-service-page-container">
                <div className="details-page-wrapper">

                    {/* === ЛЕВАЯ КОЛОНКА: ИНФОРМАЦИЯ === */}
                    <div className="info-column">
                        <div className="info-card">
                            <div className="category-badge">{service.categoryName}</div>

                            <h1 className="service-title">{service.name}</h1>

                            <div className="device-specs-container">
                                <div className="spec-item">
                                    <span className="spec-label">Тип:</span>
                                    <span className="spec-value">{service.deviceTypeName}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Бренд:</span>
                                    <span className="spec-value">{service.manufacturerName || "Любой"}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Модель:</span>
                                    <span className="spec-value" style={{fontWeight: 'bold', color: '#007bff'}}>
                {service.deviceModelName || "Все модели"}
            </span>
                                </div>
                            </div>


                            <hr className="divider"/>

                            <ExpandableDescription text={service.description || ""}/>

                            <div className="pricing-block">
                                <div className="price-row">
                                    <span className="label">Стоимость:</span>
                                    <span className="value price">{service.price.toFixed(2)} руб.</span>
                                </div>
                                <div className="price-row">
                                    <span className="label">Гарантия:</span>
                                    <span
                                        className="value">{service.warrantyPeriod ? service.warrantyPeriod + ' мес.' : "-"}</span>
                                </div>
                            </div>

                            <button className="apply-button-large" onClick={() => setIsRequestModalOpen(true)}>
                                Оформить заявку
                            </button>
                        </div>
                    </div>


                    {/* 1. Заявка */}
                    <CreateRequestModal
                        isOpen={isRequestModalOpen}
                        onClose={() => setIsRequestModalOpen(false)}
                        initialData={{
                            serviceId: service.id,
                            serviceName: service.name,
                            price: service.price,
                            deviceTypeId: service.deviceTypeId,
                            manufacturerId: service.manufacturerId,
                            deviceModelId: service.deviceModelId
                        }}
                    />

                </div>
            </div>
        </div>
    );
};