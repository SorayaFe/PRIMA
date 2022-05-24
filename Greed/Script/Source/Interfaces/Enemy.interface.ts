import { SpriteInfo } from "./SpriteInfo.interface";

export enum EnemyType {
  FOLLOW = "follow",
  FOLLOW_SHOOT = "follow_shoot",
  SHOOT_4 = "shoot_4",
  SHOOT_2 = "shoot_2",
  AIM = "aim",
}

export interface EnemyInterface {
  health: number;
  size: number;
  type: EnemyType;
  isBoss: boolean;
  sprite: SpriteInfo;
}
