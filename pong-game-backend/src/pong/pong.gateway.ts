import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { Server, Socket } from 'socket.io'
import { Paddle } from './entities/pong.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PongGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pongService: PongService) {
    this.gameLoop();
  }

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
        this.server.to(room.users[0]).emit('updatePong',
            {ball: ball, user1: user1, user2:user2});
        this.server.to(room.users[1]).emit('updatePong',
            {ball: ball, user1: user1, user2:user2});
      }

      
    });

    // Use setTimeout or requestAnimationFrame to run the loop at a fixed interval
    setTimeout(() => {
      this.gameLoop();
    //}, 1000); // 60 frames per second
    }, 1000 / 60); // 60 frames per second
  }

  @SubscribeMessage('joinPong')
  join(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,) {
    
    const tmp = this.pongService.join(client, roomId);

    if (tmp && tmp.start)
    {
      this.server.to(tmp.users[0]).emit('startPong', 0);
      this.server.to(tmp.users[1]).emit('startPong', 1);
    }
    return tmp;
  }

  @SubscribeMessage('updatePaddle')
  update(
    @ConnectedSocket() client: Socket,
    @MessageBody('paddleY') paddleY: number,) {
    
    return this.pongService.updatePos(client.id, paddleY);
  }

  @SubscribeMessage('disconnect')
  hangUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,){
    
    this.pongService.deleteClient(client);
  }

  @SubscribeMessage('disconnecting')
  hangingUp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,){

    this.pongService.deleteClient(client);

  }

}
