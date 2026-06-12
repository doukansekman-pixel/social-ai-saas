import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { renderBettingPoster } from './poster-renderer';

type JwtUser = {
  sub: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DEALER';
  dealerId?: string | null;
};

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private prisma: PrismaService) {}

  @Get('posts/:postId')
  async getPostImage(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtUser,
    @Res() res: Response,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { dealer: true },
    });

    if (!post || !post.imageUrl) throw new NotFoundException('Image not found');

    if (user.role === 'DEALER' && post.dealerId !== user.dealerId) {
      throw new ForbiddenException('Forbidden');
    }

    const filePath = join(process.cwd(), 'uploads', 'posts', basename(post.imageUrl));
    if (!existsSync(filePath)) throw new NotFoundException('File not found');

    const buffer = await renderBettingPoster(filePath, post);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  }
}
