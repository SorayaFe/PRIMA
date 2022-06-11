/// <reference path="./Enemy.ts" />

namespace Greed {
  export class Boss extends Enemy {
    public static bosses: EnemyInterface[] = [];

    constructor(_name: string, _enemy: EnemyInterface) {
      super(_name, _enemy);
    }

    protected addScripts(): void {
      // add state machine
    }
  }
}
