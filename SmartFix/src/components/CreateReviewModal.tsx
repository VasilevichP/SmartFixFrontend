import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Modal.css'; // Базовые стили модалок
import '../styles/ClientServiceDetailsPage.css';
import {type CreateReviewCommand, reviewsApi} from "../api/reviewsApi.ts"; // Стили для звезд

interface CreateReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId: string;
    onSuccess: () => void; // Коллбек, чтобы родитель обновил список
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
                                                                        isOpen, onClose, serviceId, onSuccess
                                                                    }) => {
    const navigate = useNavigate();

    // Состояние формы
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0); // Для эффекта наведения
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка авторизации
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Для отправки отзыва необходимо войти в систему");
            navigate('/login');
            return;
        }

        if (rating === 0) {
            alert("Пожалуйста, поставьте оценку");
            return;
        }

        try {
            const review : CreateReviewCommand ={
                serviceId,
                rating,
                comment
            }
            setIsSubmitting(true);
            await reviewsApi.createReview(token, review);

            alert("Спасибо за ваш отзыв!");

            // Сброс формы
            setRating(0);
            setComment("");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.title || "Ошибка при отправке отзыва";
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Оставить отзыв</h2>
                </div>

                <form className="review-form" onSubmit={handleSubmit}>
                    {/* Выбор оценки (Звезды) */}
                    <div className="input-group">
                        <label className="form-label">Ваша оценка</label>
                        <div className="interactive-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Текст комментария */}
                    <div className="input-group">
                        <label htmlFor="comment" className="form-label">Комментарий</label>
                        <textarea
                            id="comment"
                            className="form-textarea"
                            rows={4}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Расскажите о своем опыте..."
                            required
                        ></textarea>
                    </div>

                    {/* Кнопки */}
                    <div className="modal-actions">
                        <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="modal-btn modal-btn-save" disabled={isSubmitting}>
                            {isSubmitting ? "Отправка..." : "Отправить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};