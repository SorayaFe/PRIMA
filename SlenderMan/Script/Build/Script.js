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
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.add);
        }
        add = () => {
            const graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"];
            if (graph) {
                this.setPosition();
            }
            else {
                document.addEventListener("interactiveViewportStarted", this.setPosition);
            }
        };
        setPosition = () => {
            const graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"];
            const ground = graph
                .getChildrenByName("Environment")[0]
                .getChildrenByName("Ground")[0];
            const cmpMeshTerrain = ground.getComponent(ƒ.ComponentMesh);
            const meshTerrain = cmpMeshTerrain.mesh;
            const distance = meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, cmpMeshTerrain.mtxWorld)?.distance;
            if (distance) {
                this.node.mtxLocal.translateY(-distance);
            }
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
            let distance = 0;
            if (this.node.getComponent(ƒ.ComponentRigidbody)) {
                distance = DropToGroundMove.meshTerrain.getTerrainInfo(this.node.getComponent(ƒ.ComponentRigidbody).getPosition(), DropToGroundMove.cmpMeshTerrain.mtxWorld)?.distance;
            }
            else {
                distance = DropToGroundMove.meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, DropToGroundMove.cmpMeshTerrain.mtxWorld)?.distance;
            }
            if (distance) {
                if (this.node.getComponent(ƒ.ComponentRigidbody)) {
                    this.node
                        .getComponent(ƒ.ComponentRigidbody)
                        .translateBody(new ƒ.Vector3(0, -distance, 0));
                }
                else {
                    this.node.mtxLocal.translateY(-distance);
                }
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
    let graph;
    const speedRotY = -0.1;
    const speedRotX = 0.2;
    let rotationX = 0;
    let cntrWalk = new ƒ.Control("cntrWalk", 2, 0 /* PROPORTIONAL */, 300);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        graph = viewport.getBranch();
        avatar = graph.getChildrenByName("Avatar")[0];
        camera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
        viewport.camera = camera;
        avatar.getComponent(ƒ.ComponentRigidbody).effectRotation = new ƒ.Vector3(0, 0, 0);
        let canvas = viewport.getCanvas();
        canvas.addEventListener("pointermove", hndPointerMove);
        canvas.requestPointerLock();
        addTrees();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        controlWalk();
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function hndPointerMove(_event) {
        // variante ohne physics
        // avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
        // variante mit physics
        avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY));
        rotationX += _event.movementY * speedRotX;
        rotationX = Math.min(60, Math.max(-60, rotationX));
        camera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    }
    function controlWalk() {
        const input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
        cntrWalk.setInput(input);
        cntrWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 5 : 2);
        const input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
        // variante mit physics
        const vector = new ƒ.Vector3((1.5 * input2 * ƒ.Loop.timeFrameGame) / 20, 0, (cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 20);
        vector.transform(avatar.mtxLocal, false);
        avatar.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);
        // funktioniert auch
        // avatar
        //   .getComponent(ƒ.ComponentRigidbody)
        //   .setVelocity(
        //     ƒ.Vector3.SCALE(avatar.mtxLocal.getZ(), (cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 20)
        //   );
        // funktioniert nicht wenn man sich dreht
        // avatar
        //   .getComponent(ƒ.ComponentRigidbody)
        //   .setVelocity(
        //     new ƒ.Vector3(
        //       (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20,
        //       0,
        //       (cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 20
        //     )
        //   );
        // variante ohne physics
        // avatar.mtxLocal.translateZ((cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 1000);
        // avatar.mtxLocal.translateX((1.5 * input2 * ƒ.Loop.timeFrameGame) / 1000);
    }
    function addTrees() {
        const trees = graph.getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];
        for (let index = 0; index < 100; index++) {
            const position = ƒ.Random.default.getVector3(new ƒ.Vector3(29, 0, 29), new ƒ.Vector3(-29, 0, -29));
            const roundedPosition = new ƒ.Vector3(Math.round(position.x), Math.round(position.y), Math.round(position.z));
            if (!Script.Tree.takenPositions.find((p) => p.equals(roundedPosition))) {
                trees.addChild(new Script.Tree("Tree", roundedPosition));
            }
        }
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
            this.movement = ƒ.Random.default.getVector3(new ƒ.Vector3(-0, 0, -1), new ƒ.Vector3(1, 0, 1));
        };
    }
    Script.MoveSlenderMan = MoveSlenderMan;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Tree extends ƒ.Node {
        static takenPositions = [
            new ƒ.Vector3(0, 0, 0),
            new ƒ.Vector3(1, 0, 0),
            new ƒ.Vector3(1, 0, 1),
            new ƒ.Vector3(0, 0, 1),
            new ƒ.Vector3(-1, 0, 0),
            new ƒ.Vector3(0, 0, -1),
            new ƒ.Vector3(-1, 0, 1),
            new ƒ.Vector3(1, 0, -1),
            new ƒ.Vector3(-1, 0, -1),
        ];
        constructor(_name, _position) {
            super(_name);
            const cmpTransform = new ƒ.ComponentTransform();
            Tree.takenPositions.push(_position);
            Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z + 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z - 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z + 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z - 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x, _position.y, _position.z - 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x, _position.y, _position.z + 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z));
            this.addComponent(cmpTransform);
            this.mtxLocal.translation = _position;
            this.addComponent(new Script.DropToGroundInitial());
            this.addGraph();
        }
        async addGraph() {
            const treeGraph = await ƒ.Project.createGraphInstance(ƒ.Project.resources["Graph|2022-04-26T14:53:15.560Z|71402"]);
            this.addChild(treeGraph);
        }
    }
    Script.Tree = Tree;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map