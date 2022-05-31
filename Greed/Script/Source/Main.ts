namespace Greed {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;
  window.addEventListener("load", init);
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  export let gameState: GameState;

  let viewport: ƒ.Viewport;
  export let graph: ƒ.Node;
  let avatar: Avatar;

  function init(_event: Event) {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
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
    // setup the viewport
    const cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    //FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
    viewport.draw();
    canvas.dispatchEvent(
      new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport })
    );
  }

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(10, 20, 25));
    viewport.camera.mtxPivot.rotateY(180);
    graph = viewport.getBranch();

    gameState = new GameState();

    avatar = new Avatar("Avatar");
    graph.addChild(avatar);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();
    avatar.controlWalk();
    viewport.draw();
  }
}
