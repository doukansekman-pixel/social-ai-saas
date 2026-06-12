import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DealersModule } from './dealers/dealers.module';
import { InstagramModule } from './instagram/instagram.module';
import { AiModule } from './ai/ai.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';
import { FixturesModule } from './fixtures/fixtures.module';
import { PosterModule } from './poster/poster.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DealersModule,
    InstagramModule,
    AiModule,
    PostsModule,
    FilesModule,
    FixturesModule,
    PosterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
