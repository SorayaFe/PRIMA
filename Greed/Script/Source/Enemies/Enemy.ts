namespace Greed {
  import ƒ = FudgeCore;

  export class Enemy extends ƒ.Node {
    public static enemies: EnemyInterface[] = [];

    public enemy: EnemyInterface;

    constructor(_name: string, _enemy: EnemyInterface) {
      super(_name);
      this.enemy = _enemy;

      this.createEnemy();
    }

    private createEnemy(): void {
      // create enemy

      this.addScripts();
    }

    private addScripts(): void {
      // add enemy script based on type
    }

    private hndHit(): void {
      // handle projectile hit
    }

    private die(): void {
      // remove enemy and check if it was the last remaining enemy
      // event if it was last enemy
    }
  }
}
