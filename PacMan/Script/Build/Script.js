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
    let dialog;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let viewport;
    let pacman;
    let walls;
    let paths;
    let sounds;
    Script.movingDirection = "y";
    let movement = new ƒ.Vector3(0, 0, 0);
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        // @ts-ignore
        dialog.showModal();
    }
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources["Graph|2022-03-17T14:08:08.737Z|08207"];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", viewport);
        await Script.loadSprites();
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {
            bubbles: true,
            detail: viewport,
        }));
    }
    function start(_event) {
        viewport = _event.detail;
        viewport.camera.mtxPivot.translate(new ƒ.Vector3(2.5, 2.5, 15));
        viewport.camera.mtxPivot.rotateY(180);
        const graph = viewport.getBranch();
        ƒ.AudioManager.default.listenTo(graph);
        sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
        pacman = graph.getChildrenByName("Pacman")[0];
        walls = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
        paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();
        Script.setSprite(pacman);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        movePacman();
        if (checkIfMove()) {
            if (!sounds[1].isPlaying && !movement.equals(new ƒ.Vector3(0, 0, 0))) {
                sounds[1].play(true);
            }
            pacman.mtxLocal.translate(movement);
        }
        viewport.draw();
    }
    function movePacman() {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkIfMove("x")) {
                movement.set(1 / 60, 0, 0);
                Script.rotateSprite("x");
                Script.movingDirection = "x";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkIfMove("-y")) {
                movement.set(0, -1 / 60, 0);
                Script.rotateSprite("-y");
                Script.movingDirection = "-y";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkIfMove("-x")) {
                movement.set(-1 / 60, 0, 0);
                Script.rotateSprite("-x");
                Script.movingDirection = "-x";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkIfMove("y")) {
                movement.set(0, 1 / 60, 0);
                Script.rotateSprite("y");
                Script.movingDirection = "y";
            }
        }
    }
    function checkIfMove(_direction) {
        const y = pacman.mtxLocal.translation.y;
        const x = pacman.mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? Script.movingDirection) {
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
            sounds[1].play(false);
            return false;
        }
        const path = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 1));
        if (!path) {
            sounds[1].play(false);
            return false;
        }
        return true;
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒAid = FudgeAid;
    let animations;
    let spritePacman;
    async function loadSprites() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("Assets/pacman-sprites.png");
        let spriteSheet = new ƒ.CoatTextured(undefined, imgSpriteSheet);
        generateSprites(spriteSheet);
    }
    Script.loadSprites = loadSprites;
    function generateSprites(_spritesheet) {
        animations = {};
        let name = "pacman";
        let sprite = new ƒAid.SpriteSheetAnimation(name, _spritesheet);
        sprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 8, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
        animations[name] = sprite;
    }
    function setSprite(_node) {
        spritePacman = new ƒAid.NodeSprite("Sprite");
        spritePacman.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spritePacman.setAnimation(animations["pacman"]);
        spritePacman.setFrameDirection(1);
        spritePacman.mtxLocal.translateZ(0.5);
        spritePacman.framerate = 15;
        _node.addChild(spritePacman);
        _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        spritePacman.mtxLocal.rotateZ(90);
    }
    Script.setSprite = setSprite;
    function rotateSprite(_direction) {
        if (_direction !== Script.movingDirection) {
            spritePacman.mtxLocal.rotateZ(0);
            if ((_direction === "x" && Script.movingDirection === "y") ||
                (_direction === "-y" && Script.movingDirection === "x") ||
                (_direction === "-x" && Script.movingDirection === "-y") ||
                (_direction === "y" && Script.movingDirection === "-x")) {
                spritePacman.mtxLocal.rotateZ(-90);
            }
            else if ((_direction === "-x" && Script.movingDirection === "y") ||
                (_direction === "x" && Script.movingDirection === "-y") ||
                (_direction === "y" && Script.movingDirection === "x") ||
                (_direction === "-y" && Script.movingDirection === "-x")) {
                spritePacman.mtxLocal.rotateZ(90);
            }
            else if ((_direction === "-x" && Script.movingDirection === "x") ||
                (_direction === "x" && Script.movingDirection === "-x") ||
                (_direction === "y" && Script.movingDirection === "-y") ||
                (_direction === "-y" && Script.movingDirection === "y")) {
                spritePacman.mtxLocal.rotateZ(180);
            }
        }
    }
    Script.rotateSprite = rotateSprite;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map