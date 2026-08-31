const { useEffect, useRef } = React;

const Icon = ({ name, className = "" }) => {
    const iconRef = useRef(null);

    useEffect(() => {
        if (window.lucide && iconRef.current) {
            window.lucide.createIcons({
                root: iconRef.current.parentNode,
                nameAttr: 'data-lucide'
            });
        }
    });

    return <i ref={iconRef} data-lucide={name} className={className}></i>;
};
