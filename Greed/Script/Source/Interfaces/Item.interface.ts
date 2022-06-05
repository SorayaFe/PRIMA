namespace Greed {
  export enum Effects {
    HEALTH = "health",
    SPEED = "speed",
    DAMAGE = "damage",
    SHOT_SPEED = "shotSpeed",
    FIRE_RATE = "fireRate",
    PROJECTILE_SIZE = "projectileSize",
    RANGE = "range",
  }
  export interface Item {
    name: string;
    description: string;
    effects: Effects[];
    values: number[];
    price: number;
    sprite: SpriteInfo;
  }
}
