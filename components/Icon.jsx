const { useEffect, useRef } = React;

const Icon = ({ name, className = "" }) => {
    const iconRef = useRef(null);

    useEffect(() => {
        if (window.lucide && iconRef.current) {
            // Re-create the <i> tag inside our stable span
            iconRef.current.innerHTML = `<i data-lucide="${name}" class="${className}"></i>`;
            window.lucide.createIcons({
                root: iconRef.current
            });
        }
    }, [name, className]);

    // React tracks this span, Lucide replaces the <i> inside it. Separation of DOM concerns!
    return <span ref={iconRef} className="inline-flex items-center justify-center"></span>;
};
