namespace Greed {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener>(<unknown>start));

  export let gameState: GameState;
  export let graph: ƒ.Node;
  export let sounds: ƒ.ComponentAudio[];
  export let enemiesNode: ƒ.Node;

  let viewport: ƒ.Viewport;
  let avatar: Avatar;
  let bars: ƒ.Node;
  let button: ƒ.Node;

  let doorAudio: ƒ.ComponentAudio;
  let coinAudio: ƒ.ComponentAudio;
  let stageCompleteAudio: ƒ.ComponentAudio;

  let isFighting: boolean = false;
  let stage: number = 0;
  let remainingRounds: number = 5;
  let timer: ƒ.Timer;

  const amounts = [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5];

  function init(_event: Event) {
    const dialog = document.getElementById("dialog");
    const start = document.querySelector("div.start");
    let started = false;

    start.addEventListener("click", function (_event) {
      if (!started) {
        started = true;
        start.children[0].classList.add("load");
        startInteractiveViewport();
        setTimeout(() => {
          dialog.style.display = "none";
          document.getElementById("outer").style.visibility = "visible";
        }, 1500);
      }
    });
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
    viewport.draw();
    canvas.dispatchEvent(
      new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport })
    );
  }

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    viewport.camera.mtxPivot.rotateY(180);
    graph = viewport.getBranch();
    ƒ.AudioManager.default.listenTo(graph);
    sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
    graph.addEventListener("lastEnemyKilled", hndLastEnemyKilled);
    gameState = new GameState();

    // load config
    const items: Response = await fetch("Script/Source/Config/items.json");
    const enemies: Response = await fetch("Script/Source/Config/enemies.json");
    const enemiesArray: EnemyInterface[] = (await enemies.json()).enemies;
    ItemSlot.items = (await items.json()).items;
    Enemy.enemies = enemiesArray.filter((e) => !e.isBoss);
    Boss.bosses = enemiesArray.filter((e) => e.isBoss);

    const room: ƒ.Node = graph.getChildrenByName("Room")[0];

    // assign sounds
    doorAudio = sounds.find((s) => s.getAudio().name === "Door");
    coinAudio = sounds.find((s) => s.getAudio().name === "Money");
    stageCompleteAudio = sounds.find((s) => s.getAudio().name === "StageComplete");

    // assign nodes and add nodes
    bars = room.getChildrenByName("Door")[0];
    bars.activate(false);
    button = room.getChildrenByName("Button")[0];
    avatar = new Avatar("Avatar", viewport.camera);
    graph.addChild(avatar);
    enemiesNode = room.getChildrenByName("Enemies")[0];
    room.addChild(new Timer("Timer"));

    setItemSlots();

    // button trigger listener
    button
      .getComponent(ƒ.ComponentRigidbody)
      .addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "Avatar" && !isFighting) {
          hndButtonTouched(button);
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

  function hndButtonTouched(_button: ƒ.Node): void {
    _button.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(-0.085);
    bars.activate(true);
    doorAudio.play(true);
    setTimer();
  }

  function hndLastEnemyKilled(): void {
    if (remainingRounds === 0) {
      stage++;
      stageCompleteAudio.play(true);
      bars.activate(false);
      doorAudio.play(true);
    } else {
      this.setTimer();
    }
  }

  function setTimer(): void {
    if (timer) {
      timer.clear();
    }

    isFighting = true;
    startNewRound();

    if (remainingRounds !== 0) {
      timer = new ƒ.Timer(ƒ.Time.game, stage < 4 ? 11000 : 31000, remainingRounds, () => {
        startNewRound();
      });
    }
  }

  function startNewRound(): void {
    gameState.coins += 5;
    coinAudio.play(true);
    remainingRounds--;

    if (remainingRounds === 0) {
      Timer.showFrame(30, true);
    } else {
      Timer.showFrame(stage < 4 ? 20 : 0);
    }
    createEnemies();
  }

  function createEnemies(): void {
    const enemy: EnemyInterface = ƒ.Random.default.getElement(Enemy.enemies);
    gameState.isInvincible = true;

    for (let index = 0; index < ƒ.Random.default.getElement(amounts); index++) {
      enemiesNode.addChild(new Enemy("Enemy", enemy));
    }

    setTimeout(() => {
      gameState.isInvincible = false;
    }, 1000);
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();
    avatar.controlWalk();
    avatar.controlShoot();
    viewport.draw();
  }
}
