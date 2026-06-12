import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FilesController } from './files.controller';
import { PublicFilesController } from './public-files.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FilesController, PublicFilesController],
})
export class FilesModule {}
