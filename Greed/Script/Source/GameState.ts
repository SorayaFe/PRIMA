namespace Greed {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    availableHealth: number = 3;
    //TODO coins amount
    coins: number = 100;

    health: number = 3;
    speed: number = 1;
    damage: number = 3.5;
    fireRate: number = 1900;
    shotSpeed: number = 2.3;
    projectileSize: number = 0.3;
    range: number = 5;

    canShoot = true;
    heartsContainer: HTMLElement;

    public constructor() {
      super();
      const domVui: HTMLDivElement = document.querySelector("div#vui");
      console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
      this.heartsContainer = document.getElementById("hearts");
      this.updateHealth();
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {}

    public setShotTimeout(): void {
      this.canShoot = false;
      const timeout = 3000 - this.fireRate;
      new ƒ.Timer(ƒ.Time.game, timeout > 300 ? timeout : 300, 1, () => {
        this.canShoot = true;
      });
    }

    public updateHealth(): void {
      let innerHtml = "";

      for (let index = 0; index < this.availableHealth; index++) {
        innerHtml += '<div class="heart"></div>';
      }
      for (let index = 0; index < this.health - this.availableHealth; index++) {
        innerHtml += '<div class="heart empty"></div>';
      }

      this.heartsContainer.innerHTML = innerHtml;
    }
  }
}
