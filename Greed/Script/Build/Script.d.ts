declare namespace Greed {
    import ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        constructor(_name: string);
        private createAvatar;
        private hndHit;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        health: number;
        coins: number;
        speed: number;
        damage: number;
        shotSpeed: number;
        projectileSize: number;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
declare namespace Greed {
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class Projectile extends ƒ.Node {
        constructor(_name: string);
        private createProjectile;
    }
}
declare module "Interfaces/SpriteInfo.interface" {
    export interface SpriteInfo {
        path: string;
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        frames: number;
        resolutionQuad: number;
        offsetNext: number;
    }
}
declare module "Interfaces/Enemy.interface" {
    import { SpriteInfo } from "Interfaces/SpriteInfo.interface";
    export enum EnemyType {
        FOLLOW = "follow",
        FOLLOW_SHOOT = "follow_shoot",
        SHOOT_4 = "shoot_4",
        SHOOT_2 = "shoot_2",
        AIM = "aim"
    }
    export interface EnemyInterface {
        health: number;
        size: number;
        type: EnemyType;
        isBoss: boolean;
        sprite: SpriteInfo;
    }
}
declare module "Enemies/Enemy" {
    import { EnemyInterface } from "Interfaces/Enemy.interface";
    import ƒ = FudgeCore;
    export class Enemy extends ƒ.Node {
        static enemies: EnemyInterface[];
        enemy: EnemyInterface;
        constructor(_name: string, _enemy: EnemyInterface);
        private createEnemy;
        private addScripts;
        private hndHit;
        private die;
    }
}
declare module "Interfaces/Item.interface" {
    import { SpriteInfo } from "Interfaces/SpriteInfo.interface";
    export interface Item {
        name: string;
        effects: string[];
        values: number[];
        price: number;
        increaseSize: boolean;
        sprite: SpriteInfo;
    }
}
declare module "Items/ItemSlot" {
    import { Item } from "Interfaces/Item.interface";
    import ƒ = FudgeCore;
    export class ItemSlot extends ƒ.Node {
        static items: Item[];
        private activeItem;
        constructor(_name: string);
        protected getItem(): void;
        restock(item: Item): void;
        private applyNewItem;
        protected applyItemEffects(): void;
    }
}
declare module "Items/HeartSlot" {
    import { ItemSlot } from "Items/ItemSlot";
    export class HeartSlot extends ItemSlot {
        constructor(_name: string);
        protected getItem(): void;
        protected applyItemEffects(): void;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
