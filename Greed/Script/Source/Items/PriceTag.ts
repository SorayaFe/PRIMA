namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export class PriceTag extends ƒ.Node {
    private sprite: ƒAid.NodeSprite;

    constructor(_name: string, _position: ƒ.Vector3) {
      super(_name);
      this.createPriceTag(_position);
    }

    public async createPriceTag(_position: ƒ.Vector3): Promise<void> {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = _position;

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
      this.addComponent(cmpTransform);

      const spriteInfo: SpriteInfo = {
        path: "Assets/prices.png",
        name: "Prices",
        x: 0,
        y: 0,
        width: 20,
        height: 9,
        frames: 3,
        resolutionQuad: 32,
        offsetNext: 22,
      };
      await loadSprites(spriteInfo);
      setSprite(this, spriteInfo.name);
      this.sprite = this.getChildrenByName("Sprite")[0] as ƒAid.NodeSprite;
    }

    public setPrice(_price: number): void {
      switch (_price) {
        case 3:
          this.sprite.showFrame(0);
          break;
        case 5:
          this.sprite.showFrame(1);
          break;
        case 10:
          this.sprite.showFrame(2);
          break;
        default:
          break;
      }
      this.sprite.setFrameDirection(0);
    }
  }
}
