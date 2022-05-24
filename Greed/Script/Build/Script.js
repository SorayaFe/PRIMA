"use strict";
var Greed;
(function (Greed) {
    var ƒ = FudgeCore;
    class Avatar extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.createAvatar();
        }
        createAvatar() {
            //create avatar
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
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.translate(new ƒ.Vector3(20, 30, 50));
        viewport.camera.mtxPivot.rotateY(180);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
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
System.register("Interfaces/SpriteInfo.interface", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Interfaces/Enemy.interface", [], function (exports_2, context_2) {
    "use strict";
    var EnemyType;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            (function (EnemyType) {
                EnemyType["FOLLOW"] = "follow";
                EnemyType["FOLLOW_SHOOT"] = "follow_shoot";
                EnemyType["SHOOT_4"] = "shoot_4";
                EnemyType["SHOOT_2"] = "shoot_2";
                EnemyType["AIM"] = "aim";
            })(EnemyType || (EnemyType = {}));
            exports_2("EnemyType", EnemyType);
        }
    };
});
System.register("Enemies/Enemy", [], function (exports_3, context_3) {
    "use strict";
    var ƒ, Enemy;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            ƒ = FudgeCore;
            Enemy = class Enemy extends ƒ.Node {
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
            };
            exports_3("Enemy", Enemy);
        }
    };
});
System.register("Interfaces/Item.interface", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Items/ItemSlot", [], function (exports_5, context_5) {
    "use strict";
    var ƒ, ItemSlot;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            ƒ = FudgeCore;
            ItemSlot = class ItemSlot extends ƒ.Node {
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
            };
            exports_5("ItemSlot", ItemSlot);
        }
    };
});
System.register("Items/HeartSlot", ["Items/ItemSlot"], function (exports_6, context_6) {
    "use strict";
    var ItemSlot_1, HeartSlot;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (ItemSlot_1_1) {
                ItemSlot_1 = ItemSlot_1_1;
            }
        ],
        execute: function () {
            HeartSlot = class HeartSlot extends ItemSlot_1.ItemSlot {
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
            };
            exports_6("HeartSlot", HeartSlot);
        }
    };
});
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