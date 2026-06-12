import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeneratePostDto } from './dto/generate-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-post')
  generatePost(@Body() dto: GeneratePostDto) {
    return this.aiService.generatePost(dto);
  }
}
