namespace Greed {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Greed);

  export abstract class BasicScript extends ƒ.ComponentScript {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(BasicScript);
    protected rigidBody: ƒ.ComponentRigidbody;

    constructor() {
      super();

      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
    }

    private hndEvent = (_event: Event): void => {
      if (_event.type === ƒ.EVENT.COMPONENT_ADD) {
        this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);

        this.addInitialBehavior();

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
      } else if (_event.type === ƒ.EVENT.COMPONENT_REMOVE) {
        this.clearTimers();
        ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
      }
    };

    private update = () => {
      const pos = this.rigidBody.getPosition();
      this.rigidBody.setPosition(new ƒ.Vector3(pos.x, pos.y, 0.1));
      this.addBehavior();
    };

    protected abstract addInitialBehavior(): void;

    protected abstract addBehavior(): void;

    protected abstract clearTimers(): void;
  }
}
