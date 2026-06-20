import type { GameState, ItemId, Cat } from '../game/types.js';
import type { ClockPort } from '../game/ports.js';
import { adopt, buyItem, refreshIfNewDay } from '../game/shop.js';
import { ITEMS, ALL_ITEM_IDS } from '../game/items.js';
import { CAT_COST } from '../game/constants.js';

export interface ModalHandle {
  close(): void;
  refresh(): void;
  root: HTMLElement;
}

export interface ShopModalOptions {
  getState(): GameState;
  setState(s: GameState): void;
  clock: ClockPort;
  onChange(): void;
  onClose?(): void;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function breedName(id: string): string {
  return id;
}

/** Open the shop modal: a daily 5-cat roster plus buyable items. */
export function openShopModal(root: HTMLElement, opts: ShopModalOptions): ModalHandle {
  // Sync the roster to today before showing it.
  opts.setState(refreshIfNewDay(opts.getState(), opts.clock));

  const overlay = el('div', 'modal-overlay');
  const dialog = el('div', 'modal shop-modal');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', 'Shop');
  dialog.setAttribute('aria-modal', 'true');

  const title = el('h2', 'modal-title', 'Shop');
  const status = el('p', 'modal-status');
  status.setAttribute('role', 'status');

  const closeBtn = el('button', 'modal-close', 'Close');
  closeBtn.type = 'button';

  const catsSection = el('section', 'shop-cats');
  const itemsSection = el('section', 'shop-items');

  dialog.append(title, status, catsSection, itemsSection, closeBtn);
  overlay.append(dialog);
  root.append(overlay);

  function say(msg: string): void {
    status.textContent = msg;
  }

  function renderCats(): void {
    catsSection.innerHTML = '';
    catsSection.append(el('h3', undefined, 'Cats'));
    const state = opts.getState();
    const free = !state.player.firstCatClaimed;
    state.shop.adoptableCats.forEach((cat, index) => {
      const row = el('div', 'shop-row');
      const label = `${cat.name} · ${breedName(cat.breed)} · ${cat.personality}`;
      const cost = free && index === firstFreeIndex() ? 'Free' : `${CAT_COST}🪙`;
      row.append(el('span', 'shop-row-label', label));
      const btn = el('button', 'shop-adopt', `Adopt (${cost})`);
      btn.type = 'button';
      btn.dataset.index = String(index);
      btn.addEventListener('click', () => {
        const r = adopt(opts.getState(), index, opts.clock);
        if (r.adopted) {
          opts.setState(r.state);
          opts.onChange();
          say(`${cat.name} joined your home!`);
          renderCats();
        } else if (r.reason === 'full') {
          say('Your home is full for now.');
        } else if (r.reason === 'no-funds') {
          say('Not quite enough coins yet.');
        }
      });
      row.append(btn);
      catsSection.append(row);
    });
  }

  function firstFreeIndex(): number {
    // The free adoption applies to whichever cat is adopted first; show "Free" on the
    // first listed cat while no cat has been claimed yet.
    return 0;
  }

  function renderItems(): void {
    itemsSection.innerHTML = '';
    itemsSection.append(el('h3', undefined, 'Items'));
    for (const id of ALL_ITEM_IDS as ItemId[]) {
      const def = ITEMS[id];
      const row = el('div', 'shop-row');
      row.append(el('span', 'shop-row-label', `${def.displayName} · ${def.type}`));
      const btn = el('button', 'shop-buy', `Buy (${def.price}🪙)`);
      btn.type = 'button';
      btn.dataset.item = id;
      btn.addEventListener('click', () => {
        const r = buyItem(opts.getState(), id);
        if (r.bought) {
          opts.setState(r.state);
          opts.onChange();
          say(`Bought ${def.displayName}.`);
        } else {
          say('Not quite enough coins yet.');
        }
      });
      row.append(btn);
      itemsSection.append(row);
    }
  }

  function refresh(): void {
    renderCats();
    renderItems();
  }

  function close(): void {
    overlay.remove();
    opts.onClose?.();
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  dialog.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') close();
  });

  refresh();
  closeBtn.focus();
  return { close, refresh, root: dialog };
}

export interface LookupModalOptions {
  getCat(): Cat | undefined;
  onClose?(): void;
}

function trustLabel(trust: number): string {
  if (trust >= 60) return 'devoted';
  if (trust >= 25) return 'fond';
  if (trust > 0) return 'warming up';
  if (trust === 0) return 'curious';
  return 'shy';
}

function hungerLabel(hunger: number): string {
  if (hunger >= 70) return 'very hungry';
  if (hunger >= 35) return 'peckish';
  return 'content';
}

function sleepLabel(sleep: number): string {
  if (sleep >= 70) return 'sleepy';
  if (sleep >= 35) return 'a little tired';
  return 'bright-eyed';
}

/** Open the read-only book-page lookup modal for a single cat. */
export function openLookupModal(root: HTMLElement, opts: LookupModalOptions): ModalHandle {
  const cat = opts.getCat();

  const overlay = el('div', 'modal-overlay');
  const dialog = el('div', 'modal lookup-modal book');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', 'Cat details');
  dialog.setAttribute('aria-modal', 'true');

  const closeBtn = el('button', 'modal-close', 'Close');
  closeBtn.type = 'button';

  function refresh(): void {
    dialog.querySelectorAll('.book-page').forEach((p) => p.remove());
    const c = opts.getCat();
    if (!c) {
      const empty = el('div', 'book-page', 'This cat is no longer here.');
      dialog.insertBefore(empty, closeBtn);
      return;
    }

    const left = el('div', 'book-page book-page-left');
    left.append(el('h2', 'lookup-name', c.name));
    left.append(el('p', 'lookup-breed', `Breed: ${c.breed}`));
    left.append(el('p', 'lookup-personality', `Personality: ${c.personality}`));
    const likes = Object.keys(c.likes) as ItemId[];
    const likesText = likes.length
      ? likes.map((id) => ITEMS[id].displayName).join(', ')
      : 'still figuring it out';
    left.append(el('p', 'lookup-likes', `Likes: ${likesText}`));

    const right = el('div', 'book-page book-page-right');
    right.append(el('h3', undefined, 'Today'));
    right.append(el('p', 'lookup-trust', `Trust: ${trustLabel(c.trust)} (${Math.round(c.trust)})`));
    right.append(
      el('p', 'lookup-hunger', `Hunger: ${hungerLabel(c.hunger)} (${Math.round(c.hunger)})`),
    );
    right.append(el('p', 'lookup-sleep', `Energy: ${sleepLabel(c.sleep)} (${Math.round(c.sleep)})`));
    right.append(el('p', 'lookup-activity', `Right now: ${c.activity}`));

    dialog.insertBefore(left, closeBtn);
    dialog.insertBefore(right, closeBtn);
  }

  dialog.append(closeBtn);
  overlay.append(dialog);
  root.append(overlay);

  function close(): void {
    overlay.remove();
    opts.onClose?.();
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  dialog.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') close();
  });

  refresh();
  closeBtn.focus();
  void cat;
  return { close, refresh, root: dialog };
}
