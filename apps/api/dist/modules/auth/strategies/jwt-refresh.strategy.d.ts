import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
interface JwtPayload {
    sub: string;
    email: string;
    username: string;
}
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(req: Request, payload: JwtPayload): Promise<{
        id: string;
        email: string;
        username: string;
        refreshToken: any;
    }>;
}
export {};
