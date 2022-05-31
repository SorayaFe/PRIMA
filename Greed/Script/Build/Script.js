"use strict";
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        sprite;
        camera;
        walkX = new ƒ.Control("walkX", 2, 0 /* PROPORTIONAL */, 150);
        walkY = new ƒ.Control("walkY", 2, 0 /* PROPORTIONAL */, 150);
        isInShop = false;
        constructor(_name, _camera) {
            super(_name);
            this.camera = _camera;
            this.createAvatar();
        }
        async createAvatar() {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = new ƒ.Vector3(7.5, 15.5, 0.1);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
            this.addComponent(cmpTransform);
            // create sprite
            const spriteInfo = {
                path: "Assets/avatar.png",
                name: "avatar",
                x: 0,
                y: 0,
                width: 28,
                height: 32,
                frames: 3,
                resolutionQuad: 32,
                offsetNext: 96,
            };
            await Greed.loadSprites(spriteInfo);
            Greed.setSprite(this, "avatar");
            this.sprite = this.getChildrenByName("Sprite")[0];
            // add rigid body
            const rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
            this.addComponent(rigidBody);
            rigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                // TODO if abfrage dazu
                this.hndHit();
            });
            rigidBody.addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, (_event) => {
                if (_event.cmpRigidbody.node.name == "Door") {
                    this.moveCamera(this.isInShop ? "leave" : "enter");
                }
            });
        }
        controlWalk() {
            const rigidBody = this.getComponent(ƒ.ComponentRigidbody);
            if (rigidBody) {
                rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));
                const input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
                this.walkY.setInput(input);
                this.walkY.setFactor(2 * Greed.gameState.speed);
                const input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D], [ƒ.KEYBOARD_CODE.A]);
                this.walkX.setInput(input2);
                this.walkX.setFactor(2 * Greed.gameState.speed);
                const vector = new ƒ.Vector3((this.walkX.getOutput() * ƒ.Loop.timeFrameGame) / 20, (this.walkY.getOutput() * ƒ.Loop.timeFrameGame) / 20, 0);
                vector.transform(this.mtxLocal, false);
                rigidBody.setVelocity(vector);
                this.sprite.setFrameDirection(input === 0 && input2 === 0 ? 0 : 1);
                if (!this.isInShop) {
                    this.moveCamera();
                }
            }
        }
        moveCamera(transitionShop) {
            if (transitionShop) {
                if (transitionShop === "enter") {
                    this.isInShop = true;
                    this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 27, 20);
                }
                else {
                    this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 15.5, 20);
                    this.isInShop = false;
                }
            }
            else if (this.mtxLocal.translation.y < 15.5 && this.mtxLocal.translation.y > 4.3) {
                this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, this.mtxLocal.translation.y, 20);
            }
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
    let avatar;
    let bars;
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            document.getElementById("vui").style.visibility = "visible";
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
        const cmpCamera = new ƒ.ComponentCamera();
        const canvas = document.querySelector("canvas");
        //TODO
        //canvas.requestPointerLock();
        const viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        //TODO
        // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    async function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.rotateY(180);
        Greed.graph = viewport.getBranch();
        // load config
        const items = await fetch("items.json");
        Greed.ItemSlot.items = (await items.json()).items;
        const enemies = await fetch("enemies.json");
        Greed.Enemy.enemies = (await enemies.json()).enemies;
        Greed.gameState = new Greed.GameState();
        const room = Greed.graph.getChildrenByName("Room")[0];
        // assign variables and add nodes
        bars = room.getChildrenByName("Door")[0].getChild(0);
        bars.activate(false);
        avatar = new Greed.Avatar("Avatar", viewport.camera);
        Greed.graph.addChild(avatar);
        const itemSlots = Greed.graph.getChildrenByName("Shop")[0].getChildrenByName("ItemSlots")[0];
        itemSlots.addChild(new Greed.ItemSlot("Slot1", new ƒ.Vector3(3, 25, 0.1)));
        itemSlots.addChild(new Greed.ItemSlot("Slot2", new ƒ.Vector3(6, 25, 0.1)));
        itemSlots.addChild(new Greed.ItemSlot("Slot3", new ƒ.Vector3(9, 25, 0.1)));
        // button trigger listener
        const button = room.getChildrenByName("Button")[0];
        button
            .getComponent(ƒ.ComponentRigidbody)
            .addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
            if (_event.cmpRigidbody.node.name == "Avatar") {
                hndButtonTrigger(button);
            }
        });
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function update(_event) {
        ƒ.Physics.simulate();
        avatar.controlWalk();
        viewport.draw();
    }
    function hndButtonTrigger(_buttonNode) {
        _buttonNode.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(-0.085);
        bars.activate(true);
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
    const animations = {};
    async function loadSprites(_spriteInfo) {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load(_spriteInfo.path);
        let spriteSheet = new ƒ.CoatTextured(undefined, imgSpriteSheet);
        generateSprites(spriteSheet, _spriteInfo);
    }
    Greed.loadSprites = loadSprites;
    function generateSprites(_spriteSheet, _spriteInfo) {
        const sheetAnimation = new ƒAid.SpriteSheetAnimation(_spriteInfo.name, _spriteSheet);
        sheetAnimation.generateByGrid(ƒ.Rectangle.GET(_spriteInfo.x, _spriteInfo.y, _spriteInfo.width, _spriteInfo.height), _spriteInfo.frames, _spriteInfo.resolutionQuad, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(_spriteInfo.offsetNext));
        animations[_spriteInfo.name] = sheetAnimation;
    }
    function setSprite(_node, _name) {
        const sprite = new ƒAid.NodeSprite("Sprite");
        sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        sprite.setAnimation(animations[_name]);
        sprite.setFrameDirection(1);
        _node.addChild(sprite);
    }
    Greed.setSprite = setSprite;
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
    let Effects;
    (function (Effects) {
        Effects["HEALTH"] = "health";
        Effects["COINS"] = "coins";
        Effects["SPEED"] = "speed";
        Effects["DAMAGE"] = "damage";
        Effects["SHOT_SPEED"] = "shotSpeed";
        Effects["PROJECTILE_SIZE"] = "projectileSize";
    })(Effects = Greed.Effects || (Greed.Effects = {}));
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class ItemSlot extends ƒ.Node {
        static items = [];
        activeItemIndex;
        constructor(_name, _position) {
            super(_name);
            this.createItemSlot(_position);
        }
        createItemSlot(_position) {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = _position;
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(cmpTransform);
            // add rigid body
            const rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.STATIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            rigidBody.isTrigger = true;
            this.addComponent(rigidBody);
            rigidBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name == "Avatar") {
                    this.applyNewItem();
                }
            });
            this.getItem();
        }
        getItem() {
            // get random item
            this.activeItemIndex = ƒ.Random.default.getIndex(ItemSlot.items);
            // restock item
            this.restock();
        }
        async restock() {
            // create sprite
            await Greed.loadSprites(ItemSlot.items[this.activeItemIndex].sprite);
            Greed.setSprite(this, ItemSlot.items[this.activeItemIndex].sprite.name);
        }
        applyNewItem() {
            this.applyItemEffects();
            // remove item from display and remove from array
            this.removeChild(this.getChildrenByName("Sprite")[0]);
            ItemSlot.items.splice(this.activeItemIndex, 1);
            new ƒ.Timer(ƒ.Time.game, 2000, 1, () => {
                this.getItem();
            });
        }
        applyItemEffects() {
            const item = ItemSlot.items[this.activeItemIndex];
            for (let index = 0; index < item.effects.length; index++) {
                Greed.gameState[item.effects[index]] = item.values[index];
            }
        }
    }
    Greed.ItemSlot = ItemSlot;
})(Greed || (Greed = {}));
/// <reference path="./ItemSlot.ts" />
var Greed;
/// <reference path="./ItemSlot.ts" />
(function (Greed) {
    class HeartSlot extends Greed.ItemSlot {
        constructor(_name, _position) {
            super(_name, _position);
        }
        getItem() {
            // create heart
            // restock item
            super.restock();
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