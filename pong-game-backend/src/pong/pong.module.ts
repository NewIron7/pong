import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';

@Module({
  providers: [PongGateway, PongService],
})
export class PongModule {}
