/// <reference path="./BasicScript.ts" />

namespace Greed {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Greed);

  export class Shoot2Script extends BasicScript {
    private shotTimer: ƒ.Timer;
    private movementTimer: ƒ.Timer;

    private vector: ƒ.Vector3 = ƒ.Random.default.getVector3(
      new ƒ.Vector3(0.5, 0.5, 0.1),
      new ƒ.Vector3(-0.5, -0.5, 0.1)
    );

    constructor() {
      super();
    }

    protected addInitialBehavior(): void {
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
      this.shotTimer = new ƒ.Timer(ƒ.Time.game, 2000, 0, () => {
        this.addProjectile("x");
        this.addProjectile("-x");
      });

      this.movementTimer = new ƒ.Timer(ƒ.Time.game, 4100, 0, () => {
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
