import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private toHashtag(value: string) {
    return (
      '#' +
      value
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/Ä/g, 'Ae')
        .replace(/Ö/g, 'Oe')
        .replace(/Ü/g, 'Ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-zA-Z0-9]/g, '')
    );
  }

  private ensureHashtags(base: string, required: string[]) {
    let result = base || '';

    for (const tag of required) {
      if (!tag || tag === '#') continue;

      if (!result.toLowerCase().includes(tag.toLowerCase())) {
        result = `${result} ${tag}`.trim();
      }
    }

    return result;
  }

  async create(dto: CreatePostDto, user?: any) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { id: dto.dealerId },
    });

    const requiredTags: string[] = [];

    if (dealer?.name) {
      requiredTags.push(this.toHashtag(dealer.name));
    }

    if ((dealer as any)?.dealerType === 'TIPICO') {
      requiredTags.push('#Tipico', '#TipicoDeutschland');
    }

    if ((dealer as any)?.dealerType === 'TIPWIN') {
      requiredTags.push('#Tipwin', '#TipwinDeutschland');
    }

    const text = `${dto.title} ${dto.caption} ${dto.offer} ${dto.designBrief || ''}`;

    if (/wm 2026/i.test(text)) requiredTags.push('#WM2026');
    if (/türkei|turkei|turkey/i.test(text)) requiredTags.push('#Tuerkei');
    if (/deutschland|germany/i.test(text)) requiredTags.push('#Deutschland');
    if (/spanien|spain/i.test(text)) requiredTags.push('#Spanien');
    if (/brasilien|brazil/i.test(text)) requiredTags.push('#Brasilien');
    if (/usa/i.test(text)) requiredTags.push('#USA');

    if (/fußball|fussball|football|soccer|wm|bundesliga|dfb/i.test(text)) {
      requiredTags.push('#Fussball', '#Sportwetten', '#Tipico');
    }

    const hashtags = this.ensureHashtags(dto.hashtags, requiredTags);

    return this.prisma.post.create({
      data: {
        ...dto,
        hashtags,
      },
    });
  }

  findAll(user?: any) {
    return this.prisma.post.findMany({
      where:
        user?.role === 'DEALER'
          ? {
              dealerId: user.dealerId,
            }
          : undefined,
      include: {
        dealer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
