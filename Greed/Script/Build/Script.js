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
                resolutionQuad: 28,
                offsetNext: 96,
            };
            await Greed.loadSprites(spriteInfo);
            Greed.setSprite(this, "avatar");
            this.sprite = this.getChildrenByName("Sprite")[0];
            // add rigid body
            const rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
            rigidBody.mtxPivot.translateY(-0.2);
            this.addComponent(rigidBody);
            rigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "Enemy") {
                    this.hndHit();
                }
            });
            rigidBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "ProjectileEnemy") {
                    this.hndHit();
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
                this.moveCamera();
            }
        }
        controlShoot() {
            if (Greed.gameState.canShoot) {
                const input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.ARROW_DOWN]);
                const input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.ARROW_RIGHT], [ƒ.KEYBOARD_CODE.ARROW_LEFT]);
                if (input || input2) {
                    Greed.gameState.setShotTimeout();
                    //create projectile
                    let direction = "";
                    if (input) {
                        direction = input > 0 ? "y" : "-y";
                    }
                    else if (input2) {
                        direction = input2 > 0 ? "x" : "-x";
                    }
                    const projectile = new Greed.Projectile("ProjectileAvatar", direction, this.mtxLocal.translation);
                    Greed.graph.addChild(projectile);
                    projectile.moveProjectile();
                }
            }
        }
        moveCamera() {
            if (this.mtxLocal.translation.y > 21 && !this.isInShop) {
                this.isInShop = true;
                this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 25, 20);
            }
            else if (this.mtxLocal.translation.y < 21 && this.isInShop) {
                this.isInShop = false;
                this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 15.5, 20);
            }
            else if (this.mtxLocal.translation.y < 15.5 && this.mtxLocal.translation.y > 4.3) {
                this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, this.mtxLocal.translation.y, 20);
            }
        }
        hndHit() {
            // TODO handle projectile hit
            Greed.gameState.availableHealth -= 1;
            Greed.gameState.updateHealth();
        }
    }
    Greed.Avatar = Avatar;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        availableHealth = 3;
        //TODO coins amount
        coins = 100;
        health = 3;
        speed = 1;
        damage = 3.5;
        fireRate = 1900;
        shotSpeed = 2.3;
        projectileSize = 0.3;
        range = 5;
        canShoot = true;
        heartsContainer;
        constructor() {
            super();
            const domVui = document.querySelector("div#vui");
            console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
            this.heartsContainer = document.getElementById("hearts");
            this.updateHealth();
        }
        reduceMutator(_mutator) { }
        setShotTimeout() {
            this.canShoot = false;
            const timeout = 3000 - this.fireRate;
            new ƒ.Timer(ƒ.Time.game, timeout > 300 ? timeout : 300, 1, () => {
                this.canShoot = true;
            });
        }
        updateHealth() {
            let innerHtml = "";
            for (let index = 0; index < this.availableHealth; index++) {
                innerHtml += '<div class="heart"></div>';
            }
            for (let index = 0; index < this.health - this.availableHealth; index++) {
                innerHtml += '<div class="heart empty"></div>';
            }
            this.heartsContainer.innerHTML = innerHtml;
        }
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
        const items = await fetch("Script/Source/Config/items.json");
        const enemies = await fetch("Script/Source/Config/enemies.json");
        const enemiesArray = (await enemies.json()).enemies;
        Greed.ItemSlot.items = (await items.json()).items;
        Greed.Enemy.enemies = enemiesArray.filter((e) => !e.isBoss);
        Greed.Boss.bosses = enemiesArray.filter((e) => e.isBoss);
        Greed.gameState = new Greed.GameState();
        const room = Greed.graph.getChildrenByName("Room")[0];
        // assign variables and add nodes
        bars = room.getChildrenByName("Door")[0];
        bars.activate(false);
        avatar = new Greed.Avatar("Avatar", viewport.camera);
        Greed.graph.addChild(avatar);
        setItemSlots();
        // button trigger listener
        const button = room.getChildrenByName("Button")[0];
        button
            .getComponent(ƒ.ComponentRigidbody)
            .addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
            if (_event.cmpRigidbody.node.name === "Avatar") {
                hndButtonTrigger(button);
            }
        });
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function setItemSlots() {
        const itemSlots = Greed.graph.getChildrenByName("Shop")[0].getChildrenByName("ItemSlots")[0];
        const priceTag1 = new Greed.PriceTag("PriceTag1", new ƒ.Vector3(3, 24.3, 0.1));
        itemSlots.addChild(priceTag1);
        itemSlots.addChild(new Greed.ItemSlot("Slot1", new ƒ.Vector3(3, 25, 0.1), priceTag1));
        const priceTag2 = new Greed.PriceTag("PriceTag2", new ƒ.Vector3(6, 24.3, 0.1));
        itemSlots.addChild(priceTag2);
        itemSlots.addChild(new Greed.ItemSlot("Slot2", new ƒ.Vector3(6, 25, 0.1), priceTag2));
        const priceTag3 = new Greed.PriceTag("PriceTag3", new ƒ.Vector3(9, 24.3, 0.1));
        itemSlots.addChild(priceTag3);
        itemSlots.addChild(new Greed.ItemSlot("Slot3", new ƒ.Vector3(9, 25, 0.1), priceTag3));
        const priceTag4 = new Greed.PriceTag("PriceTag4", new ƒ.Vector3(12, 24.3, 0.1));
        itemSlots.addChild(priceTag4);
        itemSlots.addChild(new Greed.HeartSlot("SlotHeart", new ƒ.Vector3(12, 25, 0.1), priceTag4));
    }
    function update(_event) {
        ƒ.Physics.simulate();
        avatar.controlWalk();
        avatar.controlShoot();
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
        direction;
        initialPosition;
        rigidBody;
        stop = false;
        constructor(_name, _direction, _position) {
            super(_name);
            this.direction = _direction;
            this.initialPosition = _position.clone;
            this.createProjectile(_position);
        }
        createProjectile(_position) {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = _position;
            cmpTransform.mtxLocal.scale(new ƒ.Vector3(Greed.gameState.projectileSize, Greed.gameState.projectileSize, Greed.gameState.projectileSize));
            const material = new ƒ.Material("MaterialProjectile", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("white")));
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(material));
            this.addComponent(cmpTransform);
            // add rigid body
            this.rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            this.rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
            this.rigidBody.isTrigger = true;
            this.addComponent(this.rigidBody);
            this.rigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "Enemy" || _event.cmpRigidbody.node.name === "Wall") {
                    this.removeProjectile();
                }
            });
        }
        moveProjectile() {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => {
                if (this.rigidBody && !this.stop) {
                    this.rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));
                    let vector = new ƒ.Vector3();
                    switch (this.direction) {
                        case "x":
                            vector = ƒ.Vector3.X(Greed.gameState.shotSpeed);
                            break;
                        case "-x":
                            vector = ƒ.Vector3.X(-Greed.gameState.shotSpeed);
                            break;
                        case "y":
                            vector = ƒ.Vector3.Y(Greed.gameState.shotSpeed);
                            break;
                        case "-y":
                            vector = ƒ.Vector3.Y(-Greed.gameState.shotSpeed);
                            break;
                        default:
                            break;
                    }
                    this.rigidBody.setVelocity(vector);
                    const distanceTraveled = this.mtxLocal.translation.getDistance(this.initialPosition);
                    if (distanceTraveled >= Greed.gameState.range) {
                        this.removeProjectile();
                    }
                }
            });
        }
        removeProjectile() {
            this.stop = true;
            this.rigidBody.setVelocity(new ƒ.Vector3(0, -1, 0));
            setTimeout(() => {
                Greed.graph.removeChild(this);
            }, 100);
        }
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
    class Boss extends ƒ.Node {
        static bosses = [];
    }
    Greed.Boss = Boss;
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
            // rigid body listender
            this.hndHit();
            this.addScripts();
        }
        addScripts() {
            // add enemy script based on type
        }
        hndHit() {
            // handle projectile hit
            if (this.enemy.health <= 0) {
                this.die();
            }
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
        Effects["SPEED"] = "speed";
        Effects["DAMAGE"] = "damage";
        Effects["SHOT_SPEED"] = "shotSpeed";
        Effects["FIRE_RATE"] = "fireRate";
        Effects["PROJECTILE_SIZE"] = "projectileSize";
        Effects["RANGE"] = "range";
    })(Effects = Greed.Effects || (Greed.Effects = {}));
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class ItemSlot extends ƒ.Node {
        static items = [];
        activeItem;
        priceTag;
        constructor(_name, _position, _priceTag) {
            super(_name);
            this.priceTag = _priceTag;
            this.createItemSlot(_position);
        }
        async createItemSlot(_position) {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = _position;
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(cmpTransform);
            // add rigid body
            const rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.STATIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            rigidBody.isTrigger = true;
            this.addComponent(rigidBody);
            rigidBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "Avatar" &&
                    Greed.gameState.coins >= this.activeItem.price) {
                    if (this.name === "SlotHeart" && Greed.gameState.availableHealth === Greed.gameState.health) {
                        return;
                    }
                    this.applyNewItem();
                }
            });
            this.getItem();
        }
        getItem() {
            // get random item
            this.activeItem = ƒ.Random.default.getElement(ItemSlot.items);
            // restock item
            this.restock();
        }
        async restock() {
            if (ItemSlot.items.length) {
                // remove item from array
                const index = ItemSlot.items.findIndex((i) => i === this.activeItem);
                if (index !== -1) {
                    ItemSlot.items.splice(index, 1);
                }
                // create sprite
                await Greed.loadSprites(this.activeItem.sprite);
                Greed.setSprite(this, this.activeItem.sprite.name);
                this.priceTag.setPrice(this.activeItem.price);
                this.priceTag.activate(true);
            }
        }
        applyNewItem() {
            Greed.gameState.coins -= this.activeItem.price;
            this.applyItemEffects();
            // remove item from display
            this.removeChild(this.getChildrenByName("Sprite")[0]);
            this.priceTag.activate(false);
            new ƒ.Timer(ƒ.Time.game, 1700, 1, () => {
                this.getItem();
            });
        }
        applyItemEffects() {
            for (let index = 0; index < this.activeItem.effects.length; index++) {
                Greed.gameState[this.activeItem.effects[index]] += this.activeItem.values[index];
                if (this.activeItem.effects[index] === Greed.Effects.HEALTH) {
                    Greed.gameState.availableHealth += this.activeItem.values[index];
                    Greed.gameState.updateHealth();
                }
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
        constructor(_name, _position, _priceTag) {
            super(_name, _position, _priceTag);
        }
        getItem() {
            // create heart
            this.activeItem = {
                name: "Heart",
                description: "",
                effects: [],
                values: [],
                price: 3,
                sprite: {
                    path: "Assets/heart.png",
                    name: "Heart",
                    x: 0,
                    y: 0,
                    width: 244,
                    height: 199,
                    frames: 1,
                    resolutionQuad: 300,
                    offsetNext: 0,
                },
            };
            // restock item
            super.restock();
        }
        applyItemEffects() {
            // apply heart effect
            Greed.gameState.availableHealth += 1;
            Greed.gameState.updateHealth();
        }
    }
    Greed.HeartSlot = HeartSlot;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class PriceTag extends ƒ.Node {
        sprite;
        constructor(_name, _position) {
            super(_name);
            this.createPriceTag(_position);
        }
        async createPriceTag(_position) {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = _position;
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(cmpTransform);
            const spriteInfo = {
                path: "Assets/prices.png",
                name: "Prices",
                x: 0,
                y: 0,
                width: 20,
                height: 9,
                frames: 3,
                resolutionQuad: 32,
                offsetNext: 22,
            };
            await Greed.loadSprites(spriteInfo);
            Greed.setSprite(this, spriteInfo.name);
            this.sprite = this.getChildrenByName("Sprite")[0];
        }
        setPrice(_price) {
            switch (_price) {
                case 3:
                    this.sprite.showFrame(0);
                    break;
                case 5:
                    this.sprite.showFrame(1);
                    break;
                case 10:
                    this.sprite.showFrame(2);
                    break;
                default:
                    break;
            }
            this.sprite.setFrameDirection(0);
        }
    }
    Greed.PriceTag = PriceTag;
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