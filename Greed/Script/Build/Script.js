"use strict";
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        sprite;
        camera;
        audio;
        walkX = new ƒ.Control("walkX", 2, 0 /* PROPORTIONAL */, 150);
        walkY = new ƒ.Control("walkY", 2, 0 /* PROPORTIONAL */, 150);
        isInShop = false;
        constructor(_name, _camera) {
            super(_name);
            this.camera = _camera;
            this.audio = Greed.sounds.find((s) => s.getAudio().name === "Hurt");
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
            this.addComponent(rigidBody);
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
                const position = rigidBody.getPosition();
                rigidBody.setPosition(new ƒ.Vector3(position.x, position.y, 0.5));
                const input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
                this.walkY.setInput(input);
                this.walkY.setFactor(2.1 * Greed.gameState.speed);
                const input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D], [ƒ.KEYBOARD_CODE.A]);
                this.walkX.setInput(input2);
                this.walkX.setFactor(2.1 * Greed.gameState.speed);
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
                    const projectile = new Greed.Projectile("ProjectileAvatar", direction, this.mtxLocal.translation, false);
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
            Greed.gameState.availableHealth -= 1;
            this.audio.play(true);
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
        coins = 1000;
        health = 3;
        speed = 1.1;
        damage = 3.5;
        fireRate = 1900;
        shotSpeed = 2.4;
        projectileSize = 0.3;
        range = 5;
        canShoot = true;
        isInvincible = false;
        heartsContainer;
        audio;
        constructor() {
            super();
            const domVui = document.querySelector("div#vui");
            new ƒUi.Controller(this, domVui);
            this.heartsContainer = document.getElementById("hearts");
            this.audio = Greed.sounds.find((s) => s.getAudio().name === "Die");
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
            if (this.availableHealth <= 0) {
                this.audio.play(true);
                // TODO die
            }
        }
    }
    Greed.GameState = GameState;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let viewport;
    let bars;
    let button;
    let doorAudio;
    let coinAudio;
    let addEnemiesAudio;
    let restockAudio;
    let coinSlotAudio;
    let isFighting = false;
    let stage = 0;
    let remainingRounds = 5;
    let timer;
    const amounts = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5];
    function init(_event) {
        const dialog = document.getElementById("dialog");
        const start = document.querySelector("div.start");
        let started = false;
        start.addEventListener("click", function (_event) {
            if (!started) {
                started = true;
                start.children[0].classList.add("load");
                startInteractiveViewport();
                setTimeout(() => {
                    dialog.style.display = "none";
                    document.getElementById("outer").style.visibility = "visible";
                }, 3000);
            }
        });
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
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    async function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.rotateY(180);
        Greed.graph = viewport.getBranch();
        ƒ.AudioManager.default.listenTo(Greed.graph);
        Greed.sounds = Greed.graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
        Greed.graph.addEventListener("lastEnemyKilled", hndLastEnemyKilled);
        Greed.graph.addEventListener("touchedAvatar", hndAvatarTouched);
        Greed.gameState = new Greed.GameState();
        // load config
        const items = await fetch("Script/Source/Config/items.json");
        const enemies = await fetch("Script/Source/Config/enemies.json");
        const enemiesArray = (await enemies.json()).enemies;
        Greed.ItemSlot.items = (await items.json()).items;
        Greed.Enemy.enemies = enemiesArray.filter((e) => e.type !== Greed.EnemyType.BOSS);
        Greed.Boss.bosses = enemiesArray.filter((e) => e.type === Greed.EnemyType.BOSS);
        const room = Greed.graph.getChildrenByName("Room")[0];
        // assign sounds
        doorAudio = Greed.sounds.find((s) => s.getAudio().name === "Door");
        coinAudio = Greed.sounds.find((s) => s.getAudio().name === "Money");
        addEnemiesAudio = Greed.sounds.find((s) => s.getAudio().name === "EnemyAdd");
        restockAudio = Greed.sounds.find((s) => s.getAudio().name === "Restock");
        coinSlotAudio = Greed.sounds.find((s) => s.getAudio().name === "CoinSlot");
        // assign nodes and add nodes
        bars = room.getChildrenByName("Door")[0];
        bars.activate(false);
        button = room.getChildrenByName("Button")[0];
        Greed.avatar = new Greed.Avatar("Avatar", viewport.camera);
        Greed.graph.addChild(Greed.avatar);
        Greed.enemiesNode = room.getChildrenByName("Enemies")[0];
        room.addChild(new Greed.Timer("Timer"));
        setItemSlots();
        // button trigger listener
        button
            .getComponent(ƒ.ComponentRigidbody)
            .addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
            if (_event.cmpRigidbody.node.name === "Avatar" && !isFighting && stage < 6) {
                hndButtonTouched();
            }
        });
        // restock  listener
        Greed.graph
            .getChildrenByName("Shop")[0]
            .getChildrenByName("Restock")[0]
            .getComponent(ƒ.ComponentRigidbody)
            .addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
            if (_event.cmpRigidbody.node.name === "Avatar") {
                hndRestock();
            }
        });
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function setItemSlots() {
        const itemSlots = Greed.graph.getChildrenByName("Shop")[0].getChildrenByName("ItemSlots")[0];
        const priceTag1 = new Greed.PriceTag("PriceTag", new ƒ.Vector3(3, 24.3, 0.1));
        itemSlots.addChild(priceTag1);
        const priceTag2 = new Greed.PriceTag("PriceTag", new ƒ.Vector3(6, 24.3, 0.1));
        itemSlots.addChild(priceTag2);
        const priceTag3 = new Greed.PriceTag("PriceTag", new ƒ.Vector3(9, 24.3, 0.1));
        itemSlots.addChild(priceTag3);
        const priceTag4 = new Greed.PriceTag("PriceTag", new ƒ.Vector3(12, 24.3, 0.1));
        itemSlots.addChild(priceTag4);
        itemSlots.addChild(new Greed.ItemSlot("Slot", new ƒ.Vector3(3, 25, 0.1), priceTag1));
        itemSlots.addChild(new Greed.ItemSlot("Slot", new ƒ.Vector3(6, 25, 0.1), priceTag2));
        itemSlots.addChild(new Greed.ItemSlot("Slot", new ƒ.Vector3(9, 25, 0.1), priceTag3));
        itemSlots.addChild(new Greed.HeartSlot("SlotHeart", new ƒ.Vector3(12, 25, 0.1), priceTag4));
    }
    function hndRestock() {
        const itemSlots = Greed.graph
            .getChildrenByName("Shop")[0]
            .getChildrenByName("ItemSlots")[0]
            .getChildrenByName("Slot");
        Greed.gameState.coins -= 1;
        coinSlotAudio.play(true);
        restockAudio.play(true);
        itemSlots.map((s) => s.manualRestock());
    }
    function hndButtonTouched() {
        remainingRounds = stage <= 4 ? 5 : 1;
        button.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(-0.085);
        bars.activate(true);
        doorAudio.play(true);
        setTimer();
    }
    function hndLastEnemyKilled() {
        if (remainingRounds === 0) {
            stage++;
            bars.activate(false);
            doorAudio.play(true);
            Greed.Timer.showFrame(30, true);
            button.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(0.085);
            isFighting = false;
        }
        else {
            setTimer();
        }
    }
    function setTimer() {
        if (timer) {
            timer.clear();
        }
        isFighting = true;
        startNewRound();
        if (remainingRounds !== 0) {
            timer = new ƒ.Timer(ƒ.Time.game, stage < 5 ? 11000 : 31000, remainingRounds, () => {
                startNewRound();
            });
        }
    }
    function startNewRound() {
        Greed.gameState.coins += 5;
        coinAudio.play(true);
        remainingRounds--;
        if (remainingRounds === 0 && stage !== 5) {
            Greed.Timer.showFrame(30, true);
        }
        else {
            Greed.Timer.showFrame(stage < 5 ? 20 : 0);
        }
        createEnemies(stage >= 5);
    }
    function createEnemies(_isBoss) {
        const enemy = _isBoss
            ? Greed.Boss.bosses[0]
            : ƒ.Random.default.getElement(Greed.Enemy.enemies);
        Greed.gameState.isInvincible = true;
        addEnemiesAudio.play(true);
        if (_isBoss) {
            Greed.enemiesNode.addChild(new Greed.Boss("Boss", enemy, stage));
        }
        else {
            for (let index = 0; index < ƒ.Random.default.getElement(amounts); index++) {
                Greed.enemiesNode.addChild(new Greed.Enemy("Enemy", enemy));
            }
        }
        setTimeout(() => {
            Greed.gameState.isInvincible = false;
        }, 2000);
    }
    function hndAvatarTouched() {
        if (!Greed.gameState.isInvincible) {
            Greed.avatar.hndHit();
        }
    }
    function update(_event) {
        ƒ.Physics.simulate();
        Greed.avatar.controlWalk();
        Greed.avatar.controlShoot();
        viewport.draw();
    }
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Projectile extends ƒ.Node {
        static mtrProjectileAvatar = new ƒ.Material("ProjectileAvatar", ƒ.ShaderLitTextured, new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("./Assets/projectile-avatar.png")));
        static mtrProjectileEnemy = new ƒ.Material("ProjectileEnemy", ƒ.ShaderLitTextured, new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("./Assets/projectile-enemy.png")));
        direction;
        initialPosition;
        rigidBody;
        audio;
        stop = false;
        isEnemy = true;
        constructor(_name, _direction, _position, _isEnemy = true) {
            super(_name);
            this.isEnemy = _isEnemy;
            this.direction = _direction;
            this.initialPosition = _position.clone;
            this.audio = Greed.sounds.find((s) => s.getAudio().name === "Projectile");
            this.createProjectile(_position);
        }
        createProjectile(_position) {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = _position;
            const projectileSize = this.isEnemy ? 0.3 : Greed.gameState.projectileSize;
            cmpTransform.mtxLocal.scale(new ƒ.Vector3(projectileSize, projectileSize, projectileSize));
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(this.isEnemy ? Projectile.mtrProjectileEnemy : Projectile.mtrProjectileAvatar));
            this.addComponent(cmpTransform);
            // add rigid body
            this.rigidBody = new ƒ.ComponentRigidbody(1, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            this.rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
            this.rigidBody.isTrigger = true;
            this.addComponent(this.rigidBody);
            this.rigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                if ((!this.isEnemy && _event.cmpRigidbody.node.name === "Enemy") ||
                    (this.isEnemy && _event.cmpRigidbody.node.name === "Avatar") ||
                    _event.cmpRigidbody.node.name === "Wall" ||
                    _event.cmpRigidbody.node.name === "Door") {
                    this.removeProjectile();
                }
            });
        }
        moveProjectile() {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => {
                if (this.rigidBody && !this.stop) {
                    this.rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));
                    let vector = new ƒ.Vector3();
                    const shotSpeed = this.isEnemy ? 2.3 : Greed.gameState.shotSpeed;
                    switch (this.direction) {
                        case "x":
                            vector = ƒ.Vector3.X(shotSpeed);
                            break;
                        case "-x":
                            vector = ƒ.Vector3.X(-shotSpeed);
                            break;
                        case "y":
                            vector = ƒ.Vector3.Y(shotSpeed);
                            break;
                        case "-y":
                            vector = ƒ.Vector3.Y(-shotSpeed);
                            break;
                        default:
                            break;
                    }
                    this.rigidBody.setVelocity(vector);
                    const distanceTraveled = this.mtxLocal.translation.getDistance(this.initialPosition);
                    if (distanceTraveled >= (this.isEnemy ? 5 : Greed.gameState.range)) {
                        this.removeProjectile();
                    }
                }
            });
        }
        removeProjectile() {
            this.stop = true;
            this.rigidBody.setVelocity(new ƒ.Vector3(0, -1, 0));
            setTimeout(() => {
                this.audio.play(true);
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
    class Timer extends ƒ.Node {
        static sprite;
        constructor(_name) {
            super(_name);
            this.createTimer();
        }
        async createTimer() {
            const cmpTransform = new ƒ.ComponentTransform();
            cmpTransform.mtxLocal.translation = new ƒ.Vector3(7.5, 10, 0.1);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
            this.addComponent(cmpTransform);
            const spriteInfo = {
                path: "Assets/timer.png",
                name: "Timer",
                x: 0,
                y: 0,
                width: 35,
                height: 7,
                frames: 31,
                resolutionQuad: 35,
                offsetNext: 35,
            };
            await Greed.loadSprites(spriteInfo);
            Greed.setSprite(this, spriteInfo.name);
            Timer.sprite = this.getChildrenByName("Sprite")[0];
            Timer.sprite.framerate = 1;
            Timer.showFrame(30, true);
        }
        static showFrame(frame, stop = false) {
            Timer.sprite.showFrame(frame);
            Timer.sprite.setFrameDirection(stop ? 0 : 1);
        }
    }
    Greed.Timer = Timer;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Enemy extends ƒ.Node {
        static enemies = [];
        enemy;
        health;
        audio;
        script;
        constructor(_name, _enemy) {
            super(_name);
            this.enemy = _enemy;
            this.health = this.enemy.health;
            this.audio = Greed.sounds.find((s) => s.getAudio().name === "EnemyDie");
            this.createEnemy();
        }
        async createEnemy() {
            const cmpTransform = new ƒ.ComponentTransform();
            const vector = this.enemy.type === Greed.EnemyType.BOSS
                ? new ƒ.Vector3(10, 12, 0)
                : ƒ.Random.default.getVector3(new ƒ.Vector3(1, 1, 0), new ƒ.Vector3(14, 19, 0));
            cmpTransform.mtxLocal.translation = vector;
            cmpTransform.mtxLocal.scaleX(this.enemy.sizeX);
            cmpTransform.mtxLocal.scaleY(this.enemy.sizeY);
            cmpTransform.mtxLocal.translateZ(0.1);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
            this.addComponent(cmpTransform);
            // create sprite
            await Greed.loadSprites(this.enemy.sprite);
            Greed.setSprite(this, this.enemy.sprite.name);
            // add rigid body
            const rigidBody = new ƒ.ComponentRigidbody(5, ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, undefined, this.mtxLocal);
            rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
            rigidBody.effectGravity = 0;
            this.addComponent(rigidBody);
            rigidBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "ProjectileAvatar") {
                    this.hndHit();
                }
            });
            rigidBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "Avatar") {
                    this.dispatchEvent(new Event("touchedAvatar", { bubbles: true }));
                }
            });
            this.addScripts();
        }
        hndHit() {
            this.health -= Greed.gameState.damage;
            if (this.health <= 0) {
                setTimeout(() => {
                    this.die();
                }, 105);
            }
        }
        die() {
            this.audio.play(true);
            if (Greed.enemiesNode.getChildren().length === 1) {
                this.dispatchEvent(new Event("lastEnemyKilled", { bubbles: true }));
            }
            this.removeComponent(this.script);
            Greed.enemiesNode.removeChild(this);
        }
        addScripts() {
            switch (this.enemy.type) {
                case Greed.EnemyType.SHOOT_2:
                    this.script = new Greed.ShootScript(false);
                    this.addComponent(this.script);
                    break;
                case Greed.EnemyType.SHOOT_2_ROTATE:
                    this.script = new Greed.ShootScript(true);
                    this.addComponent(this.script);
                    break;
                case Greed.EnemyType.SHOOT_4:
                    this.script = new Greed.ShootScript(false, true);
                    this.addComponent(this.script);
                    break;
                case Greed.EnemyType.FOLLOW:
                    this.script = new Greed.FollowScript(false);
                    this.addComponent(this.script);
                    break;
                case Greed.EnemyType.FOLLOW_SHOOT:
                    this.script = new Greed.FollowScript(true);
                    this.addComponent(this.script);
                    break;
                case Greed.EnemyType.CHARGE:
                    this.script = new Greed.ChargeScript();
                    this.addComponent(this.script);
                    break;
                default:
                    break;
            }
        }
    }
    Greed.Enemy = Enemy;
})(Greed || (Greed = {}));
/// <reference path="./Enemy.ts" />
var Greed;
/// <reference path="./Enemy.ts" />
(function (Greed) {
    class Boss extends Greed.Enemy {
        static bosses = [];
        stage;
        constructor(_name, _enemy, _stage) {
            super(_name, _enemy);
            this.stage = _stage;
        }
        // add state machine
        addScripts() {
            if (this.stage === 5) {
                this.script = new Greed.SkeletonStateMachine();
                this.addComponent(this.script);
            }
            else {
            }
        }
    }
    Greed.Boss = Boss;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    let EnemyType;
    (function (EnemyType) {
        EnemyType["FOLLOW"] = "follow";
        EnemyType["FOLLOW_SHOOT"] = "follow_shoot";
        EnemyType["SHOOT_4"] = "shoot_4";
        EnemyType["SHOOT_2"] = "shoot_2";
        EnemyType["SHOOT_2_ROTATE"] = "shoot_2_rotate";
        EnemyType["CHARGE"] = "charge";
        EnemyType["BOSS"] = "boss";
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
        static overlay;
        activeItem;
        priceTag;
        audio;
        constructor(_name, _position, _priceTag) {
            super(_name);
            if (!ItemSlot.overlay) {
                ItemSlot.overlay = document.getElementById("item-info");
            }
            this.priceTag = _priceTag;
            this.audio = Greed.sounds.find((s) => s.getAudio().name === "Item");
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
            // collet item
            rigidBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                if (_event.cmpRigidbody.node.name === "Avatar" &&
                    this.activeItem &&
                    Greed.gameState.coins >= this.activeItem.price) {
                    if (this.name === "SlotHeart" && Greed.gameState.availableHealth === Greed.gameState.health) {
                        return;
                    }
                    this.applyNewItem();
                }
            });
            // display new item
            rigidBody.addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, (_event) => {
                if (_event.cmpRigidbody.node.name === "Avatar" && !this.activeItem) {
                    this.getItem();
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
        manualRestock() {
            // remove item from display and return to item pool
            this.removeChild(this.getChildrenByName("Sprite")[0]);
            this.priceTag.activate(false);
            ItemSlot.items.push(this.activeItem);
            this.activeItem = null;
            // get new item
            this.getItem();
        }
        applyNewItem() {
            Greed.gameState.coins -= this.activeItem.price;
            this.audio.play(true);
            this.applyItemEffects();
            // remove item from display
            this.removeChild(this.getChildrenByName("Sprite")[0]);
            this.priceTag.activate(false);
            // show item info overlay
            if (this.name !== "SlotHeart") {
                ItemSlot.overlay.children[0].children[1].innerHTML = this.activeItem.name;
                ItemSlot.overlay.children[1].innerHTML = this.activeItem.description;
                ItemSlot.overlay.style.visibility = "visible";
            }
            this.activeItem = null;
            // remove item info overlay
            new ƒ.Timer(ƒ.Time.game, 2700, 1, () => {
                ItemSlot.overlay.style.visibility = "hidden";
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
    ƒ.Project.registerScriptNamespace(Greed);
    class BasicScript extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(BasicScript);
        rigidBody;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
        hndEvent = (_event) => {
            if (_event.type === "componentAdd" /* COMPONENT_ADD */) {
                this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);
                this.addInitialBehavior();
                ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            }
            else if (_event.type === "componentRemove" /* COMPONENT_REMOVE */) {
                this.clearTimers();
                ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            }
        };
        update = () => {
            this.addBehavior();
        };
    }
    Greed.BasicScript = BasicScript;
})(Greed || (Greed = {}));
/// <reference path="./BasicScript.ts" />
var Greed;
/// <reference path="./BasicScript.ts" />
(function (Greed) {
    var ƒ = FudgeCore;
    /**
     * Script for Enemies with type CHARGE
     */
    class ChargeScript extends Greed.BasicScript {
        chargeTimer;
        constructor() {
            super();
        }
        addInitialBehavior() {
            this.charge();
            this.setupTimers();
        }
        addBehavior() { }
        clearTimers() {
            this.chargeTimer.clear();
        }
        setupTimers() {
            this.chargeTimer = new ƒ.Timer(ƒ.Time.game, 8000, 0, () => {
                this.charge();
            });
        }
        charge() {
            const vector = Greed.avatar.mtxLocal.translation.clone;
            vector.subtract(this.node.mtxLocal.translation);
            this.rigidBody.setVelocity(vector);
        }
    }
    Greed.ChargeScript = ChargeScript;
})(Greed || (Greed = {}));
/// <reference path="./BasicScript.ts" />
var Greed;
/// <reference path="./BasicScript.ts" />
(function (Greed) {
    var ƒ = FudgeCore;
    /**
     * Script for Enemies with type FOLLOW and FOLLOW_SHOOT
     */
    class FollowScript extends Greed.BasicScript {
        shotTimer;
        shoot = false;
        constructor(_shoot) {
            super();
            this.shoot = _shoot;
        }
        addInitialBehavior() {
            if (this.shoot) {
                this.setupTimers();
            }
        }
        addBehavior() {
            const vector = Greed.avatar.mtxLocal.translation.clone;
            vector.subtract(this.node.mtxLocal.translation);
            vector.normalize(0.9);
            this.rigidBody.setVelocity(vector);
        }
        clearTimers() {
            if (this.shotTimer) {
                this.shotTimer.clear();
            }
        }
        setupTimers() {
            this.shotTimer = new ƒ.Timer(ƒ.Time.game, 5000, 0, () => {
                this.addProjectile("x");
                this.addProjectile("-x");
                this.addProjectile("y");
                this.addProjectile("-y");
            });
        }
        addProjectile(_direction) {
            const projectile = new Greed.Projectile("ProjectileEnemy", _direction, this.node.mtxLocal.translation);
            Greed.graph.addChild(projectile);
            projectile.moveProjectile();
        }
    }
    Greed.FollowScript = FollowScript;
})(Greed || (Greed = {}));
/// <reference path="./BasicScript.ts" />
var Greed;
/// <reference path="./BasicScript.ts" />
(function (Greed) {
    var ƒ = FudgeCore;
    /**
     * Script for Enemies with type SHOOT2, SHOOT_2_ROTATE and SHOOT_4
     */
    class ShootScript extends Greed.BasicScript {
        shotTimer;
        movementTimer;
        sprite;
        vector = ƒ.Random.default.getVector3(new ƒ.Vector3(0.5, 0.5, 0.1), new ƒ.Vector3(-0.5, -0.5, 0.1));
        rotate = false;
        rotation = 90;
        shoot4 = false;
        constructor(_rotate, _shoot4 = false) {
            super();
            this.rotate = _rotate;
            this.shoot4 = _shoot4;
        }
        addInitialBehavior() {
            this.sprite = this.node.getChildrenByName("Sprite")[0];
            this.addProjectile("x");
            this.addProjectile("-x");
            this.setupTimers();
        }
        addBehavior() {
            this.rigidBody.setVelocity(this.vector);
        }
        clearTimers() {
            this.shotTimer.clear();
            this.movementTimer.clear();
        }
        setupTimers() {
            this.shotTimer = new ƒ.Timer(ƒ.Time.game, 2500, 0, () => {
                if (!this.shoot4) {
                    this.addProjectile(this.rotation > 0 ? "x" : "y");
                    this.addProjectile(this.rotation > 0 ? "-x" : "-y");
                }
                else {
                    this.addProjectile("x");
                    this.addProjectile("-x");
                    this.addProjectile("y");
                    this.addProjectile("-y");
                }
            });
            this.movementTimer = new ƒ.Timer(ƒ.Time.game, 4100, 0, () => {
                if (this.rotate) {
                    if (ƒ.Random.default.getBoolean()) {
                        this.sprite.mtxLocal.rotateZ(this.rotation);
                        this.rotation = this.rotation > 0 ? -90 : 90;
                    }
                }
                this.vector = ƒ.Random.default.getVector3(new ƒ.Vector3(0.5, 0.5, 0), new ƒ.Vector3(-0.5, -0.5, 0));
            });
        }
        addProjectile(_direction) {
            const projectile = new Greed.Projectile("ProjectileEnemy", _direction, this.node.mtxLocal.translation);
            Greed.graph.addChild(projectile);
            projectile.moveProjectile();
        }
    }
    Greed.ShootScript = ShootScript;
})(Greed || (Greed = {}));
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Greed); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["FOLLOW"] = 0] = "FOLLOW";
        JOB[JOB["TELEPORT"] = 1] = "TELEPORT";
        JOB[JOB["SHOOT"] = 2] = "SHOOT";
    })(JOB || (JOB = {}));
    class SkeletonStateMachine extends ƒAid.ComponentStateMachine {
        static iSubclass = ƒ.Component.registerSubclass(SkeletonStateMachine);
        static instructions = SkeletonStateMachine.get();
        rigidBody;
        cmpTransform;
        timer;
        isWorking = false;
        constructor() {
            super();
            this.instructions = SkeletonStateMachine.instructions;
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = SkeletonStateMachine.transitDefault;
            setup.setAction(JOB.FOLLOW, this.actFollow);
            setup.setAction(JOB.TELEPORT, this.actTeleport);
            setup.setAction(JOB.SHOOT, this.actShoot);
            return setup;
        }
        static transitDefault(_machine) {
            console.log("Transit to", _machine.stateNext);
        }
        static async actFollow(_machine) {
            _machine.isWorking = false;
            const vector = Greed.avatar.mtxLocal.translation.clone;
            vector.subtract(_machine.node.mtxLocal.translation);
            vector.normalize(0.85);
            _machine.rigidBody.setVelocity(vector);
        }
        static async actTeleport(_machine) {
            _machine.isWorking = true;
            _machine.node.activate(false);
            _machine.rigidBody.setVelocity(ƒ.Vector3.Z(5));
            const vector = Greed.avatar.mtxLocal.translation.clone;
            setTimeout(() => {
                _machine.rigidBody.setVelocity(ƒ.Vector3.Z(0.1));
                _machine.node.activate(true);
                _machine.cmpTransform.mtxLocal.translation = vector;
                _machine.isWorking = false;
                _machine.transit(JOB.SHOOT);
            }, 1500);
        }
        static async actShoot(_machine) {
            _machine.isWorking = true;
            _machine.rigidBody.setVelocity(new ƒ.Vector3());
            _machine.addProjectile("x");
            _machine.addProjectile("-x");
            _machine.addProjectile("y");
            _machine.addProjectile("-y");
            _machine.isWorking = false;
            _machine.transit(JOB.FOLLOW);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.cmpTransform = this.node.getComponent(ƒ.ComponentTransform);
                    this.timer = new ƒ.Timer(ƒ.Time.game, 10000, 0, () => {
                        this.transit(JOB.TELEPORT);
                    });
                    this.setSprite();
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    if (this.timer) {
                        this.timer.clear();
                    }
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    break;
            }
        };
        update = (_event) => {
            if (!this.isWorking) {
                this.act();
            }
        };
        addProjectile(_direction) {
            const projectile = new Greed.Projectile("ProjectileEnemy", _direction, this.node.mtxLocal.translation);
            Greed.graph.addChild(projectile);
            projectile.moveProjectile();
        }
        async setSprite() {
            const sprite = this.node.getChildrenByName("Sprite")[0];
            sprite.activate(false);
            const spriteInfo = {
                path: "Assets/Enemies/skeleton-crumble.png",
                name: "SkeletonCrumble",
                x: 0,
                y: 0,
                width: 32,
                height: 32,
                frames: 6,
                resolutionQuad: 32,
                offsetNext: 32,
            };
            await Greed.loadSprites(spriteInfo);
            Greed.setSprite(this.node, "SkeletonCrumble");
            const sprites = this.node.getChildrenByName("Sprite");
            sprites[1].framerate = 8;
            setTimeout(() => {
                sprites[1].activate(false);
                sprites[0].activate(true);
                this.transit(JOB.FOLLOW);
            }, 500);
        }
    }
    Greed.SkeletonStateMachine = SkeletonStateMachine;
})(Greed || (Greed = {}));
//# sourceMappingURL=Script.js.map