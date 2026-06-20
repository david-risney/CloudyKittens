/** A debounced saver: many rapid `schedule()` calls collapse into one delayed save. */
export interface Autosave {
  schedule(): void;
  flush(): void;
  cancel(): void;
}

export function createAutosave(doSave: () => void, delayMs = 500): Autosave {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clear(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    schedule(): void {
      clear();
      timer = setTimeout(() => {
        timer = null;
        doSave();
      }, delayMs);
    },
    flush(): void {
      if (timer !== null) {
        clear();
        doSave();
      }
    },
    cancel(): void {
      clear();
    },
  };
}
