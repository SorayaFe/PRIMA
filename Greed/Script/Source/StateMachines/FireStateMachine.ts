namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Project.registerScriptNamespace(Greed); // Register the namespace to FUDGE for serialization

  enum JOB {
    FOLLOW,
    CHARGE,
    SPAWN,
    STAND,
  }

  export class FireStateMachine extends ƒAid.ComponentStateMachine<JOB> {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(FireStateMachine);
    private static instructions: ƒAid.StateMachineInstructions<JOB> = FireStateMachine.get();

    private rigidBody: ƒ.ComponentRigidbody;
    private timer: ƒ.Timer;

    constructor() {
      super();
      this.instructions = FireStateMachine.instructions;

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
    }

    public static get(): ƒAid.StateMachineInstructions<JOB> {
      let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
      setup.transitDefault = FireStateMachine.transitDefault;
      setup.setAction(JOB.FOLLOW, <ƒ.General>this.actFollow);
      setup.setAction(JOB.CHARGE, <ƒ.General>this.actFollow);
      setup.setAction(JOB.SPAWN, <ƒ.General>this.actSpawn);
      setup.setAction(JOB.STAND, <ƒ.General>this.actStand);

      return setup;
    }

    private static transitDefault(_machine: FireStateMachine): void {}

    private static async actFollow(_machine: FireStateMachine): Promise<void> {
      const vector = avatar.mtxLocal.translation.clone;
      vector.subtract(_machine.node.mtxLocal.translation);
      vector.normalize(_machine.stateCurrent === JOB.FOLLOW ? 0.8 : 4);
      _machine.rigidBody.setVelocity(vector);

      if (_machine.stateCurrent === JOB.CHARGE) {
        _machine.transit(JOB.STAND);
        _machine.act();
      }
    }

    private static async actSpawn(_machine: FireStateMachine): Promise<void> {
      const enemy: EnemyInterface = ƒ.Random.default.getElement(Enemy.enemies);
      enemiesNode.addChild(new Enemy("Enemy", enemy));

      setTimeout(() => {
        _machine.transit(JOB.FOLLOW);
      }, 1500);
    }

    private static async actStand(_machine: FireStateMachine): Promise<void> {
      setTimeout(() => {
        _machine.rigidBody.setVelocity(new ƒ.Vector3(0, 0, 0));
      }, 2000);

      setTimeout(() => {
        _machine.transit(JOB.SPAWN);
        _machine.act();
      }, 5000);
    }

    private hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);

          this.timer = new ƒ.Timer(ƒ.Time.game, 5000, 0, () => {
            this.transit(JOB.CHARGE);
            this.act();
          });

          this.transit(JOB.FOLLOW);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          if (this.timer) {
            this.timer.clear();
          }
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          break;
      }
    };

    private update = (_event: Event): void => {
      const pos = this.rigidBody.getPosition();
      this.rigidBody.setPosition(new ƒ.Vector3(pos.x, pos.y, 0.1));
      if (this.stateCurrent === JOB.FOLLOW) {
        this.act();
      }
    };
  }
}
