import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PosterService } from './poster.service';
import { RevisePosterDto } from './dto/revise-poster.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @Post('ai-image/:postId')
  generateAiImage(@Param('postId') postId: string) {
    return this.posterService.generateAiImageFromPost(postId);
  }

  @Post('revise/:postId')
  reviseImage(@Param('postId') postId: string, @Body() dto: RevisePosterDto) {
    return this.posterService.reviseAiImage(postId, dto.instruction);
  }

  @Post('chatgpt-image/:postId')
  generateChatgptImage(@Param('postId') postId: string) {
    return this.posterService.generateChatgptImageFromPost(postId);
  }



  @Post('chatgpt-revise/:postId')
  reviseChatgptImage(@Param('postId') postId: string, @Body() dto: RevisePosterDto) {
    return this.posterService.reviseChatgptImageFromPost(postId, dto.instruction);
  }


}
