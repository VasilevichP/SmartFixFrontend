import {useState} from "react";

export const ExpandableDescription: React.FC<{ text: string }> = ({text}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Если текста нет
    if (!text) return <p className="card-description">Нет описания</p>;

    return (
        <div
            className={`card-description ${isExpanded ? 'expanded' : 'clamped'}`}
            onClick={(e) => {
                e.stopPropagation(); // Чтобы не срабатывал клик по карточке
                setIsExpanded(!isExpanded);
            }}
            title={!isExpanded ? "Нажмите, чтобы развернуть" : "Нажмите, чтобы свернуть"}
        >
            {text}
        </div>
    );
};