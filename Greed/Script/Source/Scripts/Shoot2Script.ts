/// <reference path="./BasicScript.ts" />

namespace Greed {
  import ƒ = FudgeCore;

  export class Shoot2Script extends BasicScript {
    private shotTimer: ƒ.Timer;
    private movementTimer: ƒ.Timer;

    private sprite: ƒ.Node;

    private vector: ƒ.Vector3 = ƒ.Random.default.getVector3(
      new ƒ.Vector3(0.5, 0.5, 0.1),
      new ƒ.Vector3(-0.5, -0.5, 0.1)
    );

    private rotate: boolean = false;
    private rotation: number = 90;

    constructor(_rotate: boolean) {
      super();
      this.rotate = _rotate;
    }

    protected addInitialBehavior(): void {
      this.sprite = this.node.getChildrenByName("Sprite")[0];
      this.addProjectile("x");
      this.addProjectile("-x");
      this.setupTimers();
    }

    protected addBehavior(): void {
      this.rigidBody.setVelocity(this.vector);
    }

    protected clearTimers(): void {
      this.shotTimer.clear();
      this.movementTimer.clear();
    }

    private setupTimers(): void {
      this.shotTimer = new ƒ.Timer(ƒ.Time.game, 2500, 0, () => {
        this.addProjectile(this.rotation > 0 ? "x" : "y");
        this.addProjectile(this.rotation > 0 ? "-x" : "-y");
      });

      this.movementTimer = new ƒ.Timer(ƒ.Time.game, 4100, 0, () => {
        if (this.rotate) {
          if (ƒ.Random.default.getBoolean()) {
            this.sprite.mtxLocal.rotateZ(this.rotation);
            this.rotation = this.rotation > 0 ? -90 : 90;
          }
        }

        this.vector = ƒ.Random.default.getVector3(
          new ƒ.Vector3(0.5, 0.5, 0),
          new ƒ.Vector3(-0.5, -0.5, 0)
        );
      });
    }

    private addProjectile(_direction: string): void {
      const projectile: Projectile = new Projectile(
        "ProjectileEnemy",
        _direction,
        this.node.mtxLocal.translation
      );
      graph.addChild(projectile);
      projectile.moveProjectile();
    }
  }
}
