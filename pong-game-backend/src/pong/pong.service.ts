import { Injectable } from '@nestjs/common';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { Ball, initializeBall, Paddle, initializeOpponent, initializeUser, Room } from './entities/pong.entity';
import { Server, Socket } from 'socket.io'

@Injectable()
export class PongService {

  width: number = 600;
  height: number = 400;

  rooms: Record<number, Room> = {};
  clientToPaddle = {};
  clientToRoom = {};

  deleteClient(server: Server, client: Socket) {
    const room = this.getClientRoom(client);
    if (!room)
      return ;
    if (room.users.length === 2)
    {
      // let pos: number;
      // if (room.users[0] === client.id)
      //   pos = 1;
      // else
      //   pos = 0;

      // this.rooms[room.id] = {
      //   start: false,
      //   id: room.id,
      //   users: [room.users[pos]],
      //   ball: initializeBall(this.width, this.height),
      // }
      // this.clientToPaddle[room.users[pos]] = initializeUser(this.height);

      const opponentId = client.id === room.users[0] ? room.users[1] : room.users[0];
      delete this.clientToPaddle[opponentId];
      delete this.clientToRoom[opponentId];

      server.sockets.sockets.get(opponentId)?.emit("kicked");
      server.sockets.sockets.get(opponentId)?.leave(room.id);
      console.log(`client leaving room ${opponentId}`);
      
    }
      
    delete this.clientToPaddle[client.id];
    delete this.clientToRoom[client.id];

    client.leave(room.id);
    delete this.rooms[room.id];
    console.log(`client leaving room ${client.id}`);
  }

  async join(server: Server, client: Socket, roomId: string) {

    console.log('Client ', client.id, 'join room: ', roomId);

    const connectedSockets = server.sockets.adapter.rooms.get(roomId);
    const clientRooms = Array.from(client.rooms.values()).filter(
      (r) => r !== client.id
    );

    if (
      clientRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    )
      return (null);

    
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        start: false,
        id: roomId,
        users: [],
        ball: initializeBall(this.width, this.height),
      };
    }

    this.rooms[roomId].users.push(client.id);
    
    await client.join(roomId);
    this.clientToRoom[client.id] = roomId;

    if (this.rooms[roomId].users.length === 2)
    {
      this.rooms[roomId].start = true;
      this.clientToPaddle[client.id] = initializeOpponent(this.width, this.height);
    }
    else
    {
      this.clientToPaddle[client.id] = initializeUser(this.height);
    }
      
    return this.rooms[roomId];
  }

  getClientRoom(client: Socket) {
    const clientRooms = Array.from(client.rooms.values()).filter( (r) => r !== client.id);
    const gameRoom = clientRooms && clientRooms[0];
    if (!gameRoom)
    {
      if (this.clientToRoom[client.id])
        return this.rooms[this.clientToRoom[client.id]];
      return null;
    }
      
    return this.rooms[gameRoom];
  }

  getClientPaddle(clientId: string) {
    return this.clientToPaddle[clientId];
  }

  getRooms() {
    return this.rooms;
  }

  getStartedRooms() {
    const startedRooms: Room[] = Object.values(this.rooms).filter(room => room.start);
    return startedRooms;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  updatePos(clientId: string, paddleY: number) {
    if (this.clientToPaddle[clientId])
      this.clientToPaddle[clientId].y = paddleY;
    return (paddleY);
  }

  update(client) {
    const room = this.getClientRoom(client);
    if (!room)
      return null;
    const ball = room.ball;
    const user1: Paddle = this.getClientPaddle(room.users[0]);
    const user2: Paddle = this.getClientPaddle(room.users[1]);

    return {ball: ball, user1: user1, user2: user2};
  }

  resetBall(room: Room) {
    room.ball.x = this.width / 2;
    room.ball.y = this.height / 2;
    room.ball.velocityX = -room.ball.velocityX;
    room.ball.speed = 7;
  }

  collision(b: Ball, p: Paddle) {
    if (!p)
      return (false);
    const ptop = p.y;
    const pbottom = p.y + p.height;
    const pleft = p.x;
    const pright = p.x + p.width;

    const btop = b.y - b.radius;
    const bbottom = b.y + b.radius;
    const bleft = b.x - b.radius;
    const bright = b.x + b.radius;

    return pleft < bright && ptop < bbottom && pright > bleft && pbottom > btop;
  }

  started(client: Socket) {
    const room = this.getClientRoom(client);
    if (!room)
      return null;
    if (room.start) {
      if (client.id === room.users[0])
        return (0);
      else
        return (1);
    }
    else
      return null;
  }

}