import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GeneratePostDto } from './dto/generate-post.dto';

@Injectable()
export class AiService {
  private ensureDealerHashtag(hashtags: string, dealerName: string) {
    const dealerTag = '#' + dealerName
      .replace(/[^a-zA-Z0-9ÄÖÜäöüß]/g, '')
      .trim();

    if (!hashtags) return dealerTag;

    if (hashtags.toLowerCase().includes(dealerTag.toLowerCase())) {
      return hashtags;
    }

    return `${hashtags} ${dealerTag}`;
  }

  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async generatePost(dto: GeneratePostDto) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a professional German social media marketing agency.

IMPORTANT RULES:
- Generate ALL content in German.
- Never use Turkish.
- Never use English.
- Use native German advertising language.
- Content must look like it was written by a German marketing expert.
- Use attractive headlines.
- Use realistic German promotional campaigns.
- Hashtags must be German.
- Offers must be German.
- Design brief must be written in German.

Return only JSON.

Format:
{
  "title": "",
  "caption": "",
  "hashtags": "",
  "offer": "",
  "designBrief": ""
}
`,
        },
        {
          role: 'user',
          content: `
Dealer:
${dto.dealerName}

Campaign request:
${dto.prompt}

Generate everything in German.
`,
        },
      ],
      temperature: 0.9,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }
}
