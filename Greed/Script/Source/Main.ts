namespace Greed {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;
  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener>(<unknown>start));

  export let gameState: GameState;
  export let graph: ƒ.Node;

  let viewport: ƒ.Viewport;
  let avatar: Avatar;
  let bars: ƒ.Node;
  let button: ƒ.Node;

  let isFighting: boolean = false;
  //let stage: number = 0;
  let remainingRounds: number = 4;
  let timer: ƒ.Timer;

  function init(_event: Event) {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
      document.getElementById("outer").style.visibility = "visible";
      startInteractiveViewport();
    });
    //@ts-ignore
    dialog.showModal();
  }

  async function startInteractiveViewport() {
    await FudgeCore.Project.loadResourcesFromHTML();
    FudgeCore.Debug.log("Project:", FudgeCore.Project.resources);
    const graph: ƒ.Graph = FudgeCore.Project.resources[
      "Graph|2022-05-24T16:14:09.425Z|32411"
    ] as ƒ.Graph;
    if (!graph) {
      alert(
        "Nothing to render. Create a graph with at least a mesh, material and probably some light"
      );
      return;
    }

    const cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    //TODO
    //canvas.requestPointerLock();
    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    //TODO
    // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
    viewport.draw();
    canvas.dispatchEvent(
      new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport })
    );
  }

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    viewport.camera.mtxPivot.rotateY(180);
    graph = viewport.getBranch();

    // load config
    const items: Response = await fetch("Script/Source/Config/items.json");
    const enemies: Response = await fetch("Script/Source/Config/enemies.json");
    const enemiesArray: EnemyInterface[] = (await enemies.json()).enemies;
    ItemSlot.items = (await items.json()).items;
    Enemy.enemies = enemiesArray.filter((e) => !e.isBoss);
    Boss.bosses = enemiesArray.filter((e) => e.isBoss);

    gameState = new GameState();
    const room: ƒ.Node = graph.getChildrenByName("Room")[0];

    // assign variables and add nodes
    bars = room.getChildrenByName("Door")[0];
    bars.activate(false);
    button = room.getChildrenByName("Button")[0];
    avatar = new Avatar("Avatar", viewport.camera);
    graph.addChild(avatar);
    room.addChild(new Timer("Timer"));

    setItemSlots();

    // button trigger listener
    button
      .getComponent(ƒ.ComponentRigidbody)
      .addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "Avatar" && !isFighting) {
          button.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(-0.085);
          bars.activate(true);
          setTimer();
        }
      });

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }

  function setItemSlots(): void {
    const itemSlots = graph.getChildrenByName("Shop")[0].getChildrenByName("ItemSlots")[0];
    const priceTag1 = new PriceTag("PriceTag1", new ƒ.Vector3(3, 24.3, 0.1));
    itemSlots.addChild(priceTag1);
    const priceTag2 = new PriceTag("PriceTag2", new ƒ.Vector3(6, 24.3, 0.1));
    itemSlots.addChild(priceTag2);
    const priceTag3 = new PriceTag("PriceTag3", new ƒ.Vector3(9, 24.3, 0.1));
    itemSlots.addChild(priceTag3);
    const priceTag4 = new PriceTag("PriceTag4", new ƒ.Vector3(12, 24.3, 0.1));
    itemSlots.addChild(priceTag4);
    itemSlots.addChild(new ItemSlot("Slot1", new ƒ.Vector3(3, 25, 0.1), priceTag1));
    itemSlots.addChild(new ItemSlot("Slot2", new ƒ.Vector3(6, 25, 0.1), priceTag2));
    itemSlots.addChild(new HeartSlot("SlotHeart", new ƒ.Vector3(12, 25, 0.1), priceTag4));
    itemSlots.addChild(new ItemSlot("Slot3", new ƒ.Vector3(9, 25, 0.1), priceTag3));
  }

  function setTimer(): void {
    if (timer) {
      timer.clear();
    }

    isFighting = true;
    startNewRound();

    timer = new ƒ.Timer(ƒ.Time.game, 11000, remainingRounds, () => {
      startNewRound();
    });
  }

  function startNewRound(): void {
    console.log("new round started");
    remainingRounds--;
    Timer.showFrame(20);
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();
    avatar.controlWalk();
    avatar.controlShoot();
    viewport.draw();
  }
}
