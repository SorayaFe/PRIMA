namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

  export class DropToGroundInitial extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(DropToGroundInitial);
    // Properties may be mutated by users in the editor via the automatically created user interface

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.add);
    }

    private add = (): void => {
      const graph: ƒ.Graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"] as ƒ.Graph;
      if (graph) {
        this.setPosition();
      } else {
        document.addEventListener("interactiveViewportStarted", <EventListener>this.setPosition);
      }
    };

    private setPosition = (): void => {
      const graph: ƒ.Graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"] as ƒ.Graph;
      const ground: ƒ.Node = graph
        .getChildrenByName("Environment")[0]
        .getChildrenByName("Ground")[0];
      const cmpMeshTerrain: ƒ.ComponentMesh = ground.getComponent(ƒ.ComponentMesh);
      const meshTerrain = <ƒ.MeshTerrain>cmpMeshTerrain.mesh;
      const distance = meshTerrain.getTerrainInfo(
        this.node.mtxLocal.translation,
        cmpMeshTerrain.mtxWorld
      )?.distance;
      if (distance) {
        this.node.mtxLocal.translateY(-distance);
      }
    };
  }
}
