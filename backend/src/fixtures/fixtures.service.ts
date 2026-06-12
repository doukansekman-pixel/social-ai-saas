import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PDFParser = require('pdf2json');

type JwtUser = {
  role: 'SUPER_ADMIN' | 'DEALER';
};

@Injectable()
export class FixturesService {
  constructor(private prisma: PrismaService) {}

  private async extractText(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData.parserError);
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        let text = '';

        for (const page of pdfData.Pages || []) {
          for (const item of page.Texts || []) {
            for (const run of item.R || []) {
              text += decodeURIComponent(run.T) + ' ';
            }
            text += '\n';
          }
          text += '\n';
        }

        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });
  }

  private detectSport(line: string) {
    if (line.startsWith('Fußball')) return 'Fußball';
    if (line.startsWith('Basketball')) return 'Basketball';
    if (line.startsWith('Eishockey')) return 'Eishockey';
    if (line.startsWith('Handball')) return 'Handball';
    if (line.startsWith('Rugby')) return 'Rugby';
    if (line.startsWith('Baseball')) return 'Baseball';
    if (line.startsWith('Motorsport')) return 'Motorsport';
    return null;
  }

  private extractMatchesFromText(text: string) {
    const normalized = text.replace(/\s+/g, ' ').trim();

    const matches: any[] = [];

    const regex =
      /([A-Z0-9]{1,8})\s+(Mo|Di|Mi|Do|Fr|Sa|So)\s+([0-9]{2}:[0-9]{2}|[0-9]{2}\.[0-9]{2})\s+([A-Za-zÄÖÜäöüß0-9 .&'\-]+?)\s+:\s+([A-Za-zÄÖÜäöüß0-9 .&'\-]+?)(?=\s+\d|\s+[A-Z0-9]{1,8}\s+(?:Mo|Di|Mi|Do|Fr|Sa|So)|$)/g;

    let match;

    while ((match = regex.exec(normalized)) !== null) {
      const homeTeam = match[4].trim();
      const awayTeam = match[5].trim();

      if (homeTeam.length < 2 || awayTeam.length < 2) continue;

      matches.push({
        matchCode: match[1],
        matchDay: match[2],
        matchDateOrTime: match[3],
        homeTeam,
        awayTeam,
      });
    }

    return matches;
  }

  private importanceFor(homeTeam: string, awayTeam: string, competition: string) {
    const text = `${homeTeam} ${awayTeam} ${competition}`.toLowerCase();

    let score = 3;

    const bigTerms = [
      'türkei',
      'deutschland',
      'brasilien',
      'argentinien',
      'spanien',
      'frankreich',
      'england',
      'italien',
      'niederlande',
      'portugal',
      'uruguay',
      'belgien',
      'mexiko',
      'usa',
      'bayern',
      'dortmund',
      'galatasaray',
      'fenerbahce',
      'fenerbahçe',
      'besiktas',
      'beşiktaş',
      'wm 2026',
      'weltmeisterschaft',
      'champions league',
      'finale',
      'playoff',
    ];

    for (const term of bigTerms) {
      if (text.includes(term)) score += 2;
    }

    return Math.min(score, 10);
  }

  async uploadPdf(file: any, user: JwtUser) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admin can upload fixtures');
    }

    await this.prisma.weeklyMatch.deleteMany({});

    const text = await this.extractText(file.buffer);

    const normalizedText = text.replace(/\s+/g, ' ').trim();

    const footballSections = normalizedText
      .split(/(?=Fußball\s*-\s*)/g)
      .filter((section) => section.startsWith('Fußball'));

    const matches: any[] = [];

    for (const section of footballSections) {
      const titleMatch = section.match(/^Fußball\s*-\s*([A-Za-zÄÖÜäöüß0-9 .,\-\/]+)/);
      let competition = titleMatch
        ? titleMatch[1].replace(/\s+/g, ' ').trim()
        : 'Unbekannt';

      competition = competition
        .replace(/\s+Gruppe.*$/i, '')
        .replace(/\s+DFB-Pokal.*$/i, '')
        .replace(/\s+La Liga.*$/i, '')
        .replace(/\s+Veikkausliiga.*$/i, '')
        .trim();

      const rawMatches = this.extractMatchesFromText(section);

      for (const item of rawMatches) {
        const matchDate = item.matchDateOrTime.includes('.')
          ? item.matchDateOrTime
          : null;

        const matchTime = item.matchDateOrTime.includes(':')
          ? item.matchDateOrTime
          : null;

        matches.push({
          sourceName: file.originalname,
          sport: 'Fußball',
          competition,
          matchCode: item.matchCode,
          matchDay: item.matchDay,
          matchDate,
          matchTime,
          homeTeam: item.homeTeam,
          awayTeam: item.awayTeam,
          importance: this.importanceFor(
            item.homeTeam,
            item.awayTeam,
            competition,
          ),
          aiReason: null,
        });
      }
    }

    if (matches.length === 0) {
      return {
        imported: 0,
        message: 'PDF icinden mac bulunamadi',
        sample: text.slice(0, 1000),
      };
    }

    await this.prisma.weeklyMatch.createMany({
      data: matches,
    });

    return {
      imported: matches.length,
      matches,
    };
  }

  findAll() {
    return this.prisma.weeklyMatch.findMany({
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });
  }
}
