import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FixturesController } from './fixtures.controller';
import { FixturesService } from './fixtures.service';

@Module({
  imports: [MulterModule.register(), PrismaModule, AuthModule],
  controllers: [FixturesController],
  providers: [FixturesService],
})
export class FixturesModule {}
