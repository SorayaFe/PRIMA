"use strict";
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        walkX = new ƒ.Control("walkX", 2, 0 /* PROPORTIONAL */, 300);
        walkY = new ƒ.Control("walkY", 2, 0 /* PROPORTIONAL */, 300);
        constructor(_name) {
            super(_name);
            this.createAvatar();
        }
        async createAvatar() {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = new ƒ.Vector3(10, 20, 0.5);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(cmpTransform);
            const spriteInfo = {
                path: "Assets/avatar2.png",
                name: "avatar",
                x: 0,
                y: 0,
                width: 28,
                height: 32,
                frames: 3,
                resolutionQuad: 32,
                offsetNext: 96,
            };
            await Greed.Sprite.loadSprites(spriteInfo);
            Greed.Sprite.setSprite(this, "avatar");
            const rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            this.addComponent(rigidBody);
            rigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                // if abfrage dazu
                this.hndHit();
            });
            // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.controlWalk);
        }
        controlWalk() {
            // const input: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
            // this.walkY.setInput(input);
            // this.walkY.setFactor(3);
            // const input2: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
            // this.walkX.setInput(input2);
            // this.walkX.setFactor(3);
            // const vector = new ƒ.Vector3(
            //   (this.walkX.getOutput() * ƒ.Loop.timeFrameGame) / 20,
            //   0,
            //   (this.walkY.getOutput() * ƒ.Loop.timeFrameGame) / 20
            // );
            // vector.transform(this.mtxLocal, false);
            // this.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);
        }
        hndHit() {
            //handle projectile hit
        }
    }
    Greed.Avatar = Avatar;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        health = 3;
        coins = 0;
        speed = 1;
        damage = 3.5;
        shotSpeed = 1;
        projectileSize = 1;
        //evtl range: number = 1;
        //evtl luck: number = 1; //possibly more coins with more luck
        constructor() {
            super();
            const domVui = document.querySelector("div#vui");
            console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
        }
        reduceMutator(_mutator) { }
    }
    Greed.GameState = GameState;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let dialog;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let viewport;
    let graph;
    let avatar;
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        //@ts-ignore
        dialog.showModal();
    }
    async function startInteractiveViewport() {
        await FudgeCore.Project.loadResourcesFromHTML();
        FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
        const graph = FudgeCore.Project.resources["Graph|2022-05-24T16:14:09.425Z|32411"];
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        const cmpCamera = new ƒ.ComponentCamera();
        const canvas = document.querySelector("canvas");
        const viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    function start(_event) {
        viewport = _event.detail;
        // viewport.camera.mtxPivot.translate(new ƒ.Vector3(10, 20, 25));
        // viewport.camera.mtxPivot.rotateY(180);
        graph = viewport.getBranch();
        avatar = new Greed.Avatar("Avatar");
        graph.addChild(avatar);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        viewport.draw();
    }
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Projectile extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.createProjectile();
        }
        createProjectile() { }
    }
    Greed.Projectile = Projectile;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒAid = FudgeAid;
    class Sprite {
        static animations = {};
        static async loadSprites(_spriteInfo) {
            let imgSpriteSheet = new ƒ.TextureImage();
            await imgSpriteSheet.load(_spriteInfo.path);
            let spriteSheet = new ƒ.CoatTextured(undefined, imgSpriteSheet);
            this.generateSprites(spriteSheet, _spriteInfo);
        }
        static generateSprites(_spriteSheet, _spriteInfo) {
            const sheetAnimation = new ƒAid.SpriteSheetAnimation(_spriteInfo.name, _spriteSheet);
            sheetAnimation.generateByGrid(ƒ.Rectangle.GET(_spriteInfo.x, _spriteInfo.y, _spriteInfo.width, _spriteInfo.height), _spriteInfo.frames, _spriteInfo.resolutionQuad, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(_spriteInfo.offsetNext));
            Sprite.animations[_spriteInfo.name] = sheetAnimation;
        }
        static setSprite(_node, _name) {
            const sprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(Sprite.animations[_name]);
            sprite.setFrameDirection(1);
            _node.addChild(sprite);
        }
    }
    Greed.Sprite = Sprite;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Enemy extends ƒ.Node {
        static enemies = [];
        enemy;
        constructor(_name, _enemy) {
            super(_name);
            this.enemy = _enemy;
            this.createEnemy();
        }
        createEnemy() {
            // create enemy
            this.addScripts();
        }
        addScripts() {
            // add enemy script based on type
        }
        hndHit() {
            // handle projectile hit
        }
        die() {
            // remove enemy and check if it was the last remaining enemy
            // event if it was last enemy
        }
    }
    Greed.Enemy = Enemy;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    let EnemyType;
    (function (EnemyType) {
        EnemyType["FOLLOW"] = "follow";
        EnemyType["FOLLOW_SHOOT"] = "follow_shoot";
        EnemyType["SHOOT_4"] = "shoot_4";
        EnemyType["SHOOT_2"] = "shoot_2";
        EnemyType["AIM"] = "aim";
    })(EnemyType = Greed.EnemyType || (Greed.EnemyType = {}));
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    class HeartSlot extends Greed.ItemSlot {
        constructor(_name) {
            super(_name);
        }
        getItem() {
            // create heart
            //TODO replace {} as any
            super.restock({});
        }
        applyItemEffects() {
            // apply heart effect
        }
    }
    Greed.HeartSlot = HeartSlot;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class ItemSlot extends ƒ.Node {
        static items = [];
        activeItem;
        constructor(_name) {
            super(_name);
            this.getItem();
        }
        getItem() {
            // get random item
            //TODO replace {} as any
            this.restock({});
        }
        restock(item) {
            this.activeItem = item;
            // set item to display
        }
        applyNewItem() {
            // remove item from display and remove from array
            this.applyItemEffects();
            this.getItem();
        }
        applyItemEffects() {
            // apply effect
        }
    }
    Greed.ItemSlot = ItemSlot;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Greed); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Greed.CustomComponentScript = CustomComponentScript;
})(Greed || (Greed = {}));
//# sourceMappingURL=Script.js.map