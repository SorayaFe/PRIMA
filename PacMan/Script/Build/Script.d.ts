declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Ghost extends ƒ.Node {
        private movement;
        private numbers;
        constructor(_name: string);
        move(_paths: ƒ.Node[]): void;
    }
}
declare namespace Script {
    let movingDirection: string;
}
declare namespace Script {
    import ƒAid = FudgeAid;
    let animations: ƒAid.SpriteSheetAnimations;
    function loadSprites(): Promise<void>;
    function setSprite(_node: ƒ.Node): void;
    function rotateSprite(_direction: string): void;
}
