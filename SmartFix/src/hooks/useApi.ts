import {useCallback, useState} from "react";
import {useToast} from "../components/ToastContext.tsx";

type ApiFunction<T extends any[], R> = (...args: T) => Promise<R>;
type ApiHookResult<T extends any[], R> = [
    (...args: T) => Promise<R | undefined>, // Функция, которую мы вызываем
    { isLoading: boolean; error: string | null } // Состояние
];

/**
 * Хук-обертка для вызова API функций.
 * Автоматически управляет isLoading, ловит ошибки и показывает Toast.
 */
export const useApi = <T extends any[], R>(
    apiFunc: ApiFunction<T, any>,
    showSuccessToast: boolean = true // Показывать ли Toast при успехе
): ApiHookResult<T, R> => {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const execute = useCallback(async (...args: T) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiFunc(...args);

            // Показываем Toast об успехе, если это нужно
            if (showSuccessToast) {
                // Если API возвращает сообщение, используем его, иначе стандартное
                const successMessage = (result as any)?.message || 'Операция выполнена успешно!';
                showToast(successMessage, 'success');
            }

            return result;
        } catch (err: any) {
            setError(err.message); // Используем сообщение, которое подготовил наш интерцептор
            showToast(err.message, 'error'); // Показываем ошибку в Toast
            return undefined; // Возвращаем undefined при ошибке
        } finally {
            setIsLoading(false);
        }
    }, [apiFunc, showToast, showSuccessToast]);

    return [execute, { isLoading, error }];
};