export const loadData = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage:`, e);
        return fallback;
    }
};

export const saveData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};
