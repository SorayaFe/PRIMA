import { SpriteInfo } from "./SpriteInfo.interface";

export interface Item {
  name: string;
  effects: string[];
  values: number[];
  price: number;
  increaseSize: boolean;
  sprite: SpriteInfo;
}
