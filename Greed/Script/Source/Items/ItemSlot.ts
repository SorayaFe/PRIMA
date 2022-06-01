namespace Greed {
  import ƒ = FudgeCore;

  export class ItemSlot extends ƒ.Node {
    public static items: Item[] = [];

    private activeItem: Item;

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
      this.activeItem = ƒ.Random.default.getElement(ItemSlot.items);

      // restock item
      this.restock();
    }

    public async restock(): Promise<void> {
      if (ItemSlot.items.length) {
        // create sprite
        await loadSprites(this.activeItem.sprite);
        setSprite(this, this.activeItem.sprite.name);
      }
    }

    private applyNewItem(): void {
      this.applyItemEffects();

      // remove item from display and remove from array
      this.removeChild(this.getChildrenByName("Sprite")[0]);
      ItemSlot.items.splice(
        ItemSlot.items.findIndex((i) => i === this.activeItem),
        1
      );

      new ƒ.Timer(ƒ.Time.game, 2000, 1, () => {
        this.getItem();
      });
    }

    protected applyItemEffects(): void {
      for (let index = 0; index < this.activeItem.effects.length; index++) {
        gameState[this.activeItem.effects[index]] += this.activeItem.values[index];
      }
    }
  }
}
