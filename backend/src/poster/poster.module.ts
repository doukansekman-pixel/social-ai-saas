import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PosterController } from './poster.controller';
import { PosterService } from './poster.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PosterController],
  providers: [PosterService],
})
export class PosterModule {}
