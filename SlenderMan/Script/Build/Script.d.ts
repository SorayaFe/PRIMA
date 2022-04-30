declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundInitial extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        private add;
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
declare namespace Script {
    import ƒ = FudgeCore;
    class Tree extends ƒ.Node {
        static takenPositions: ƒ.Vector3[];
        constructor(_name: string, _position: ƒ.Vector3);
        private addGraph;
    }
}
