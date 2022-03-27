"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
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
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let pacman;
    let walls;
    let paths;
    let movingDirection = "y";
    let movement = new ƒ.Vector3(0, 1 / 60, 0);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        const graph = viewport.getBranch();
        pacman = graph.getChildrenByName("Pacman")[0];
        walls = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
        paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        movePacman();
        if (checkIfMove()) {
            pacman.mtxLocal.translate(movement);
        }
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function movePacman() {
        if (ƒ.Keyboard.isPressedOne([
            ƒ.KEYBOARD_CODE.ARROW_RIGHT,
            ƒ.KEYBOARD_CODE.D,
        ]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkIfMove("x")) {
                movement.set(1 / 60, 0, 0);
                movingDirection = "x";
            }
        }
        if (ƒ.Keyboard.isPressedOne([
            ƒ.KEYBOARD_CODE.ARROW_DOWN,
            ƒ.KEYBOARD_CODE.S,
        ]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkIfMove("-y")) {
                movement.set(0, -1 / 60, 0);
                movingDirection = "-y";
            }
        }
        if (ƒ.Keyboard.isPressedOne([
            ƒ.KEYBOARD_CODE.ARROW_LEFT,
            ƒ.KEYBOARD_CODE.A,
        ]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkIfMove("-x")) {
                movement.set(-1 / 60, 0, 0);
                movingDirection = "-x";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkIfMove("y")) {
                movement.set(0, 1 / 60, 0);
                movingDirection = "y";
            }
        }
    }
    function checkIfMove(_direction) {
        const y = pacman.mtxLocal.translation.y;
        const x = pacman.mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? movingDirection) {
            case "x":
                newPosition = new ƒ.Vector3(x + 1, y, 0);
                break;
            case "-x":
                newPosition = new ƒ.Vector3(x - 1, y, 0);
                break;
            case "y":
                newPosition = new ƒ.Vector3(x, y + 1, 0);
                break;
            case "-y":
                newPosition = new ƒ.Vector3(x, y - 1, 0);
                break;
            default:
                break;
        }
        const wall = walls.find((w) => w.mtxLocal.translation.equals(newPosition, 0.022));
        if (wall) {
            return false;
        }
        const path = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 1));
        return path ? true : false;
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map