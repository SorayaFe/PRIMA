namespace Greed {
  import ƒ = FudgeCore;

  ƒ.Debug.info("Main Program Template running!");

  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener>(<unknown>start));

  export let gameState: GameState;
  export let graph: ƒ.Node;
  export let avatar: Avatar;
  export let sounds: ƒ.ComponentAudio[];
  export let enemiesNode: ƒ.Node;

  let viewport: ƒ.Viewport;
  let bars: ƒ.Node;
  let button: ƒ.Node;

  // audio
  let doorAudio: ƒ.ComponentAudio;
  let coinAudio: ƒ.ComponentAudio;
  let addEnemiesAudio: ƒ.ComponentAudio;
  let restockAudio: ƒ.ComponentAudio;
  let coinSlotAudio: ƒ.ComponentAudio;
  let victoryAudio: ƒ.ComponentAudio;

  // parameters needed for game logic
  let isFighting: boolean = false;
  let timer: ƒ.Timer;
  let hasCursedLight: boolean = false;

  // array to pick random enemy amount from
  const amounts = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5];

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
        }, 3000);
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
    graph.addEventListener("touchedAvatar", hndAvatarTouched);
    gameState = new GameState();

    // load config
    const items: Response = await fetch("Script/Source/Config/items.json");
    const enemies: Response = await fetch("Script/Source/Config/enemies.json");
    const enemiesArray: EnemyInterface[] = (await enemies.json()).enemies;
    ItemSlot.items = (await items.json()).items;
    Enemy.enemies = enemiesArray.filter((e) => e.type !== EnemyType.BOSS);
    Boss.bosses = enemiesArray.filter((e) => e.type === EnemyType.BOSS);

    // assign sounds
    doorAudio = sounds.find((s) => s.getAudio().name === "Door");
    coinAudio = sounds.find((s) => s.getAudio().name === "Money");
    addEnemiesAudio = sounds.find((s) => s.getAudio().name === "EnemyAdd");
    restockAudio = sounds.find((s) => s.getAudio().name === "Restock");
    coinSlotAudio = sounds.find((s) => s.getAudio().name === "CoinSlot");
    victoryAudio = sounds.find((s) => s.getAudio().name === "Victory");

    const room: ƒ.Node = graph.getChildrenByName("Room")[0];

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
        if (_event.cmpRigidbody.node.name === "Avatar" && !isFighting && gameState.stage < 7) {
          hndButtonTouched();
        }
      });

    // restock  listener
    graph
      .getChildrenByName("Shop")[0]
      .getChildrenByName("Restock")[0]
      .getComponent(ƒ.ComponentRigidbody)
      .addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "Avatar" && gameState.coins > 0) {
          hndRestock();
        }
      });

    // hardcore mode
    if (sessionStorage.getItem("hardcore") === "true") {
      gameState.availableHealth = 1;
      gameState.health = 1;
      gameState.updateHealth();
    }

    // cursed light
    if (sessionStorage.getItem("cursed") === "true") {
      setCursedLight();
    }

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }

  // add item slots to game
  async function setItemSlots(): Promise<void> {
    const itemSlots = graph.getChildrenByName("Shop")[0].getChildrenByName("ItemSlots")[0];
    const priceTag1 = new PriceTag("PriceTag");
    await priceTag1.createPriceTag(new ƒ.Vector3(3, 23.3, 0.1));
    itemSlots.addChild(priceTag1);
    const priceTag2 = new PriceTag("PriceTag");
    await priceTag2.createPriceTag(new ƒ.Vector3(6, 23.3, 0.1));
    itemSlots.addChild(priceTag2);
    const priceTag3 = new PriceTag("PriceTag");
    await priceTag3.createPriceTag(new ƒ.Vector3(9, 23.3, 0.1));
    itemSlots.addChild(priceTag3);
    const priceTag4 = new PriceTag("PriceTag");
    await priceTag4.createPriceTag(new ƒ.Vector3(12, 23.3, 0.1));
    itemSlots.addChild(priceTag4);
    itemSlots.addChild(new ItemSlot("Slot", new ƒ.Vector3(3, 24, 0.1), priceTag1));
    itemSlots.addChild(new ItemSlot("Slot", new ƒ.Vector3(6, 24, 0.1), priceTag2));
    itemSlots.addChild(new ItemSlot("Slot", new ƒ.Vector3(9, 24, 0.1), priceTag3));
    itemSlots.addChild(new HeartSlot("SlotHeart", new ƒ.Vector3(12, 24, 0.1), priceTag4));
  }

  // restock items when touching restock machine
  function hndRestock(): void {
    const itemSlots = graph
      .getChildrenByName("Shop")[0]
      .getChildrenByName("ItemSlots")[0]
      .getChildrenByName("Slot") as ItemSlot[];

    gameState.coins -= 1;
    coinSlotAudio.play(true);
    restockAudio.play(true);

    itemSlots.map((s) => s.manualRestock());
  }

  // set timer, start round, close door when button touched
  function hndButtonTouched(): void {
    button.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(-0.085);
    bars.activate(true);
    doorAudio.play(true);
    setTimer();
  }

  // end round or start next round if last enemy was killed
  function hndLastEnemyKilled(): void {
    if (gameState.stage === 6 && gameState.remainingRounds === 0) {
      showOverlay(true);
    }
    if (gameState.remainingRounds === 0) {
      gameState.stage++;
      bars.activate(false);
      doorAudio.play(true);
      Timer.showFrame(30, true);
      button.getComponent(ƒ.ComponentMaterial).mtxPivot.translateX(0.085);
      isFighting = false;
      gameState.remainingRounds = gameState.stage <= 5 ? 5 : 2;
    } else {
      setTimer();
    }
  }

  // set new timer for round
  function setTimer(): void {
    if (timer) {
      timer.clear();
    }

    isFighting = true;
    startNewRound();

    if (gameState.remainingRounds !== 0) {
      timer = new ƒ.Timer(
        ƒ.Time.game,
        gameState.stage < 6 ? 11000 : 31000,
        gameState.remainingRounds,
        () => {
          startNewRound();
        }
      );
    }
  }

  // start a new round
  function startNewRound(): void {
    gameState.coins += 5;
    coinAudio.play(true);
    gameState.remainingRounds--;

    if (gameState.remainingRounds === 0) {
      Timer.showFrame(30, true);
    } else {
      Timer.showFrame(gameState.stage < 6 ? 20 : 0);
    }

    createEnemies(gameState.stage >= 6);
  }

  // add enemies to the game
  function createEnemies(_isBoss: boolean): void {
    const enemy: EnemyInterface = _isBoss
      ? Boss.bosses[gameState.remainingRounds === 1 ? 0 : 1]
      : ƒ.Random.default.getElement(Enemy.enemies);
    gameState.isInvincible = true;
    addEnemiesAudio.play(true);

    if (_isBoss) {
      enemiesNode.addChild(new Boss("Enemy", enemy, gameState.remainingRounds));
    } else {
      for (let index = 0; index < ƒ.Random.default.getElement(amounts); index++) {
        enemiesNode.addChild(new Enemy("Enemy", enemy));
      }
    }

    setTimeout(() => {
      gameState.isInvincible = false;
    }, 2000);
  }

  // trigger avatar hit on hndAvatarTouched event
  function hndAvatarTouched(): void {
    if (!gameState.isInvincible) {
      avatar.hndHit();
    }
  }

  // show game over / victory
  export function showOverlay(won: boolean): void {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
      ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, update);
      if (timer) {
        timer.clear();
      }

      overlay.children[0].children[0].innerHTML = won ? "VICTORY!" : "GAME OVER!";
      (overlay as any).style.width = "100%";
      (overlay as any).style.height = "100%";

      if (won) {
        const confetti = document.createElement("img");
        confetti.setAttribute("src", "Assets/confetti.gif");
        confetti.setAttribute("id", "confetti");
        overlay.appendChild(confetti);

        setTimeout(() => {
          victoryAudio.play(true);
        }, 200);
      }
    }
  }

  // set cursed light if item collected of sessionStorage cursed == true
  export function setCursedLight(): void {
    if (!hasCursedLight) {
      graph.getComponent(ƒ.ComponentLight).light.color = ƒ.Color.CSS("#2e2e2e");
      const light: ƒ.Light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
      const componentLight: ƒ.ComponentLight = new ƒ.ComponentLight(light);
      componentLight.mtxPivot.scale(new ƒ.Vector3(30, 30, 30));
      avatar.addComponent(componentLight);

      hasCursedLight = true;
    }
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();
    avatar.controlWalk();
    avatar.controlShoot();
    viewport.draw();
  }
}
