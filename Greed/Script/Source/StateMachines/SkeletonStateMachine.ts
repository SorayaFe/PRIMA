namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Project.registerScriptNamespace(Greed); // Register the namespace to FUDGE for serialization

  enum JOB {
    FOLLOW,
    TELEPORT,
    SHOOT,
  }

  export class SkeletonStateMachine extends ƒAid.ComponentStateMachine<JOB> {
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(SkeletonStateMachine);
    private static instructions: ƒAid.StateMachineInstructions<JOB> = SkeletonStateMachine.get();

    private rigidBody: ƒ.ComponentRigidbody;
    private cmpTransform: ƒ.ComponentTransform;
    private timer: ƒ.Timer;

    constructor() {
      super();
      this.instructions = SkeletonStateMachine.instructions;

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
    }

    public static get(): ƒAid.StateMachineInstructions<JOB> {
      let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
      setup.transitDefault = SkeletonStateMachine.transitDefault;
      setup.setAction(JOB.FOLLOW, <ƒ.General>this.actFollow);
      setup.setAction(JOB.TELEPORT, <ƒ.General>this.actTeleport);
      setup.setAction(JOB.SHOOT, <ƒ.General>this.actShoot);

      return setup;
    }

    private static transitDefault(_machine: SkeletonStateMachine): void {}

    private static async actFollow(_machine: SkeletonStateMachine): Promise<void> {
      const vector = avatar.mtxLocal.translation.clone;
      vector.subtract(_machine.node.mtxLocal.translation);
      vector.normalize(0.85);
      _machine.rigidBody.setVelocity(vector);
    }

    private static async actTeleport(_machine: SkeletonStateMachine): Promise<void> {
      _machine.node.activate(false);
      _machine.rigidBody.setVelocity(ƒ.Vector3.Z(5));

      const vector = avatar.mtxLocal.translation.clone;
      setTimeout(() => {
        _machine.rigidBody.setVelocity(ƒ.Vector3.Z(0.1));
        _machine.node.activate(true);
        _machine.cmpTransform.mtxLocal.translation = vector;

        _machine.transit(JOB.SHOOT);
        _machine.act();
      }, 1500);
    }

    private static async actShoot(_machine: SkeletonStateMachine): Promise<void> {
      _machine.rigidBody.setVelocity(new ƒ.Vector3());
      _machine.addProjectile("x");
      _machine.addProjectile("-x");
      _machine.addProjectile("y");
      _machine.addProjectile("-y");

      _machine.transit(JOB.FOLLOW);
    }

    private hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);

          this.rigidBody = this.node.getComponent(ƒ.ComponentRigidbody);
          this.cmpTransform = this.node.getComponent(ƒ.ComponentTransform);

          this.timer = new ƒ.Timer(ƒ.Time.game, 10000, 0, () => {
            this.transit(JOB.TELEPORT);
            this.act();
          });

          this.setSprite();
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

    private addProjectile(_direction: string): void {
      const projectile: Projectile = new Projectile(
        "ProjectileEnemy",
        _direction,
        this.node.mtxLocal.translation
      );
      graph.addChild(projectile);
      projectile.moveProjectile();
    }

    private async setSprite(): Promise<void> {
      const sprite = this.node.getChildrenByName("Sprite")[0] as ƒAid.NodeSprite;
      sprite.activate(false);

      const spriteInfo: SpriteInfo = {
        path: "Assets/Enemies/skeleton-crumble.png",
        name: "SkeletonCrumble",
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        frames: 6,
        resolutionQuad: 32,
        offsetNext: 32,
      };
      await loadSprites(spriteInfo);
      setSprite(this.node, "SkeletonCrumble");

      const sprites = this.node.getChildrenByName("Sprite") as ƒAid.NodeSprite[];
      sprites[1].framerate = 8;

      setTimeout(() => {
        sprites[1].activate(false);
        sprites[0].activate(true);

        this.transit(JOB.FOLLOW);
      }, 500);
    }
  }
}
