import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DealersController } from './dealers.controller';
import { DealersService } from './dealers.service';

@Module({
  imports: [AuthModule],
  controllers: [DealersController],
  providers: [DealersService],
})
export class DealersModule {}
