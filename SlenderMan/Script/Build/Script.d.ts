declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundInitial extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
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
        setPosition: (_event: Event) => void;
    }
}
declare namespace Script {
}
