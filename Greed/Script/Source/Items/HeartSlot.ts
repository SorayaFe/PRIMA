/// <reference path="./ItemSlot.ts" />
namespace Greed {
  export class HeartSlot extends ItemSlot {
    constructor(_name: string, _position: ƒ.Vector3, _priceTag: PriceTag) {
      super(_name, _position, _priceTag);
    }

    protected getItem(): void {
      // create heart

      this.activeItem = {
        name: "Heart",
        description: "",
        effects: [],
        values: [],
        price: 3,
        sprite: {
          path: "Assets/heart.png",
          name: "Heart",
          x: 0,
          y: 0,
          width: 244,
          height: 199,
          frames: 1,
          resolutionQuad: 300,
          offsetNext: 0,
        },
      };

      // restock item
      super.restock();
    }

    protected applyItemEffects(): void {
      // apply heart effect
      gameState.availableHealth += 1;
      gameState.updateHealth();
    }
  }
}
