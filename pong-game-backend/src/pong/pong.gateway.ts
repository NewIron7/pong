import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { PongService } from './pong.service';
import { CreatePongDto } from './dto/create-pong.dto';
import { UpdatePongDto } from './dto/update-pong.dto';
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

  constructor(private readonly pongService: PongService) {}

  @SubscribeMessage('joinPong')
  join(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,) {
    
    return this.pongService.join(client);
  }

  @SubscribeMessage('updatePong')
  update(
    @ConnectedSocket() client: Socket,
    @MessageBody('paddle') paddle: Paddle,) {
    
    return this.pongService.updatePos(client.id, paddle);
  }

}
