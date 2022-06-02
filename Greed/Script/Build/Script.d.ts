declare namespace Greed {
    import ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        private sprite;
        private camera;
        private walkX;
        private walkY;
        private isInShop;
        constructor(_name: string, _camera: ƒ.ComponentCamera);
        private createAvatar;
        controlWalk(): void;
        controlShoot(): void;
        private moveCamera;
        private hndHit;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        availableHealth: number;
        coins: number;
        health: number;
        speed: number;
        damage: number;
        fireRate: number;
        shotSpeed: number;
        projectileSize: number;
        range: number;
        canShoot: boolean;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
        setShotTimeout(): void;
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
        private direction;
        private initialPosition;
        private rigidBody;
        private stop;
        constructor(_name: string, _direction: string, _position: ƒ.Vector3);
        private createProjectile;
        moveProjectile(): void;
        private removeProjectile;
    }
}
declare namespace Greed {
    function loadSprites(_spriteInfo: SpriteInfo): Promise<void>;
    function setSprite(_node: ƒ.Node, _name: string): void;
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class Boss extends ƒ.Node {
        static bosses: EnemyInterface[];
    }
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
        sizeX: number;
        sizeY: number;
        type: EnemyType;
        isBoss: boolean;
        sprite: SpriteInfo;
    }
}
declare namespace Greed {
    enum Effects {
        HEALTH = "health",
        COINS = "coins",
        SPEED = "speed",
        DAMAGE = "damage",
        SHOT_SPEED = "shotSpeed",
        FIRE_RATE = "fireRate",
        PROJECTILE_SIZE = "projectileSize",
        RANGE = "range"
    }
    interface Item {
        name: string;
        description: string;
        effects: Effects[];
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
        constructor(_name: string, _position: ƒ.Vector3);
        private createItemSlot;
        protected getItem(): void;
        restock(): Promise<void>;
        private applyNewItem;
        protected applyItemEffects(): void;
    }
}
declare namespace Greed {
    class HeartSlot extends ItemSlot {
        constructor(_name: string, _position: ƒ.Vector3);
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
