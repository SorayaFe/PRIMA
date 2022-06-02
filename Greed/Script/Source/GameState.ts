namespace Greed {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    availableHealth: number = 3;
    coins: number = 0;

    health: number = 3;
    speed: number = 1;
    damage: number = 3.5;
    fireRate: number = 2000;
    shotSpeed: number = 1.5;
    projectileSize: number = 0.5;
    range: number = 5;

    canShoot = true;

    //evtl luck: number = 1; //possibly more coins with more luck

    public constructor() {
      super();
      const domVui: HTMLDivElement = document.querySelector("div#vui");
      console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {}

    public setShotTimeout(): void {
      this.canShoot = false;
      const timeout = 3000 - this.fireRate;
      new ƒ.Timer(ƒ.Time.game, timeout > 0 ? timeout : 10, 1, () => {
        this.canShoot = true;
      });
    }
  }
}
