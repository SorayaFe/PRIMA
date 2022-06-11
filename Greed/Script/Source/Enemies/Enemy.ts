namespace Greed {
  import ƒ = FudgeCore;

  export class Enemy extends ƒ.Node {
    public static enemies: EnemyInterface[] = [];

    private enemy: EnemyInterface;
    private health: number;

    private audio: ƒ.ComponentAudio;
    private script: ƒ.ComponentScript;

    constructor(_name: string, _enemy: EnemyInterface) {
      super(_name);
      this.enemy = _enemy;
      this.health = this.enemy.health;
      this.audio = sounds.find((s) => s.getAudio().name === "EnemyDie");
      this.createEnemy();
    }

    private async createEnemy(): Promise<void> {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = ƒ.Random.default.getVector3(
        new ƒ.Vector3(0, 0, 0.1),
        new ƒ.Vector3(15, 20, 0.1)
      );

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
      this.addComponent(cmpTransform);

      // create sprite
      await loadSprites(this.enemy.sprite);
      setSprite(this, this.enemy.sprite.name);

      // add rigid body
      const rigidBody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(
        1,
        ƒ.BODY_TYPE.DYNAMIC,
        ƒ.COLLIDER_TYPE.CUBE,
        undefined,
        this.mtxLocal
      );
      rigidBody.mtxPivot.translateY(-0.2);
      rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
      rigidBody.effectGravity = 0;

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "ProjectileAvatar") {
          this.hndHit();
        }
      });

      this.addScripts();
    }

    protected addScripts(): void {
      switch (this.enemy.type) {
        case EnemyType.SHOOT_2:
          this.script = new Shoot2Script();
          this.addComponent(this.script);
          break;
        default:
          break;
      }
    }

    private hndHit(): void {
      this.health -= gameState.damage;
      if (this.health <= 0) {
        setTimeout(() => {
          this.die();
        }, 105);
      }
    }

    private die(): void {
      this.audio.play(true);

      this.removeComponent(this.script);
      enemiesNode.removeChild(this);

      if (enemiesNode.getChildren().length === 0) {
        this.dispatchEvent(new Event("lastEnemyKilled", { bubbles: true }));
      }
    }
  }
}
