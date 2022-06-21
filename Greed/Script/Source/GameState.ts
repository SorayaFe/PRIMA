namespace Greed {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    public availableHealth: number = 3;
    //TODO coins amount
    public coins: number = 1000;

    public health: number = 3;
    public speed: number = 1;
    public damage: number = 3.5;
    public fireRate: number = 1900;
    public shotSpeed: number = 2.3;
    public projectileSize: number = 0.3;
    public range: number = 5;

    public canShoot = true;
    public isInvincible = false;

    private heartsContainer: HTMLElement;
    private audio: ƒ.ComponentAudio;

    public constructor() {
      super();
      const domVui: HTMLDivElement = document.querySelector("div#vui");
      console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
      this.heartsContainer = document.getElementById("hearts");
      this.audio = sounds.find((s) => s.getAudio().name === "Die");
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

      if (this.availableHealth <= 0) {
        this.audio.play(true);
        // TODO die
      }
    }
  }
}
