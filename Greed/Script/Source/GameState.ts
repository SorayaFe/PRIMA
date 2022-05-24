namespace Greed {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    health: number = 3;
    coins: number = 0;

    speed: number = 1;
    damage: number = 3.5;
    shotSpeed: number = 1;
    projectileSize: number = 1;

    //evtl range: number = 1;
    //evtl luck: number = 1; //possibly more coins with more luck

    public constructor() {
      super();
      const domVui: HTMLDivElement = document.querySelector("div#vui");
      console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {}
  }
}
