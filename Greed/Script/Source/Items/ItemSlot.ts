namespace Greed {
  import ƒ = FudgeCore;

  export class ItemSlot extends ƒ.Node {
    public static items: Item[] = [];

    private activeItemIndex: number;

    constructor(_name: string, _position: ƒ.Vector3) {
      super(_name);
      this.createItemSlot(_position);
    }

    private createItemSlot(_position: ƒ.Vector3) {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = _position;

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
      this.addComponent(cmpTransform);

      // add rigid body
      const rigidBody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(
        1,
        ƒ.BODY_TYPE.STATIC,
        ƒ.COLLIDER_TYPE.SPHERE,
        undefined,
        this.mtxLocal
      );
      rigidBody.isTrigger = true;

      this.addComponent(rigidBody);

      rigidBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
        if (_event.cmpRigidbody.node.name == "Avatar") {
          this.applyNewItem();
        }
      });

      this.getItem();
    }

    protected getItem(): void {
      // get random item
      this.activeItemIndex = ƒ.Random.default.getIndex(ItemSlot.items);

      // restock item
      this.restock();
    }

    public async restock(): Promise<void> {
      // create sprite
      await loadSprites(ItemSlot.items[this.activeItemIndex].sprite);
      setSprite(this, ItemSlot.items[this.activeItemIndex].sprite.name);
    }

    private applyNewItem(): void {
      this.applyItemEffects();

      // remove item from display and remove from array
      this.removeChild(this.getChildrenByName("Sprite")[0]);
      ItemSlot.items.splice(this.activeItemIndex, 1);

      new ƒ.Timer(ƒ.Time.game, 2000, 1, () => {
        this.getItem();
      });
    }

    protected applyItemEffects(): void {
      const item: Item = ItemSlot.items[this.activeItemIndex];

      for (let index = 0; index < item.effects.length; index++) {
        gameState[item.effects[index]] = item.values[index];
      }
    }
  }
}
