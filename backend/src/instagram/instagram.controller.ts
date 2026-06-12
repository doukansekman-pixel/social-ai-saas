import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { ConnectInstagramDto } from './dto/connect-instagram.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.instagramService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect')
  connect(@Body() dto: ConnectInstagramDto, @CurrentUser() user: any) {
    return this.instagramService.connect(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disconnect/:dealerId')
  disconnect(@Param('dealerId') dealerId: string, @CurrentUser() user: any) {
    return this.instagramService.disconnect(dealerId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('oauth/start')
  startOAuth(@Query('dealerId') dealerId: string, @CurrentUser() user: any) {
    return this.instagramService.getOAuthUrl(dealerId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('publish/:postId')
  publish(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.instagramService.publishPost(postId, user);
  }

  @Get('oauth/callback')
  @Redirect()
  async callback(@Query('code') code: string, @Query('state') state: string) {
    try {
      await this.instagramService.handleOAuthCallback(code, state);

      return {
        url: `${process.env.FRONTEND_URL}/instagram?connected=1`,
      };
    } catch (error) {
      return {
        url: `${process.env.FRONTEND_URL}/instagram?connected=0`,
      };
    }
  }
}
