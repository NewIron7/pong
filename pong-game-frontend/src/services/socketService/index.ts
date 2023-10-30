import { Socket, io } from "socket.io-client";

class SocketService {

    public socket: Socket | null = null;

    public connect(
        url: string
    ): Promise<Socket> {
        return new Promise((rs, rj) => {
            this.socket = io(url);

            if (!this.socket)
                return rj();
            
            this.socket.on("connect", () => {
                rs(this.socket as Socket);
            });

            this.socket.on("connect error", (err) => {
                console.log("Connection error: ", err);
                rj(err);
            });

        });
        
    }

    public disconnect() {
        this.socket?.disconnect();
    }

}

export default new SocketService();