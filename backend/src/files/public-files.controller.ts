import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { renderBettingPoster } from './poster-renderer';

@Controller('files/public')
export class PublicFilesController {
  constructor(private prisma: PrismaService) {}

  @Get('posts/:postId')
  async getPublicPostImage(@Param('postId') postId: string, @Res() res: Response) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { dealer: true },
    });

    if (!post || !post.imageUrl) throw new NotFoundException('Image not found');

    const filePath = join(process.cwd(), 'uploads', 'posts', basename(post.imageUrl));
    if (!existsSync(filePath)) throw new NotFoundException('File not found');

    const buffer = await renderBettingPoster(filePath, post);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  }
}
