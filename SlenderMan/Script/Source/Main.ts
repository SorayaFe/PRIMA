namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  interface Config {
    drain: number;
  }

  let viewport: ƒ.Viewport;
  export let avatar: ƒ.Node;
  let camera: ƒ.ComponentCamera;
  let graph: ƒ.Node;
  let light: ƒ.ComponentLight;

  const speedRotY: number = -0.1;
  const speedRotX: number = 0.2;
  let rotationX: number = 0;
  let cntrWalk: ƒ.Control = new ƒ.Control("cntrWalk", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 300);

  let gameState: GameState;
  let config: Config;

  document.addEventListener("interactiveViewportStarted", <EventListener>(<unknown>start));

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    graph = viewport.getBranch();
    avatar = graph.getChildrenByName("Avatar")[0];
    camera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
    light = avatar.getChildrenByName("Flashlight")[0].getComponent(ƒ.ComponentLight);
    viewport.camera = camera;

    avatar.getComponent(ƒ.ComponentRigidbody).effectRotation = new ƒ.Vector3(0, 0, 0);

    let canvas: HTMLCanvasElement = viewport.getCanvas();
    canvas.addEventListener("pointermove", hndPointerMove);
    canvas.requestPointerLock();

    canvas.addEventListener("click", hndClick);
    graph.addEventListener("enterSlender", hndEnterSlender);

    addTrees();

    gameState = new GameState();

    const response: Response = await fetch("config.json");
    config = await response.json();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate(); // if physics is included and used
    controlWalk();

    if (light.isActive) {
      gameState.battery -= config.drain;
    }

    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function hndPointerMove(_event: PointerEvent): void {
    // variante ohne physics

    // avatar.mtxLocal.rotateY(_event.movementX * speedRotY);

    // variante mit physics
    avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY));

    rotationX += _event.movementY * speedRotX;
    rotationX = Math.min(60, Math.max(-60, rotationX));
    camera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
  }

  function hndClick(_event: MouseEvent): void {
    if (_event.button === 2 && gameState.battery > 0) {
      light.activate(!light.isActive);
    }
  }

  function hndEnterSlender(_event: Event): void {
    const overlay = document.getElementById("overlay");

    overlay.style.boxShadow = "inset white 0px 0px 300px 200px";

    new ƒ.Timer(ƒ.Time.game, 5000, 1, () => {
      window.location.reload();
    });
  }

  function controlWalk(): void {
    const input: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP],
      [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]
    );

    cntrWalk.setInput(input);
    cntrWalk.setFactor(
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) && gameState.stamina > 0 ? 5 : 2
    );

    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) && input) {
      gameState.stamina -= 0.001;
    }

    const input2: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT],
      [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]
    );

    // variante mit physics

    const vector = new ƒ.Vector3(
      (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20,
      0,
      (cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 20
    );

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
    const trees: ƒ.Node = graph.getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];

    for (let index = 0; index < 100; index++) {
      const position = ƒ.Random.default.getVector3(
        new ƒ.Vector3(29, 0, 29),
        new ƒ.Vector3(-29, 0, -29)
      );
      const roundedPosition = new ƒ.Vector3(
        Math.round(position.x),
        Math.round(position.y),
        Math.round(position.z)
      );

      if (!Tree.takenPositions.find((p) => p.equals(roundedPosition))) {
        trees.addChild(new Tree("Tree", roundedPosition));
      }
    }
  }
}
