namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

  export class MoveSlenderMan extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(MoveSlenderMan);
    // Properties may be mutated by users in the editor via the automatically created user interface
    private time: number = 0;
    private movement: ƒ.Vector3 = new ƒ.Vector3();

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.addComponent);
    }

    public addComponent = (): void => {
      this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.move);
    };

    public move = (): void => {
      this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.movement, ƒ.Loop.timeFrameGame / 1000));
      if (this.time > ƒ.Time.game.get()) {
        return;
      }
      this.time = ƒ.Time.game.get() + 1000;
      this.movement = ƒ.Random.default.getVector3(new ƒ.Vector3(-0, 0, -1), new ƒ.Vector3(1, 0, 1));
    };
  }
}
