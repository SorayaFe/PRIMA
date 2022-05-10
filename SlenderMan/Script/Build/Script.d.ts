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
    import ƒ = FudgeCore;
    let avatar: ƒ.Node;
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
    import ƒAid = FudgeAid;
    enum JOB {
        FOLLOW = 0,
        STAND = 1,
        TELEPORT = 2
    }
    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        private cmpBody;
        private time;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actFollow;
        private static actStand;
        private static actTeleport;
        private hndEvent;
        private update;
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Tree extends ƒ.Node {
        static takenPositions: ƒ.Vector3[];
        constructor(_name: string, _position: ƒ.Vector3);
        private addGraph;
    }
}
