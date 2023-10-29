import { Injectable } from '@nestjs/common';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
import { Ball, initializeBall, Paddle, initializeOpponent, initializeUser, Room } from './entities/pong.entity';
import { Server, Socket } from 'socket.io'

@Injectable()
export class PongService {

  //nbRoom: number = 0;

  width: number = 600;
  height: number = 400;

  rooms: Record<number, Room> = {};
  clientToRoom = {};
  clientToPaddle = {};

  deleteClient(client: Socket) {
    const roomId = this.getClientRoom(client.id);
    if (!roomId)
      return ;
    let room = this.rooms[roomId];
    console.log(this.rooms);
    if (room.start)
    {
      let pos: number;
      if (room.users[0] === client.id)
        pos = 1;
      else
        pos = 0;

      room = {
        start: false,
        id: room.id,
        users: [room.users[pos]],
        ball: initializeBall(this.width, this.height),
      }
    }
    else
      delete this.rooms[roomId];

    delete this.clientToPaddle[client.id];
    delete this.clientToRoom[client.id];
    console.log(this.rooms);
  }

  join(client: Socket, roomId: string) {

    console.log(client.id);
    console.log(roomId);
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        start: false,
        id: roomId,
        users: [],
        ball: initializeBall(this.width, this.height),
      };
    }
    else if (this.rooms[roomId].users.length === 2)
    {
      console.log('This room is full');
      return (null);
    }
    else if (this.rooms[roomId].users[0] === client.id)
    {
      console.log('Room already joined');
      return (this.rooms[roomId]);
    }

    this.rooms[roomId].users.push(client.id);

    this.clientToRoom[client.id] = roomId;
    
    //client.join(roomId);

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

  getClientRoom(clientId: string) {
    return this.clientToRoom[clientId];
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

}