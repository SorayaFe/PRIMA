namespace Greed {
  import ƒ = FudgeCore;

  export class Enemy extends ƒ.Node {
    public static enemies: EnemyInterface[] = [];

    private enemy: EnemyInterface;
    private health: number;

    private audio: ƒ.ComponentAudio;
    protected script: ƒ.ComponentScript;

    constructor(_name: string, _enemy: EnemyInterface) {
      super(_name);
      this.enemy = _enemy;
      this.health = this.enemy.health;
      this.audio = sounds.find((s) => s.getAudio().name === "EnemyDie");
      this.createEnemy();
    }

    private async createEnemy(): Promise<void> {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      const vector =
        this.enemy.type === EnemyType.BOSS
          ? new ƒ.Vector3(10, 12, 0)
          : ƒ.Random.default.getVector3(new ƒ.Vector3(1, 1, 0), new ƒ.Vector3(14, 19, 0));
      cmpTransform.mtxLocal.translation = vector;
      cmpTransform.mtxLocal.scaleX(this.enemy.sizeX);
      cmpTransform.mtxLocal.scaleY(this.enemy.sizeY);
      cmpTransform.mtxLocal.translateZ(0.1);

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
      this.addComponent(cmpTransform);

      // create sprite
      await loadSprites(this.enemy.sprite);
      setSprite(this, this.enemy.sprite.name);

      // add rigid body
      const rigidBody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(
        5,
        ƒ.BODY_TYPE.DYNAMIC,
        ƒ.COLLIDER_TYPE.SPHERE,
        undefined,
        this.mtxLocal
      );
      rigidBody.effectRotation = new ƒ.Vector3(0, 0, 0);
      rigidBody.effectGravity = 0;

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "ProjectileAvatar") {
          this.hndHit();
        }
      });

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name === "Avatar") {
          this.dispatchEvent(new Event("touchedAvatar", { bubbles: true }));
        }
      });

      this.addScripts();
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

      if (enemiesNode.getChildren().length === 1) {
        this.dispatchEvent(new Event("lastEnemyKilled", { bubbles: true }));
      }

      this.removeComponent(this.script);
      enemiesNode.removeChild(this);
    }

    protected addScripts(): void {
      switch (this.enemy.type) {
        case EnemyType.SHOOT_2:
          this.script = new ShootScript(false);
          this.addComponent(this.script);
          break;
        case EnemyType.SHOOT_2_ROTATE:
          this.script = new ShootScript(true);
          this.addComponent(this.script);
          break;
        case EnemyType.SHOOT_4:
          this.script = new ShootScript(false, true);
          this.addComponent(this.script);
          break;
        case EnemyType.FOLLOW:
          this.script = new FollowScript(false);
          this.addComponent(this.script);
          break;
        case EnemyType.FOLLOW_SHOOT:
          this.script = new FollowScript(true);
          this.addComponent(this.script);
          break;
        case EnemyType.CHARGE:
          this.script = new ChargeScript();
          this.addComponent(this.script);
          break;
        default:
          break;
      }
    }
  }
}
