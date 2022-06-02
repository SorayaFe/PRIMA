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

  function init(_event: Event) {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
      document.getElementById("vui").style.visibility = "visible";
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
    bars = room.getChildrenByName("Door")[0].getChild(0);
    bars.activate(false);
    avatar = new Avatar("Avatar", viewport.camera);
    graph.addChild(avatar);
    const itemSlots = graph.getChildrenByName("Shop")[0].getChildrenByName("ItemSlots")[0];
    itemSlots.addChild(new ItemSlot("Slot1", new ƒ.Vector3(3, 25, 0.1)));
    itemSlots.addChild(new ItemSlot("Slot2", new ƒ.Vector3(6, 25, 0.1)));
    itemSlots.addChild(new ItemSlot("Slot3", new ƒ.Vector3(9, 25, 0.1)));
    itemSlots.addChild(new ItemSlot("Heart", new ƒ.Vector3(12, 25, 0.1)));

    // button trigger listener
    const button: ƒ.Node = room.getChildrenByName("Button")[0];
    button
      .getComponent(ƒ.ComponentRigidbody)
      .addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name == "Avatar") {
          hndButtonTrigger(button);
        }
      });

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();
    avatar.controlWalk();
    avatar.controlShoot();
    viewport.draw();
  }

  function hndButtonTrigger(_buttonNode: ƒ.Node): void {
    _buttonNode.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(-0.085);
    bars.activate(true);
  }
}
