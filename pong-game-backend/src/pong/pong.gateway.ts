import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { Server, Socket } from 'socket.io'
import { Paddle } from './entities/pong.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pongService: PongService) {}

  gameLoop = () => {
    
    //const rooms = this.pongService.getRooms();
    const startedRooms = this.pongService.getStartedRooms();

    startedRooms.forEach(room => {
      const user1: Paddle = this.pongService.getClientPaddle(room.users[0]);
      const user2: Paddle = this.pongService.getClientPaddle(room.users[1]);
      const width = this.pongService.getWidth();
      const height = this.pongService.getHeight();
      const ball = room.ball;

      if (user1 && user2)
      {
        // Access and process each started room
        if( room.ball.x - room.ball.radius < 0 ){
          user2.score++;
          this.pongService.resetBall(room);
        }else if( room.ball.x + room.ball.radius > width){
          user1.score++;
          this.pongService.resetBall(room);
        }

        // the ball has a velocity
        room.ball.x += room.ball.velocityX;
        room.ball.y += room.ball.velocityY;

        // when the ball collides with bottom and top walls we inverse the y velocity.
        if(ball.y - ball.radius < 0 || ball.y + ball.radius > height){
          ball.velocityY = -ball.velocityY;
        }

        // we check if the ball hit the user or the com paddle
        const player = (ball.x + ball.radius < width/2) ? user1 : user2;
        if(this.pongService.collision(ball, player)){
          // play sound
          // we check where the ball hits the paddle
          let collidePoint = (ball.y - (player.y + player.height/2));
          // normalize the value of collidePoint, we need to get numbers between -1 and 1.
          // -player.height/2 < collide Point < player.height/2
          collidePoint = collidePoint / (player.height/2);
          
          // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
          // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
          // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
          // Math.PI/4 = 45degrees
          let angleRad = (Math.PI/4) * collidePoint;
          
          // change the X and Y velocity direction
          let direction = (ball.x + ball.radius < width/2) ? 1 : -1;
          ball.velocityX = direction * ball.speed * Math.cos(angleRad);
          ball.velocityY = ball.speed * Math.sin(angleRad);
          
          // speed up the ball everytime a paddle hits it.
          ball.speed += 0.1;
        }
        // this.server.to(room.id).emit('updatePong',
        //     {ball: ball, user1: user1, user2:user2});
        // this.server.to(room.users[1]).emit('updatePong',
        //     {ball: ball, user1: user1, user2:user2});
      }

      
    });

    // Use setTimeout or requestAnimationFrame to run the loop at a fixed interval
    setTimeout(() => {
      this.gameLoop();
    //}, 1000); // 60 frames per second
    }, 1000 / 60); // 60 frames per second
  }

  onGatewayInit() {
    console.log('Gateway init');
  }

  afterInit(){
    console.log('Initialized');
    this.gameLoop();
  }

  handleConnection(
    @ConnectedSocket() client: Socket){
    console.log(`client connected ${client.id}`);
  }

  handleDisconnect(
    @ConnectedSocket() client: Socket){
    console.log(`client disconnected ${client.id}`);
    const roomId = this.pongService.deleteClient(client);
    if (roomId) {
      this.server.to(roomId).emit('alone', { id: client.id });
    }
    
  }

  @SubscribeMessage('leaveRoom')
  leave(
    @ConnectedSocket() client: Socket, ) {
      console.log(`client leaving room ${client.id}`);
      const roomId = this.pongService.deleteClient(client);
      if (roomId) {
        this.server.to(roomId).emit('alone', { id: client.id });
      }
    }

  @SubscribeMessage('joinPong')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,) {
    
    const tmp = await this.pongService.join(this.server, client, roomId);

    if (tmp)
      client.emit("roomJoined");
    else
      client.emit("roomJoinError", {error: "Room full, choose another room to play !"});

    return tmp;
  }

  @SubscribeMessage('started')
  started(
    @ConnectedSocket() client: Socket, ) {
    
    const pos = this.pongService.started(client);
    if (pos !== null)
      client.emit('startPong', { pos: pos });
  }

  @SubscribeMessage('updateGame')
  update(
    @ConnectedSocket() client: Socket,
    @MessageBody('paddleY') paddleY: number,) {
    
    this.pongService.updatePos(client.id, paddleY);

    const up = this.pongService.update(client);
    
    if (up)
      client.emit("update", { pong: up });
  }

}
