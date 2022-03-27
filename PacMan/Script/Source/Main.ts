namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let walls: ƒ.Node[];
  let paths: ƒ.Node[];

  let movingDirection: string = "y";
  let movement: ƒ.Vector3 = new ƒ.Vector3(0, 1 / 60, 0);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    const graph: ƒ.Node = viewport.getBranch();

    pacman = graph.getChildrenByName("Pacman")[0];
    walls = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
    paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    movePacman();

    if (checkIfMove()) {
      pacman.mtxLocal.translate(movement);
    }

    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function movePacman(): void {
    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_RIGHT,
        ƒ.KEYBOARD_CODE.D,
      ]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("x")) {
        movement.set(1 / 60, 0, 0);
        movingDirection = "x";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_DOWN,
        ƒ.KEYBOARD_CODE.S,
      ]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("-y")) {
        movement.set(0, -1 / 60, 0);
        movingDirection = "-y";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_LEFT,
        ƒ.KEYBOARD_CODE.A,
      ]) &&
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
    const y = pacman.mtxLocal.translation.y;
    const x = pacman.mtxLocal.translation.x;
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

    const wall = walls.find((w) =>
      w.mtxLocal.translation.equals(newPosition, 0.022)
    );

    if (wall) {
      return false;
    }

    const path = paths.find((p) =>
      p.mtxLocal.translation.equals(newPosition, 1)
    );

    return path ? true : false;
  }
}
