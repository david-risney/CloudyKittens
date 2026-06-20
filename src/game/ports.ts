// Injected dependency ports keep game logic deterministic and DOM-free.

export interface StoragePort {
  read(key: string): string | null;
  write(key: string, value: string): void;
}

export interface ClockPort {
  /** Epoch milliseconds. */
  now(): number;
  /** Local calendar date as 'YYYY-MM-DD'. */
  today(): string;
}
