namespace Greed {
  export enum EnemyType {
    FOLLOW = "follow",
    FOLLOW_SHOOT = "follow_shoot",
    SHOOT_4 = "shoot_4",
    SHOOT_2 = "shoot_2",
    SHOOT_2_ROTATE = "shoot_2_rotate",
    AIM = "aim",
  }

  export interface EnemyInterface {
    health: number;
    sizeX: number;
    sizeY: number;
    type: EnemyType;
    isBoss: boolean;
    sprite: SpriteInfo;
  }
}
