namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;

  window.addEventListener("load", init);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let walls: ƒ.Node[];
  let paths: ƒ.Node[];

  let sounds: ƒ.ComponentAudio[];

  let movingDirection: string = "y";
  let movement: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

  function init(_event: Event): void {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event: Event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
      startInteractiveViewport();
    });
    // @ts-ignore
    dialog.showModal();
  }

  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", ƒ.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = ƒ.Project.resources["Graph|2022-03-17T14:08:08.737Z|08207"] as ƒ.Graph;
    ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert(
        "Nothing to render. Create a graph with at least a mesh, material and probably some light"
      );
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒ.Debug.log("Viewport:", viewport);

    viewport.draw();
    canvas.dispatchEvent(
      new CustomEvent("interactiveViewportStarted", {
        bubbles: true,
        detail: viewport,
      })
    );
  }

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(2.5, 2.5, 15));
    viewport.camera.mtxPivot.rotateY(180);

    const graph: ƒ.Node = viewport.getBranch();

    ƒ.AudioManager.default.listenTo(graph);

    sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);

    pacman = graph.getChildrenByName("Pacman")[0];
    walls = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
    paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
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

  function movePacman(): void {
    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("x")) {
        movement.set(1 / 60, 0, 0);
        movingDirection = "x";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("-y")) {
        movement.set(0, -1 / 60, 0);
        movingDirection = "-y";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("-x")) {
        movement.set(-1 / 60, 0, 0);
        movingDirection = "-x";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("y")) {
        movement.set(0, 1 / 60, 0);
        movingDirection = "y";
      }
    }
  }

  function checkIfMove(_direction?: string): boolean {
    const y: number = pacman.mtxLocal.translation.y;
    const x: number = pacman.mtxLocal.translation.x;
    let newPosition: ƒ.Vector3;

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

    const wall: ƒ.Node = walls.find((w) => w.mtxLocal.translation.equals(newPosition, 0.022));

    if (wall) {
      sounds[1].play(false);
      return false;
    }

    const path: ƒ.Node = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 1));

    if (!path) {
      sounds[1].play(false);
      return false;
    }

    return true;
  }
}
