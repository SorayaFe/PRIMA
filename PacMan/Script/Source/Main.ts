namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let movement: ƒ.Vector3 = new ƒ.Vector3(1 / 60, 0, 0);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    const graph: ƒ.Node = viewport.getBranch();

    pacman = graph.getChildrenByName("Pacman")[0];

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    movePacman();

    pacman.mtxLocal.translate(movement);

    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function movePacman() {
    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_RIGHT,
        ƒ.KEYBOARD_CODE.D,
      ]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      movement.set(1 / 60, 0, 0);
    }

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_DOWN,
        ƒ.KEYBOARD_CODE.S,
      ]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      movement.set(0, -1 / 60, 0);
    }

    if (
      ƒ.Keyboard.isPressedOne([
        ƒ.KEYBOARD_CODE.ARROW_LEFT,
        ƒ.KEYBOARD_CODE.A,
      ]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      movement.set(-1 / 60, 0, 0);
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      movement.set(0, 1 / 60, 0);
    }
  }
}
