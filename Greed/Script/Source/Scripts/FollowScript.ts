/// <reference path="./BasicScript.ts" />

namespace Greed {
  import ƒ = FudgeCore;

  /**
   * Script for Enemies with type FOLLOW and FOLLOW_SHOOT
   */
  export class FollowScript extends BasicScript {
    private shotTimer: ƒ.Timer;

    private shoot: boolean = false;

    constructor(_shoot: boolean) {
      super();
      this.shoot = _shoot;
    }

    protected addInitialBehavior(): void {
      if (this.shoot) {
        this.setupTimers();
      }
    }

    protected addBehavior(): void {
      const vector = avatar.mtxLocal.translation.clone;
      vector.subtract(this.node.mtxLocal.translation);
      vector.normalize(0.9);
      this.rigidBody.setVelocity(vector);
    }

    protected clearTimers(): void {
      if (this.shotTimer) {
        this.shotTimer.clear();
      }
    }

    private setupTimers(): void {
      this.shotTimer = new ƒ.Timer(ƒ.Time.game, 5000, 0, () => {
        this.addProjectile("x");
        this.addProjectile("-x");
        this.addProjectile("y");
        this.addProjectile("-y");
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
