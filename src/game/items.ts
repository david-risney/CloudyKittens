import type { ItemId, ItemType } from './types.js';

export interface ItemDef {
  id: ItemId;
  type: ItemType;
  price: number;
  displayName: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  salmon: { id: 'salmon', type: 'food', price: 8, displayName: 'Salmon' },
  tuna: { id: 'tuna', type: 'food', price: 6, displayName: 'Tuna' },
  chicken: { id: 'chicken', type: 'food', price: 5, displayName: 'Chicken' },
  mouse: { id: 'mouse', type: 'food', price: 4, displayName: 'Mouse' },
  treat: { id: 'treat', type: 'food', price: 3, displayName: 'Treat' },
  mouseToy: { id: 'mouseToy', type: 'toy', price: 7, displayName: 'Mouse Toy' },
  string: { id: 'string', type: 'toy', price: 4, displayName: 'String' },
  catnip: { id: 'catnip', type: 'toy', price: 6, displayName: 'Catnip' },
};

export const ALL_ITEM_IDS = Object.keys(ITEMS) as ItemId[];

export function isFood(item: ItemId): boolean {
  return ITEMS[item].type === 'food';
}

export function isToy(item: ItemId): boolean {
  return ITEMS[item].type === 'toy';
}
