namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let movement: ƒ.Vector3 = new ƒ.Vector3(1 / 80, 0, 0);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    const graph: ƒ.Node = viewport.getBranch();

    pacman = graph.getChildrenByName("Pacman")[0];

    document.addEventListener("keydown", movePacman);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    pacman.mtxLocal.translate(movement);

    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function movePacman(_event: KeyboardEvent) {
    switch (_event.code) {
      case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
        movement = new ƒ.Vector3(1 / 80, 0, 0);
        break;
      case ƒ.KEYBOARD_CODE.ARROW_DOWN:
        movement = new ƒ.Vector3(0, -1 / 80, 0);
        break;
      case ƒ.KEYBOARD_CODE.ARROW_LEFT:
        movement = new ƒ.Vector3(-1 / 80, 0, 0);
        break;
      case ƒ.KEYBOARD_CODE.ARROW_UP:
        movement = new ƒ.Vector3(0, 1 / 80, 0);
        break;
      default:
        break;
    }
  }
}
