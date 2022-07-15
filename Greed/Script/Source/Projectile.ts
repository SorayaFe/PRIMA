namespace Greed {
  import ƒ = FudgeCore;

  export class Projectile extends ƒ.Node {
    private static mtrProjectileAvatar: ƒ.Material = new ƒ.Material(
      "ProjectileAvatar",
      ƒ.ShaderLitTextured,
      new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("./Assets/projectile-avatar.png"))
    );
    private static mtrProjectileEnemy: ƒ.Material = new ƒ.Material(
      "ProjectileEnemy",
      ƒ.ShaderLitTextured,
      new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("./Assets/projectile-enemy.png"))
    );

    private direction: string;
    private initialPosition: ƒ.Vector3;

    private rigidBody: ƒ.ComponentRigidbody;
    private audio: ƒ.ComponentAudio;

    private stop = false;
    private isEnemy = true;

    constructor(_name: string, _direction: string, _position: ƒ.Vector3, _isEnemy = true) {
      super(_name);
      this.isEnemy = _isEnemy;
      this.direction = _direction;
      this.initialPosition = _position.clone;
      this.audio = sounds.find((s) => s.getAudio().name === "Projectile");
      this.createProjectile(_position);
    }

    private createProjectile(_position: ƒ.Vector3): void {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = _position;
      const projectileSize = this.isEnemy ? 0.3 : gameState.projectileSize;
      cmpTransform.mtxLocal.scale(new ƒ.Vector3(projectileSize, projectileSize, projectileSize));
      cmpTransform.mtxLocal.translateZ(projectileSize / 2 - 0.2);

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
      this.addComponent(
        new ƒ.ComponentMaterial(
          this.isEnemy ? Projectile.mtrProjectileEnemy : Projectile.mtrProjectileAvatar
        )
      );
      this.addComponent(cmpTransform);

      // add rigid body
      this.rigidBody = new ƒ.ComponentRigidbody(
        1,
        ƒ.BODY_TYPE.DYNAMIC,
        ƒ.COLLIDER_TYPE.SPHERE,
        undefined,
        this.mtxLocal
      );
      this.rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
      this.rigidBody.isTrigger = true;

      this.addComponent(this.rigidBody);

      this.rigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        if (
          (!this.isEnemy && _event.cmpRigidbody.node.name === "Enemy") ||
          (this.isEnemy && _event.cmpRigidbody.node.name === "Avatar") ||
          _event.cmpRigidbody.node.name === "Wall" ||
          _event.cmpRigidbody.node.name === "Door"
        ) {
          this.removeProjectile();
        }
      });
    }

    public moveProjectile(): void {
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () => {
        if (this.rigidBody && !this.stop) {
          this.rigidBody.applyForce(new ƒ.Vector3(0, 9.8, 0));

          let vector = new ƒ.Vector3();
          const shotSpeed = this.isEnemy ? 2.3 : gameState.shotSpeed;

          switch (this.direction) {
            case "x":
              vector = ƒ.Vector3.X(shotSpeed);
              break;
            case "-x":
              vector = ƒ.Vector3.X(-shotSpeed);
              break;
            case "y":
              vector = ƒ.Vector3.Y(shotSpeed);
              break;
            case "-y":
              vector = ƒ.Vector3.Y(-shotSpeed);
              break;

            default:
              break;
          }

          this.rigidBody.setVelocity(vector);

          const distanceTraveled: number = this.mtxLocal.translation.getDistance(
            this.initialPosition
          );

          if (distanceTraveled >= (this.isEnemy ? 5 : gameState.range)) {
            this.removeProjectile();
          }
        }
      });
    }

    private removeProjectile(): void {
      this.stop = true;
      this.rigidBody.setVelocity(new ƒ.Vector3(0, -1, 0));
      setTimeout(() => {
        this.audio.play(true);
        graph.removeChild(this);
      }, 100);
    }
  }
}
