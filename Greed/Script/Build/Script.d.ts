declare namespace Greed {
    import ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        private sprite;
        private camera;
        private audio;
        private walkX;
        private walkY;
        private isInShop;
        constructor(_name: string, _camera: ƒ.ComponentCamera);
        private createAvatar;
        controlWalk(): void;
        controlShoot(): void;
        private moveCamera;
        hndHit(): void;
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
        isInvincible: boolean;
        private heartsContainer;
        private audio;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
        setShotTimeout(): void;
        updateHealth(): void;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    let gameState: GameState;
    let graph: ƒ.Node;
    let avatar: Avatar;
    let sounds: ƒ.ComponentAudio[];
    let enemiesNode: ƒ.Node;
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class Projectile extends ƒ.Node {
        private static mtrProjectileAvatar;
        private static mtrProjectileEnemy;
        private direction;
        private initialPosition;
        private rigidBody;
        private audio;
        private stop;
        private isEnemy;
        constructor(_name: string, _direction: string, _position: ƒ.Vector3, _isEnemy?: boolean);
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
    class Timer extends ƒ.Node {
        private static sprite;
        constructor(_name: string);
        private createTimer;
        static showFrame(frame: number, stop?: boolean): void;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class Enemy extends ƒ.Node {
        static enemies: EnemyInterface[];
        private enemy;
        private health;
        private audio;
        private script;
        constructor(_name: string, _enemy: EnemyInterface);
        private createEnemy;
        private hndHit;
        private die;
        protected addScripts(): void;
    }
}
declare namespace Greed {
    class Boss extends Enemy {
        static bosses: EnemyInterface[];
        constructor(_name: string, _enemy: EnemyInterface);
        protected addScripts(): void;
    }
}
declare namespace Greed {
    enum EnemyType {
        FOLLOW = "follow",
        FOLLOW_SHOOT = "follow_shoot",
        SHOOT_4 = "shoot_4",
        SHOOT_2 = "shoot_2",
        SHOOT_2_ROTATE = "shoot_2_rotate",
        CHARGE = "charge"
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
        static overlay: HTMLElement;
        protected activeItem: Item;
        private priceTag;
        private audio;
        constructor(_name: string, _position: ƒ.Vector3, _priceTag: PriceTag);
        private createItemSlot;
        protected getItem(): void;
        protected restock(): Promise<void>;
        manualRestock(): void;
        private applyNewItem;
        protected applyItemEffects(): void;
    }
}
declare namespace Greed {
    class HeartSlot extends ItemSlot {
        constructor(_name: string, _position: ƒ.Vector3, _priceTag: PriceTag);
        protected getItem(): void;
        protected applyItemEffects(): void;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    class PriceTag extends ƒ.Node {
        private sprite;
        constructor(_name: string, _position: ƒ.Vector3);
        createPriceTag(_position: ƒ.Vector3): Promise<void>;
        setPrice(_price: number): void;
    }
}
declare namespace Greed {
    import ƒ = FudgeCore;
    abstract class BasicScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        protected rigidBody: ƒ.ComponentRigidbody;
        constructor();
        private hndEvent;
        private update;
        protected abstract addInitialBehavior(): void;
        protected abstract addBehavior(): void;
        protected abstract clearTimers(): void;
    }
}
declare namespace Greed {
    /**
     * Script for Enemies with type CHARGE
     */
    class ChargeScript extends BasicScript {
        private chargeTimer;
        constructor();
        protected addInitialBehavior(): void;
        protected addBehavior(): void;
        protected clearTimers(): void;
        private setupTimers;
        private charge;
    }
}
declare namespace Greed {
    /**
     * Script for Enemies with type FOLLOW and FOLLOW_SHOOT
     */
    class FollowScript extends BasicScript {
        private shotTimer;
        private shoot;
        constructor(_shoot: boolean);
        protected addInitialBehavior(): void;
        protected addBehavior(): void;
        protected clearTimers(): void;
        private setupTimers;
        private addProjectile;
    }
}
declare namespace Greed {
    /**
     * Script for Enemies with type SHOOT2, SHOOT_2_ROTATE and SHOOT_4
     */
    class ShootScript extends BasicScript {
        private shotTimer;
        private movementTimer;
        private sprite;
        private vector;
        private rotate;
        private rotation;
        private shoot4;
        constructor(_rotate: boolean, _shoot4?: boolean);
        protected addInitialBehavior(): void;
        protected addBehavior(): void;
        protected clearTimers(): void;
        private setupTimers;
        private addProjectile;
    }
}
