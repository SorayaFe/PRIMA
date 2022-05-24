namespace Greed {
  import ƒ = FudgeCore;

  export class Projectile extends ƒ.Node {
    constructor(_name: string) {
      super(_name);
      this.createProjectile();
    }

    private createProjectile(): void {}
  }
}
