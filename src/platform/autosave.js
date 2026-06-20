export function createAutosave(doSave, delayMs = 500) {
    let timer = null;
    function clear() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }
    return {
        schedule() {
            clear();
            timer = setTimeout(() => {
                timer = null;
                doSave();
            }, delayMs);
        },
        flush() {
            if (timer !== null) {
                clear();
                doSave();
            }
        },
        cancel() {
            clear();
        },
    };
}
