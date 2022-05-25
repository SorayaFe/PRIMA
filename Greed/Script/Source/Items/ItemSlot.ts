namespace Greed {
  import ƒ = FudgeCore;

  export class ItemSlot extends ƒ.Node {
    public static items: Item[] = [];

    private activeItem: Item;

    constructor(_name: string) {
      super(_name);
      this.getItem();
    }

    protected getItem(): void {
      // get random item

      //TODO replace {} as any
      this.restock({} as any);
    }

    public restock(item: Item): void {
      this.activeItem = item;

      // set item to display
    }

    private applyNewItem(): void {
      // remove item from display and remove from array
      this.applyItemEffects();
      this.getItem();
    }

    protected applyItemEffects(): void {
      // apply effect
    }
  }
}
