import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';

@Module({
  imports: [AuthModule],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
