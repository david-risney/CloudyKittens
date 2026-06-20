/** Real system clock using local time for the calendar date. */
export const SystemClock = {
    now() {
        return Date.now();
    },
    today() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },
};
