namespace Greed {
  export interface Item {
    name: string;
    effects: string[];
    values: number[];
    price: number;
    increaseSize: boolean;
    sprite: SpriteInfo;
  }
}
