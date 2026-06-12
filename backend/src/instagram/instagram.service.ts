import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectInstagramDto } from './dto/connect-instagram.dto';

type JwtUser = {
  sub: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DEALER';
  dealerId?: string | null;
};

@Injectable()
export class InstagramService {
  constructor(private prisma: PrismaService) {}

  findAll(user: JwtUser) {
    return this.prisma.instagramAccount.findMany({
      where:
        user.role === 'DEALER'
          ? { dealerId: user.dealerId || '' }
          : undefined,
      include: { dealer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  connect(dto: ConnectInstagramDto, user: JwtUser) {
    let dealerId = dto.dealerId;

    if (user.role === 'DEALER') {
      if (!user.dealerId) {
        throw new ForbiddenException('Dealer account has no dealerId');
      }
      dealerId = user.dealerId;
    }

    return this.saveInstagramConnection({
      dealerId,
      instagramUsername: dto.instagramUsername,
      instagramAccountId: dto.instagramAccountId,
      facebookPageId: dto.facebookPageId,
      accessToken: dto.accessToken,
    });
  }

  disconnect(dealerId: string, user: JwtUser) {
    let targetDealerId = dealerId;

    if (user.role === 'DEALER') {
      if (!user.dealerId) {
        throw new ForbiddenException('Dealer account has no dealerId');
      }
      targetDealerId = user.dealerId;
    }

    return this.prisma.instagramAccount.update({
      where: { dealerId: targetDealerId },
      data: {
        isConnected: false,
        accessToken: null,
      },
    });
  }

  getOAuthUrl(dealerId: string, user: JwtUser) {
    let targetDealerId = dealerId;

    if (user.role === 'DEALER') {
      if (!user.dealerId) {
        throw new ForbiddenException('Dealer account has no dealerId');
      }
      targetDealerId = user.dealerId;
    }

    const state = Buffer.from(
      JSON.stringify({ dealerId: targetDealerId }),
    ).toString('base64url');

    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID || '',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
      state,
      response_type: 'code',
      scope: 'instagram_business_basic,instagram_business_content_publish',
    });

    return {
      url: `https://www.instagram.com/oauth/authorize?${params.toString()}`,
    };
  }

  async handleOAuthCallback(code: string, state: string) {
    const decoded = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    );

    const dealerId = decoded.dealerId;

    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID || '',
        client_secret: process.env.INSTAGRAM_APP_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
        code,
      }),
    });

    const tokenData: any = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error(JSON.stringify(tokenData));
    }

    const shortToken = tokenData.access_token;
    const instagramUserId = tokenData.user_id;

    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortToken}`,
    );

    const longData: any = await longRes.json();
    const accessToken = longData.access_token || shortToken;

    const meRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`,
    );

    const meData: any = await meRes.json();

    if (!meData.id) {
      throw new Error(JSON.stringify(meData));
    }

    await this.saveInstagramConnection({
      dealerId,
      instagramUsername: meData.username,
      instagramAccountId: meData.id || String(instagramUserId),
      facebookPageId: null,
      accessToken,
    });

    return true;
  }

  async publishPost(postId: string, user: JwtUser) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        dealer: {
          include: {
            instagramAccount: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post bulunamadi');
    }

    if (!post.imageUrl) {
      throw new Error('Post gorseli yok');
    }

    if (user.role === 'DEALER' && post.dealerId !== user.dealerId) {
      throw new ForbiddenException('Bu post bu bayiye ait degil');
    }

    const account = post.dealer.instagramAccount;

    if (!account || !account.isConnected || !account.accessToken || !account.instagramAccountId) {
      throw new Error('Bu bayinin Instagram hesabi bagli degil');
    }

    const imageUrl = `${process.env.API_PUBLIC_URL || 'https://api.socialai-network.com'}/files/public/posts/${post.id}`;
    const caption = `${post.caption}

${post.hashtags}`;

    const createRes = await fetch(
      `https://graph.instagram.com/v21.0/${account.instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: account.accessToken,
        }),
      },
    );

    const createData: any = await createRes.json();

    if (!createData.id) {
      throw new Error(JSON.stringify(createData));
    }

    await new Promise((r) => setTimeout(r, 15000));

    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${account.instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: account.accessToken,
        }),
      },
    );

    const publishData: any = await publishRes.json();

    if (!publishData.id) {
      throw new Error(JSON.stringify(publishData));
    }

    await this.prisma.post.update({
      where: { id: post.id },
      data: { status: 'published' },
    });

    return {
      success: true,
      instagramMediaId: publishData.id,
    };
  }

  private saveInstagramConnection(data: {
    dealerId: string;
    instagramUsername?: string | null;
    instagramAccountId?: string | null;
    facebookPageId?: string | null;
    accessToken?: string | null;
  }) {
    return this.prisma.instagramAccount.upsert({
      where: { dealerId: data.dealerId },
      update: {
        instagramUsername: data.instagramUsername,
        instagramAccountId: data.instagramAccountId,
        facebookPageId: data.facebookPageId,
        accessToken: data.accessToken,
        isConnected: true,
      },
      create: {
        dealerId: data.dealerId,
        instagramUsername: data.instagramUsername,
        instagramAccountId: data.instagramAccountId,
        facebookPageId: data.facebookPageId,
        accessToken: data.accessToken,
        isConnected: true,
      },
    });
  }
}
