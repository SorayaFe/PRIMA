namespace Greed {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export class Timer extends ƒ.Node {
    private static sprite: ƒAid.NodeSprite;

    constructor(_name: string) {
      super(_name);
      this.createTimer();
    }

    private async createTimer(): Promise<void> {
      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      cmpTransform.mtxLocal.translation = new ƒ.Vector3(7.5, 10, 0.1);

      this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshCube()));
      this.addComponent(cmpTransform);

      const spriteInfo: SpriteInfo = {
        path: "Assets/timer.png",
        name: "Timer",
        x: 0,
        y: 0,
        width: 35,
        height: 7,
        frames: 31,
        resolutionQuad: 35,
        offsetNext: 35,
      };

      await loadSprites(spriteInfo);
      setSprite(this, spriteInfo.name);
      Timer.sprite = this.getChildrenByName("Sprite")[0] as ƒAid.NodeSprite;
      Timer.sprite.framerate = 1;

      Timer.showFrame(30, true);
    }

    public static showFrame(frame: number, stop = false): void {
      Timer.sprite.showFrame(frame);
      Timer.sprite.setFrameDirection(stop ? 0 : 1);
    }
  }
}
