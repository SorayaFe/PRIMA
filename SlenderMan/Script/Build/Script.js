"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class DropToGroundInitial extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(DropToGroundInitial);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            document.addEventListener("interactiveViewportStarted", this.setPosition);
        }
        setPosition = () => {
            const graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"];
            const ground = graph
                .getChildrenByName("Environment")[0]
                .getChildrenByName("Ground")[0];
            const cmpMeshTerrain = ground.getComponent(ƒ.ComponentMesh);
            const meshTerrain = cmpMeshTerrain.mesh;
            const distance = meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, cmpMeshTerrain.mtxWorld).distance;
            this.node.mtxLocal.translateY(-distance);
        };
    }
    Script.DropToGroundInitial = DropToGroundInitial;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class DropToGroundMove extends ƒ.ComponentScript {
        static graph;
        static ground;
        static cmpMeshTerrain;
        static meshTerrain;
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(DropToGroundMove);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.addComponent);
        }
        addComponent = () => {
            this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.setPosition);
        };
        setPosition = () => {
            if (!DropToGroundMove.graph) {
                DropToGroundMove.graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"];
                DropToGroundMove.ground = DropToGroundMove.graph
                    .getChildrenByName("Environment")[0]
                    .getChildrenByName("Ground")[0];
                DropToGroundMove.cmpMeshTerrain = DropToGroundMove.ground.getComponent(ƒ.ComponentMesh);
                DropToGroundMove.meshTerrain = DropToGroundMove.cmpMeshTerrain.mesh;
            }
            const distance = DropToGroundMove.meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, DropToGroundMove.cmpMeshTerrain.mtxWorld)?.distance;
            if (distance) {
                this.node.mtxLocal.translateY(-distance);
            }
        };
    }
    Script.DropToGroundMove = DropToGroundMove;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let avatar;
    let camera;
    const speedRotY = -0.1;
    const speedRotX = 0.2;
    let rotationX = 0;
    let cntrWalk = new ƒ.Control("cntrWalk", 2, 0 /* PROPORTIONAL */, 300);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
        camera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
        viewport.camera = camera;
        let canvas = viewport.getCanvas();
        canvas.addEventListener("pointermove", hndPointerMove);
        canvas.requestPointerLock();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        controlWalk();
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function hndPointerMove(_event) {
        avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
        rotationX += _event.movementY * speedRotX;
        rotationX = Math.min(60, Math.max(-60, rotationX));
        camera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    }
    function controlWalk() {
        let input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
        cntrWalk.setInput(input);
        cntrWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 6 : 2);
        let input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
        avatar.mtxLocal.translateZ((cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 1000);
        avatar.mtxLocal.translateX((1.5 * input2 * ƒ.Loop.timeFrameGame) / 1000);
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class MoveSlenderMan extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(MoveSlenderMan);
        // Properties may be mutated by users in the editor via the automatically created user interface
        time = 0;
        movement = new ƒ.Vector3();
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.addComponent);
        }
        addComponent = () => {
            this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.move);
        };
        move = () => {
            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.movement, ƒ.Loop.timeFrameGame / 1000));
            if (this.time > ƒ.Time.game.get()) {
                return;
            }
            this.time = ƒ.Time.game.get() + 1000;
            this.movement = ƒ.Random.default.getVector3(new ƒ.Vector3(-1, 0 - 1), new ƒ.Vector3(1, 0, 1));
        };
    }
    Script.MoveSlenderMan = MoveSlenderMan;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map