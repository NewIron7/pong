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

    public onUpdateGame(socket: Socket, listener: (pong: IPlayPong) => void) {
        socket.on("update", ( { pong } ) => listener(pong));
    }

    public started(socket: Socket, listener: (pos: boolean) => void) {
        socket.emit("started");
        socket.on("startPong", ( { pos } ) => listener(pos));
    }

    public alone(socket: Socket, listener: (id: string) => void) {
        socket.on("alone", ({ id }) => listener(id));
    }

    public leave(socket: Socket) {
        socket.emit("leaveRoom");
    }

}

export default new GameService();