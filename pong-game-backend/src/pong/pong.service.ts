import { Injectable } from '@nestjs/common';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { Pong, Ball, initializeBall, Paddle, initializeOpponent, initializeUser, Room } from './entities/pong.entity';
import { Server, Socket } from 'socket.io'

@Injectable()
export class PongService {

  nbRoom: number = 0;

  rooms: Room[] = [];
  clientToRoom = {};

  join(client: Socket) {
    this.rooms[this.nbRoom].users.push(client.id);
    this.clientToRoom[client.id] = this.nbRoom;
    client.join(String(this.nbRoom));

    const tmp: number = this.nbRoom;
    if (this.rooms[this.nbRoom].users.length === 2)
      this.nbRoom += 1;

    return this.nbRoom;
  }

  getClientRoom(clientId: string) {
    return this.clientToRoom[clientId];
  }

  updatePos(clientId: string, paddle: Paddle) {
    const tmp: number = this.getClientRoom(clientId);

    this.rooms[tmp].pong.users[clientId] = paddle;
    return (paddle);
  }

}
