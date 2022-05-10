namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

  enum JOB {
    FOLLOW,
    STAND,
    TELEPORT,
  }

  export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(StateMachine);
    private static instructions: ƒAid.StateMachineInstructions<JOB> = StateMachine.get();

    private cmpBody: ƒ.ComponentRigidbody;
    private time: number = 0;

    constructor() {
      super();
      this.instructions = StateMachine.instructions; // setup instructions with the static set

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    public static get(): ƒAid.StateMachineInstructions<JOB> {
      let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
      setup.transitDefault = StateMachine.transitDefault;
      setup.setAction(JOB.FOLLOW, <ƒ.General>this.actFollow);
      setup.setAction(JOB.STAND, <ƒ.General>this.actStand);
      setup.setAction(JOB.TELEPORT, <ƒ.General>this.actTeleport);

      return setup;
    }

    private static transitDefault(_machine: StateMachine): void {
      console.log("Transit to", _machine.stateNext);
    }

    private static async actFollow(_machine: StateMachine): Promise<void> {
      if (avatar) {
        _machine.node.mtxLocal.translate(
          ƒ.Vector3.SCALE(ƒ.Vector3.Z(), ƒ.Loop.timeFrameGame / 1000)
        );

        if (_machine.time > ƒ.Time.game.get()) {
          return;
        }
        _machine.time = ƒ.Time.game.get() + 1000;

        _machine.node.mtxLocal.lookAt(avatar.mtxLocal.translation, ƒ.Vector3.Y(), true);
      }
    }

    private static async actStand(_machine: StateMachine): Promise<void> {
      console.log("stand");
    }

    private static async actTeleport(_machine: StateMachine): Promise<void> {
      _machine.node.mtxLocal.translation = ƒ.Random.default.getVector3(
        new ƒ.Vector3(29, 0, 29),
        new ƒ.Vector3(-29, 0, -29)
      );
      _machine.transit(JOB.FOLLOW);
    }

    // Activate the functions of this component as response to events
    private hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          this.transit(JOB.FOLLOW);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          this.cmpBody = this.node.getComponent(ƒ.ComponentRigidbody);

          this.cmpBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
            if (_event.cmpRigidbody.node.name == "Avatar") this.transit(JOB.STAND);
          });

          new ƒ.Timer(ƒ.Time.game, 25000, 0, () => {
            if (this.stateCurrent != JOB.STAND) {
              this.transit(JOB.TELEPORT);
            }
          });

          break;
      }
    };

    private update = (_event: Event): void => {
      this.act();
    };
  }
}
