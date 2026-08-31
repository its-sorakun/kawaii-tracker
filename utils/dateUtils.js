export const getLastNDays = (n = 7) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // ISO string is UTC, so we shift by local timezone offset to get the correct local date
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d - offset)).toISOString().split('T')[0];
        dates.push(localISOTime);
    }
    return dates;
};
