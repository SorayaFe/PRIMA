/// <reference path="./Enemy.ts" />

namespace Greed {
  export class Boss extends Enemy {
    public static bosses: EnemyInterface[] = [];

    private stage: number;

    constructor(_name: string, _enemy: EnemyInterface, _stage: number) {
      super(_name, _enemy);
      this.stage = _stage;
    }

    // add state machine
    protected addScripts(): void {
      if (this.stage === 5) {
        this.script = new SkeletonStateMachine();
        this.addComponent(this.script);
      } else {
      }
    }
  }
}
