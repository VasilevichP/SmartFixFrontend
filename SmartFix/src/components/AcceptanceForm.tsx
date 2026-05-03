import React, { useState, useEffect } from 'react';
import '../styles/AcceptanceForm.css'; // Создадим ниже

interface AcceptanceFormProps {
    initialAppearance: string;
    initialPackage: string;
    onSave: (appearance: string, pkg: string) => void;
    isSaving: boolean;
}

// Константы для быстрого ввода
const APPEARANCE_TAGS = [
    "Б/У", "Потертости", "Царапины на дисплее", "Царапины на корпусе",
    "Сколы", "Вмятины", "Следы влаги", "Трещина на стекле", "Идеал"
];

const PACKAGE_OPTIONS = [
    "Устройство", "Аккумулятор (АКБ)", "Зарядное устройство (СЗУ)",
    "Кабель USB", "Коробка", "Чехол", "Сим-лоток"
];

export const AcceptanceForm: React.FC<AcceptanceFormProps> = ({
                                                                  initialAppearance, initialPackage, onSave, isSaving
                                                              }) => {
    const [appearance, setAppearance] = useState(initialAppearance || "");

    const [selectedPackage, setSelectedPackage] = useState<string[]>([]);
    const [customPackage, setCustomPackage] = useState("");

    useEffect(() => {
        setAppearance(initialAppearance || "");

        if (initialPackage) {
            const parts = initialPackage.split(', ').map(s => s.trim());
            // Отделяем стандартные опции от того, что было вписано вручную
            const standard = parts.filter(p => PACKAGE_OPTIONS.includes(p));
            const custom = parts.filter(p => !PACKAGE_OPTIONS.includes(p)).join(', ');

            setSelectedPackage(standard);
            setCustomPackage(custom);
        } else {
            // По умолчанию всегда выбираем "Устройство"
            setSelectedPackage(["Устройство"]);
        }
    }, [initialAppearance, initialPackage]);

    const addTag = (tag: string) => {
        if (!appearance.includes(tag)) {
            setAppearance(prev => prev ? `${prev}, ${tag}` : tag);
        }
    };

    const togglePackageOption = (option: string) => {
        setSelectedPackage(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
    };

    const handleSave = () => {
        // Собираем итоговую строку комплектации
        let finalPackage = selectedPackage.join(', ');
        if (customPackage) {
            finalPackage += finalPackage ? `, ${customPackage}` : customPackage;
        }

        onSave(appearance, finalPackage);
    };

    return (
        <div className="card acceptance-card">
            <h2 className="card-title">Акт приемки (Состояние)</h2>

            {/* 1. ВНЕШНИЙ ВИД */}
            <div className="acceptance-group">
                <label className="form-label">Внешний вид</label>
                <div className="tags-cloud">
                    {APPEARANCE_TAGS.map(tag => (
                        <button
                            key={tag}
                            className="tag-chip"
                            onClick={() => addTag(tag)}
                            type="button"
                        >
                            + {tag}
                        </button>
                    ))}
                </div>
                <textarea
                    className="form-textarea"
                    rows={3}
                    value={appearance}
                    onChange={e => setAppearance(e.target.value)}
                    placeholder="Опишите состояние..."
                />
            </div>

            {/* 2. КОМПЛЕКТАЦИЯ */}
            <div className="acceptance-group">
                <label className="form-label">Комплектация</label>
                <div className="checkbox-grid">
                    {PACKAGE_OPTIONS.map(opt => (
                        <label key={opt} className="checkbox-label-row">
                            <input
                                type="checkbox"
                                checked={selectedPackage.includes(opt)}
                                onChange={() => togglePackageOption(opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Дополнительно (например: наушники)"
                    value={customPackage}
                    onChange={e => setCustomPackage(e.target.value)}
                    style={{marginTop: '10px'}}
                />
            </div>

            <div className="acceptance-actions">
                <button
                    className="action-button save-button"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Сохранение..." : "Сохранить акт приемки"}
                </button>
            </div>
        </div>
    );
};