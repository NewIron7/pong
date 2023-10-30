import React from "react";

export interface IGameContextProps {
    isInRoom: boolean;
    setInRoom: (inRoom: boolean) => void;
    isStarted: boolean;
    setStarted: (started: boolean) => void;
    pos: boolean;
    setPos: (pos: boolean) => void;
}

const defaultState: IGameContextProps = {
    isInRoom: false,
    setInRoom: () => {},
    isStarted: false,
    setStarted: () => {},
    pos: false,
    setPos: () => {},
};

export default React.createContext(defaultState);
