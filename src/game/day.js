/** True when the calendar date differs from the shop's last-seeded day. */
export function isNewDay(lastShopDay, clock) {
    return clock.today() !== lastShopDay;
}
