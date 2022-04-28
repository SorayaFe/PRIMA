declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundInitial extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        private setPosition;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundMove extends ƒ.ComponentScript {
        private static graph;
        private static ground;
        private static cmpMeshTerrain;
        private static meshTerrain;
        static readonly iSubclass: number;
        constructor();
        addComponent: () => void;
        setPosition: () => void;
    }
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class MoveSlenderMan extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private time;
        private movement;
        constructor();
        addComponent: () => void;
        move: () => void;
    }
}
