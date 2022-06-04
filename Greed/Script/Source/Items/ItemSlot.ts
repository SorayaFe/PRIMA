namespace Greed {
  import ƒ = FudgeCore;

  export class ItemSlot extends ƒ.Node {
    public static items: Item[] = [];

    protected activeItem: Item;
    private priceTag: PriceTag;

    constructor(_name: string, _position: ƒ.Vector3, _priceTag: PriceTag) {
      super(_name);
      this.priceTag = _priceTag;
      this.createItemSlot(_position);
    }

    private async createItemSlot(_position: ƒ.Vector3) {
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
        if (
          _event.cmpRigidbody.node.name === "Avatar" &&
          gameState.coins >= this.activeItem.price
        ) {
          if (this.name === "SlotHeart" && gameState.availableHealth === gameState.health) {
            return;
          }
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
        // remove item from array
        const index = ItemSlot.items.findIndex((i) => i === this.activeItem);
        if (index !== -1) {
          ItemSlot.items.splice(index, 1);
        }

        // create sprite
        await loadSprites(this.activeItem.sprite);
        setSprite(this, this.activeItem.sprite.name);
        this.priceTag.setPrice(this.activeItem.price);
        this.priceTag.activate(true);
      }
    }

    private applyNewItem(): void {
      gameState.coins -= this.activeItem.price;
      this.applyItemEffects();

      // remove item from display
      this.removeChild(this.getChildrenByName("Sprite")[0]);
      this.priceTag.activate(false);

      new ƒ.Timer(ƒ.Time.game, 1700, 1, () => {
        this.getItem();
      });
    }

    protected applyItemEffects(): void {
      for (let index = 0; index < this.activeItem.effects.length; index++) {
        gameState[this.activeItem.effects[index]] += this.activeItem.values[index];
        if (this.activeItem.effects[index] === Effects.HEALTH) {
          gameState.availableHealth += this.activeItem.values[index];
          gameState.updateHealth();
        }
      }
    }
  }
}
