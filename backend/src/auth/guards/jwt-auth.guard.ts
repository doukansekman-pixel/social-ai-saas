import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

function getCookie(header: string | undefined, name: string) {
  if (!header) return null;

  const match = header
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    let token: string | null = null;

    if (authHeader) {
      const [type, value] = authHeader.split(' ');
      if (type === 'Bearer' && value) {
        token = value;
      }
    }

    if (!token) {
      token = getCookie(request.headers.cookie, 'social_ai_token');
    }

    if (!token && request.query?.token) {
      token = String(request.query.token);
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'super-secret-key',
      });

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
