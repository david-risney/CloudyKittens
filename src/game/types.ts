// Pure, DOM-free core types for Cloudy Kittens (see specs data-model.md).

export type ItemId =
  | 'salmon'
  | 'tuna'
  | 'chicken'
  | 'mouse'
  | 'treat'
  | 'mouseToy'
  | 'string'
  | 'catnip';

export type ItemType = 'food' | 'toy';

export type Personality = 'playful' | 'hunter' | 'savage' | 'cute' | 'sleepy';

export type BreedId = 'tabby' | 'calico' | 'siamese' | 'tuxedo' | 'ginger';

export type Appearance = 0 | 1 | 2;

export type Activity = 'wandering' | 'sitting' | 'sleeping';

export type ActionKind = 'item' | 'pet' | 'lookup';

export interface Cat {
  id: string;
  name: string;
  breed: BreedId;
  appearance: Appearance;
  personality: Personality;
  likes: Partial<Record<ItemId, number>>;
  trust: number;
  hunger: number;
  sleep: number;
  activity: Activity;
  tileX: number;
  tileY: number;
}

export interface Player {
  money: number;
  inventory: Partial<Record<ItemId, number>>;
  firstCatClaimed: boolean;
}

export interface Settings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface ShopState {
  lastShopDay: string;
  adoptableCats: Cat[];
}

export interface GameState {
  version: number;
  cats: Cat[];
  player: Player;
  shop: ShopState;
  settings: Settings;
  lastSeen: number;
}

export const SAVE_VERSION = 1;
