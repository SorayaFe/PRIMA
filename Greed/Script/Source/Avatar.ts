namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  export class Avatar extends ƒ.Node {
    private sprite: ƒAid.NodeSprite;
    private camera: ƒ.ComponentCamera;
    private audio: ƒ.ComponentAudio;

    private walkX: ƒ.Control = new ƒ.Control("walkX", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 150);
    private walkY: ƒ.Control = new ƒ.Control("walkY", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 150);

    private isInShop: boolean = false;

    constructor(_name: string, _camera: ƒ.ComponentCamera) {
      super(_name);
      this.camera = _camera;
      this.audio = sounds.find((s) => s.getAudio().name === "Hurt");
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
        resolutionQuad: 28,
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
      rigidBody.mtxPivot.translateY(-0.2);

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "Enemy" && !gameState.isInvincible) {
          this.hndHit();
        }
      });
      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "ProjectileEnemy") {
          this.hndHit();
        }
      });
    }

    public controlWalk(): void {
      const rigidBody: ƒ.ComponentRigidbody = this.getComponent(ƒ.ComponentRigidbody);

      if (rigidBody) {
        rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));
        const position = rigidBody.getPosition();
        rigidBody.setPosition(new ƒ.Vector3(position.x, position.y, 0.5));

        const input: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.S]);
        this.walkY.setInput(input);
        this.walkY.setFactor(2.1 * gameState.speed);

        const input2: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D], [ƒ.KEYBOARD_CODE.A]);
        this.walkX.setInput(input2);
        this.walkX.setFactor(2.1 * gameState.speed);

        const vector = new ƒ.Vector3(
          (this.walkX.getOutput() * ƒ.Loop.timeFrameGame) / 20,
          (this.walkY.getOutput() * ƒ.Loop.timeFrameGame) / 20,
          0
        );

        vector.transform(this.mtxLocal, false);
        rigidBody.setVelocity(vector);
        this.sprite.setFrameDirection(input === 0 && input2 === 0 ? 0 : 1);

        this.moveCamera();
      }
    }

    public controlShoot(): void {
      if (gameState.canShoot) {
        const input: number = ƒ.Keyboard.mapToTrit(
          [ƒ.KEYBOARD_CODE.ARROW_UP],
          [ƒ.KEYBOARD_CODE.ARROW_DOWN]
        );
        const input2: number = ƒ.Keyboard.mapToTrit(
          [ƒ.KEYBOARD_CODE.ARROW_RIGHT],
          [ƒ.KEYBOARD_CODE.ARROW_LEFT]
        );

        if (input || input2) {
          gameState.setShotTimeout();
          //create projectile
          let direction = "";
          if (input) {
            direction = input > 0 ? "y" : "-y";
          } else if (input2) {
            direction = input2 > 0 ? "x" : "-x";
          }

          const projectile: Projectile = new Projectile(
            "ProjectileAvatar",
            direction,
            this.mtxLocal.translation,
            false
          );
          graph.addChild(projectile);
          projectile.moveProjectile();
        }
      }
    }

    private moveCamera(): void {
      if (this.mtxLocal.translation.y > 21 && !this.isInShop) {
        this.isInShop = true;
        this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 25, 20);
      } else if (this.mtxLocal.translation.y < 21 && this.isInShop) {
        this.isInShop = false;
        this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, 15.5, 20);
      } else if (this.mtxLocal.translation.y < 15.5 && this.mtxLocal.translation.y > 4.3) {
        this.camera.mtxPivot.translation = new ƒ.Vector3(7.5, this.mtxLocal.translation.y, 20);
      }
    }

    private hndHit(): void {
      gameState.availableHealth -= 1;
      this.audio.play(true);
      gameState.updateHealth();
    }
  }
}
