import axios, {type AxiosError} from 'axios';

const API_URL = 'http://localhost:5251/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    // 1. Если ответ успешный (статус 2xx), просто возвращаем его
    (response) => response,

    // 2. Если произошла ошибка
    (error: AxiosError) => {
        // Извлекаем сообщение об ошибке
        const message = extractErrorMessage(error);

        // "Обогащаем" объект ошибки этим сообщением.
        // Теперь в catch(e) вы сможете просто написать e.message
        error.message = message;

        // Важно! Пробрасываем ошибку дальше, чтобы catch в компонентах мог её поймать.
        return Promise.reject(error);
    }
);

// --- УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ИЗВЛЕЧЕНИЯ ОШИБКИ ---

export const extractErrorMessage = (error: AxiosError): string => {
    // 1. Ошибка от нашего бэкенда (400, 404)
    // Мы ожидаем структуру { title: "Текст ошибки" }
    if (error.response?.data && (error.response.data as any).message) {
        return (error.response.data as any).message;
    }

    // 2. Ошибки валидации от ASP.NET Core по умолчанию (если не настроен Middleware)
    if (error.response?.data && (error.response.data as any).errors) {
        // Берем первую ошибку из списка
        const validationErrors = (error.response.data as any).errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        if (firstErrorKey) {
            return validationErrors[firstErrorKey][0];
        }
    }

    // 3. Сетевые ошибки (сервер недоступен, CORS)
    if (error.code === 'ERR_NETWORK') {
        return 'Сервер недоступен. Проверьте ваше интернет-соединение.';
    }

    // 4. Ошибки тайм-аута
    if (error.code === 'ECONNABORTED') {
        return 'Сервер слишком долго отвечает. Попробуйте позже.';
    }

    // 5. Любые другие HTTP ошибки
    if (error.response?.status) {
        return `Ошибка ${error.response.status}: ${error.response.statusText || 'Неизвестная ошибка сервера'}`;
    }

    // 6. Непредвиденные ошибки
    return error.message || 'Произошла непредвиденная ошибка';
};

export default api;