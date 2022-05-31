namespace Greed {
  export enum Effects {
    HEALTH = "health",
    COINS = "coins",
    SPEED = "speed",
    DAMAGE = "damage",
    SHOT_SPEED = "shotSpeed",
    PROJECTILE_SIZE = "projectileSize",
  }
  export interface Item {
    name: string;
    effects: Effects[];
    values: number[];
    price: number;
    increaseSize: boolean;
    sprite: SpriteInfo;
  }
}
