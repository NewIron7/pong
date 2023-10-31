import { Socket } from "socket.io-client";
import { IPlayPong } from "../../components/game";

class GameService {

    public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
        return new Promise((rs, rj) => {
            socket.emit("joinPong", { roomId: roomId });
            socket.on("roomJoined", () => rs(true));
            socket.on("roomJoinError", (error) => rj(error));
        });
    }

    public updateGame(socket: Socket, paddleY: number) {
        socket.emit("updateGame", { paddleY: paddleY });
    }

    public onUpdateGame(socket: Socket, listener: (pong: IPlayPong, started: boolean) => void) {
        socket.on("update", ( { pong, started } ) => listener(pong, started));
    }

    public started(socket: Socket, listener: (pos: boolean) => void) {
        socket.emit("started");
        socket.on("startPong", ( { pos } ) => listener(pos));
    }

    public async leave(socket: Socket): Promise<boolean> {
        return new Promise(() => {
            socket.emit("leaveRoom");
        });
    }

    public kicked(socket: Socket, listener: () => void) {
        socket.on("kicked", () => listener());
    }

    public cleanUp(socket: Socket) {
        socket.off("update");
        socket.off("started");
        socket.off("kicked");
    }

}

export default new GameService();