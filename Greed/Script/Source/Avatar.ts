namespace Greed {
  import ƒ = FudgeCore;

  export class Avatar extends ƒ.Node {
    private walkX: ƒ.Control = new ƒ.Control("walkX", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 300);
    private walkY: ƒ.Control = new ƒ.Control("walkY", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 300);

    constructor(_name: string) {
      super(_name);
      this.createAvatar();
    }

    private async createAvatar() {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = new ƒ.Vector3(10, 20, 0.5);

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
      this.addComponent(cmpTransform);

      const spriteInfo: SpriteInfo = {
        path: "Assets/avatar2.png",
        name: "avatar",
        x: 0,
        y: 0,
        width: 28,
        height: 32,
        frames: 3,
        resolutionQuad: 32,
        offsetNext: 96,
      };
      await Sprite.loadSprites(spriteInfo);
      Sprite.setSprite(this, "avatar");

      const rigidBody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(
        1,
        ƒ.BODY_TYPE.DYNAMIC,
        ƒ.COLLIDER_TYPE.SPHERE,
        undefined,
        this.mtxLocal
      );

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        // if abfrage dazu
        this.hndHit();
      });

      // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.controlWalk);
    }

    private controlWalk(): void {
      // const input: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
      // this.walkY.setInput(input);
      // this.walkY.setFactor(3);
      // const input2: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.D]);
      // this.walkX.setInput(input2);
      // this.walkX.setFactor(3);
      // const vector = new ƒ.Vector3(
      //   (this.walkX.getOutput() * ƒ.Loop.timeFrameGame) / 20,
      //   0,
      //   (this.walkY.getOutput() * ƒ.Loop.timeFrameGame) / 20
      // );
      // vector.transform(this.mtxLocal, false);
      // this.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);
    }

    private hndHit(): void {
      //handle projectile hit
    }
  }
}
