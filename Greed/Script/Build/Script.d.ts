declare namespace Greed {
    import ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        private sprite;
        private walkX;
        private walkY;
        constructor(_name: string);
        private createAvatar;
        controlWalk(): void;
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
    import ƒ = FudgeCore;
    let gameState: GameState;
    let graph: ƒ.Node;
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class Projectile extends ƒ.Node {
        constructor(_name: string);
        private createProjectile;
    }
}
declare namespace Greed {
    function loadSprites(_spriteInfo: SpriteInfo): Promise<void>;
    function setSprite(_node: ƒ.Node, _name: string): void;
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class Enemy extends ƒ.Node {
        static enemies: EnemyInterface[];
        enemy: EnemyInterface;
        constructor(_name: string, _enemy: EnemyInterface);
        private createEnemy;
        private addScripts;
        private hndHit;
        private die;
    }
}
declare namespace Greed {
    enum EnemyType {
        FOLLOW = "follow",
        FOLLOW_SHOOT = "follow_shoot",
        SHOOT_4 = "shoot_4",
        SHOOT_2 = "shoot_2",
        AIM = "aim"
    }
    interface EnemyInterface {
        health: number;
        size: number;
        type: EnemyType;
        isBoss: boolean;
        sprite: SpriteInfo;
    }
}
declare namespace Greed {
    interface Item {
        name: string;
        effects: string[];
        values: number[];
        price: number;
        increaseSize: boolean;
        sprite: SpriteInfo;
    }
}
declare namespace Greed {
    interface SpriteInfo {
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
declare namespace Greed {
    import ƒ = FudgeCore;
    class ItemSlot extends ƒ.Node {
        static items: Item[];
        private activeItem;
        constructor(_name: string);
        protected getItem(): void;
        restock(item: Item): void;
        private applyNewItem;
        protected applyItemEffects(): void;
    }
}
declare namespace Greed {
    class HeartSlot extends ItemSlot {
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
