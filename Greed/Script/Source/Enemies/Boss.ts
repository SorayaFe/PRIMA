/// <reference path="./Enemy.ts" />

namespace Greed {
  export class Boss extends Enemy {
    public static bosses: EnemyInterface[] = [];

    private remainingRounds: number;

    constructor(_name: string, _enemy: EnemyInterface, _remainingRounds: number) {
      super(_name, _enemy);
      this.remainingRounds = _remainingRounds;
    }

    // add state machine
    protected addScripts(): void {
      if (this.remainingRounds === 1) {
        this.script = new SkeletonStateMachine();
      } else {
        this.script = new FireStateMachine();
      }
      this.addComponent(this.script);
    }
  }
}
