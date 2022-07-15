/// <reference path="./BasicScript.ts" />

namespace Greed {
  import ƒ = FudgeCore;

  /**
   * Script for Enemies with type CHARGE
   */
  export class ChargeScript extends BasicScript {
    private chargeTimer: ƒ.Timer;

    constructor() {
      super();
    }

    protected addInitialBehavior(): void {
      this.charge();
      this.setupTimers();
    }

    protected addBehavior(): void {}

    protected clearTimers(): void {
      this.chargeTimer.clear();
    }

    private setupTimers(): void {
      this.chargeTimer = new ƒ.Timer(ƒ.Time.game, 8000, 0, () => {
        this.charge();
      });
    }

    private charge(): void {
      const vector = avatar.mtxLocal.translation.clone;
      vector.subtract(this.node.mtxLocal.translation);

      this.rigidBody.setVelocity(vector);
    }
  }
}
