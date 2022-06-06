namespace Greed {
  import ƒAid = FudgeAid;

  const animations: ƒAid.SpriteSheetAnimations = {};

  export async function loadSprites(_spriteInfo: SpriteInfo): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load(_spriteInfo.path);
    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet);
    generateSprites(spriteSheet, _spriteInfo);
  }

  function generateSprites(_spriteSheet: ƒ.CoatTextured, _spriteInfo: SpriteInfo): void {
    const sheetAnimation: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(
      _spriteInfo.name,
      _spriteSheet
    );
    sheetAnimation.generateByGrid(
      ƒ.Rectangle.GET(_spriteInfo.x, _spriteInfo.y, _spriteInfo.width, _spriteInfo.height),
      _spriteInfo.frames,
      _spriteInfo.resolutionQuad,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(_spriteInfo.offsetNext)
    );
    animations[_spriteInfo.name] = sheetAnimation;
  }

  export function setSprite(_node: ƒ.Node, _name: string): void {
    const sprite: ƒAid.NodeSprite = new ƒAid.NodeSprite("Sprite");
    sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations[_name]);
    sprite.setFrameDirection(1);

    _node.addChild(sprite);
  }
}
