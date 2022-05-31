namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  export class Avatar extends ƒ.Node {
    private sprite: ƒAid.NodeSprite;
    private camera: ƒ.ComponentCamera;

    private walkX: ƒ.Control = new ƒ.Control("walkX", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 150);
    private walkY: ƒ.Control = new ƒ.Control("walkY", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 150);

    private isInShop: boolean = false;

    constructor(_name: string, _camera: ƒ.ComponentCamera) {
      super(_name);
      this.camera = _camera;
      this.createAvatar();
    }

    private async createAvatar() {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = new ƒ.Vector3(7.5, 15.5, 0.1);

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
        ƒ.COLLIDER_TYPE.SPHERE,
        undefined,
        this.mtxLocal
      );
      rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        // TODO if abfrage dazu
        this.hndHit();
      });
      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_EXIT, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name == "Door") {
          this.moveCamera(this.isInShop ? "leave" : "enter");
        }
      });
    }

    public controlWalk(): void {
      const rigidBody: ƒ.ComponentRigidbody = this.getComponent(ƒ.ComponentRigidbody);

      if (rigidBody) {
        rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));

        const input: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
        this.walkY.setInput(input);
        this.walkY.setFactor(2 * gameState.speed);

        const input2: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D], [ƒ.KEYBOARD_CODE.A]);
        this.walkX.setInput(input2);
        this.walkX.setFactor(2 * gameState.speed);

        const vector = new ƒ.Vector3(
          (this.walkX.getOutput() * ƒ.Loop.timeFrameGame) / 20,
          (this.walkY.getOutput() * ƒ.Loop.timeFrameGame) / 20,
          0
        );

        vector.transform(this.mtxLocal, false);
        rigidBody.setVelocity(vector);
        this.sprite.setFrameDirection(input === 0 && input2 === 0 ? 0 : 1);

        if (!this.isInShop) {
          this.moveCamera();
        }
      }
    }

    private moveCamera(transitionShop?: string): void {
      if (transitionShop) {
        if (transitionShop === "enter") {
          this.isInShop = true;
          this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 27, 20);
        } else {
          this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 15.5, 20);
          this.isInShop = false;
        }
      } else if (this.mtxLocal.translation.y < 15.5 && this.mtxLocal.translation.y > 4.3) {
        this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, this.mtxLocal.translation.y, 20);
      }
    }

    private hndHit(): void {
      //handle projectile hit
    }
  }
}
