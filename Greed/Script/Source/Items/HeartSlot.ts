/// <reference path="./ItemSlot.ts" />
namespace Greed {
  export class HeartSlot extends ItemSlot {
    constructor(_name: string, _position: ƒ.Vector3) {
      super(_name, _position);
    }

    protected getItem(): void {
      // create heart

      // restock item
      super.restock();
    }

    protected applyItemEffects(): void {
      // apply heart effect
    }
  }
}
