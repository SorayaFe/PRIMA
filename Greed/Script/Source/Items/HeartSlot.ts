namespace Greed {
  export class HeartSlot extends ItemSlot {
    constructor(_name: string) {
      super(_name);
    }

    protected getItem(): void {
      // create heart

      //TODO replace {} as any
      super.restock({} as any);
    }

    protected applyItemEffects(): void {
      // apply heart effect
    }
  }
}
