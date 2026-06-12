import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';

@Injectable()
export class PosterService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(private prisma: PrismaService) {}

  private async createImage(postId: string, revisionInstruction?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { dealer: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userPrompt = post.designBrief || post.title || '';

    const prompt = revisionInstruction
      ? `${userPrompt}\n\n${revisionInstruction}`
      : `${userPrompt}`;

    const result = await this.openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1536',
      quality: 'medium',
    });

    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error('Image generation failed');
    }

    const filename = `${randomUUID()}.png`;
    const outputPath = join(process.cwd(), 'uploads', 'posts', filename);

    writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));

    const imageUrl = `/uploads/posts/${filename}`;

    await this.prisma.post.update({
      where: { id: post.id },
      data: {
        imagePrompt: prompt,
        imageUrl,
      },
    });

    return {
      postId: post.id,
      imageUrl,
      prompt,
    };
  }


  async generateChatgptImageFromPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { dealer: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userPrompt = (post.designBrief || post.title || '').trim();

    if (!userPrompt) {
      throw new Error('Gorsel komutu bos');
    }

    const filename = `${randomUUID()}.png`;
    const outputDir = join(process.cwd(), 'uploads', 'posts');
    const outputPath = join(outputDir, filename);

    mkdirSync(outputDir, { recursive: true });

    await this.prisma.post.update({
      where: { id: post.id },
      data: {
        imagePrompt: userPrompt,
        status: 'generating',
      },
    });

    const args = [
      userPrompt,
      '--backend',
      'codex',
      '--size',
      '1024x1536',
      '-o',
      outputPath,
    ];

    const child = spawn('chatgpt-imagegen', args, {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
      env: process.env,
    });

    child.unref();

    child.on('exit', async (code) => {
      try {
        if (code === 0) {
          await this.prisma.post.update({
            where: { id: post.id },
            data: {
              imageUrl: `/uploads/posts/${filename}`,
              status: 'draft',
            },
          });
        } else {
          await this.prisma.post.update({
            where: { id: post.id },
            data: { status: 'image_failed' },
          });
        }
      } catch (error) {
        console.error('ChatGPT image post update failed', error);
      }
    });

    return {
      postId: post.id,
      imageUrl: null,
      status: 'generating',
      message: 'ChatGPT gorsel uretimi baslatildi. 1-3 dakika sonra takvimde gorunur.',
      prompt: userPrompt,
    };
  }


  generateAiImageFromPost(postId: string) {
    return this.createImage(postId);
  }


  async reviseChatgptImageFromPost(postId: string, instruction: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { dealer: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const basePrompt = (post.imagePrompt || post.designBrief || post.title || '').trim();
    const finalPrompt = `${basePrompt}

Duzeltme istegi:
${instruction}

Onceki fikri koru ama bu duzeltmeye gore yeni bir gorsel uret.`;

    const filename = `${randomUUID()}.png`;
    const outputDir = join(process.cwd(), 'uploads', 'posts');
    const outputPath = join(outputDir, filename);

    mkdirSync(outputDir, { recursive: true });

    await this.prisma.post.update({
      where: { id: post.id },
      data: {
        imagePrompt: finalPrompt,
        status: 'generating',
      },
    });

    const child = spawn('chatgpt-imagegen', [
      finalPrompt,
      '--backend',
      'codex',
      '--size',
      '1024x1536',
      '-o',
      outputPath,
    ], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
      env: process.env,
    });

    child.unref();

    child.on('exit', async (code) => {
      try {
        if (code === 0) {
          await this.prisma.post.update({
            where: { id: post.id },
            data: {
              imageUrl: `/uploads/posts/${filename}`,
              status: 'draft',
            },
          });
        } else {
          await this.prisma.post.update({
            where: { id: post.id },
            data: { status: 'image_failed' },
          });
        }
      } catch (error) {
        console.error('ChatGPT revise image post update failed', error);
      }
    });

    return {
      postId: post.id,
      imageUrl: null,
      status: 'generating',
      message: 'ChatGPT gorsel duzeltme baslatildi.',
      prompt: finalPrompt,
    };
  }


  reviseAiImage(postId: string, instruction: string) {
    return this.createImage(postId, instruction);
  }
}
