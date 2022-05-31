namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export class Avatar extends ƒ.Node {
    private sprite: ƒAid.NodeSprite;
    private walkX: ƒ.Control = new ƒ.Control("walkX", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 150);
    private walkY: ƒ.Control = new ƒ.Control("walkY", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 150);

    constructor(_name: string) {
      super(_name);
      this.createAvatar();
    }

    private async createAvatar() {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = new ƒ.Vector3(10, 20, 0.5);

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
      this.addComponent(cmpTransform);

      // create sprite
      const spriteInfo: SpriteInfo = {
        path: "Assets/avatar.png",
        name: "avatar",
        x: 0,
        y: 0,
        width: 28,
        height: 32,
        frames: 3,
        resolutionQuad: 32,
        offsetNext: 96,
      };
      await loadSprites(spriteInfo);
      setSprite(this, "avatar");

      this.sprite = this.getChildrenByName("Sprite")[0] as ƒAid.NodeSprite;

      // add rigid body
      const rigidBody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(
        1,
        ƒ.BODY_TYPE.DYNAMIC,
        ƒ.COLLIDER_TYPE.CUBE,
        undefined,
        this.mtxLocal
      );
      rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        // if abfrage dazu

        this.hndHit();
      });
    }

    public controlWalk(): void {
      const rigidBody: ƒ.ComponentRigidbody = this.getComponent(ƒ.ComponentRigidbody);

      if (rigidBody) {
        rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));

        const input: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
        this.walkY.setInput(input);
        this.walkY.setFactor(3);

        const input2: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D], [ƒ.KEYBOARD_CODE.A]);
        this.walkX.setInput(input2);
        this.walkX.setFactor(3);

        const vector = new ƒ.Vector3(
          (this.walkX.getOutput() * ƒ.Loop.timeFrameGame) / 20,
          (this.walkY.getOutput() * ƒ.Loop.timeFrameGame) / 20,
          0
        );

        vector.transform(this.mtxLocal, false);
        rigidBody.setVelocity(vector);

        this.sprite.setFrameDirection(input === 0 && input2 === 0 ? 0 : 1);
      }
    }

    private hndHit(): void {
      //handle projectile hit
    }
  }
}
