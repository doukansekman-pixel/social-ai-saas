import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDealerDto) {
    const { loginEmail, loginPassword, ...dealerData } = dto;

    const dealer = await this.prisma.dealer.create({
      data: dealerData,
    });

    if (loginEmail && loginPassword) {
      const hash = await bcrypt.hash(loginPassword, 10);

      await this.prisma.user.create({
        data: {
          name: dealer.name,
          email: loginEmail,
          passwordHash: hash,
          role: 'DEALER',
          dealerId: dealer.id,
        },
      });
    }

    return dealer;
  }

  findAll() {
    return this.prisma.dealer.findMany({
      include: {
        instagramAccount: true,
        users: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { id },
      include: {
        users: true,
        instagramAccount: true,
      },
    });

    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    return dealer;
  }

  async update(id: string, dto: UpdateDealerDto) {
    await this.findOne(id);

    const {
      loginEmail,
      loginPassword,
      ...rawDealerData
    } = dto as any;

    const allowedKeys = [
      'name',
      'city',
      'contactName',
      'phone',
      'email',
      'instagramUsername',
      'primaryColor',
      'dealerType',
      'isActive',
    ];

    const dealerData: any = {};

    for (const key of allowedKeys) {
      if (rawDealerData[key] !== undefined) {
        dealerData[key] = rawDealerData[key];
      }
    }

    const dealer = await this.prisma.dealer.update({
      where: { id },
      data: dealerData,
    });

    const user = await this.prisma.user.findFirst({
      where: { dealerId: id },
    });

    if (user) {
      const updateUserData: any = {};

      if (dealer.name) {
        updateUserData.name = dealer.name;
      }

      if (loginEmail && String(loginEmail).trim() !== '') {
        updateUserData.email = String(loginEmail).trim();
      }

      if (loginPassword && String(loginPassword).trim() !== '') {
        updateUserData.passwordHash = await bcrypt.hash(String(loginPassword), 10);
      }

      if (Object.keys(updateUserData).length > 0) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: updateUserData,
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.dealer.delete({
      where: { id },
    });
  }
}
