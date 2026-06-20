import type { ClockPort } from './ports.js';

/** True when the calendar date differs from the shop's last-seeded day. */
export function isNewDay(lastShopDay: string, clock: ClockPort): boolean {
  return clock.today() !== lastShopDay;
}
