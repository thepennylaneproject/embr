import { PrismaService } from '../../prisma/prisma.service';
import { CreateContentRuleDto } from '../dto/safety.dto';
import { FilterAction as PrismaFilterAction } from '@prisma/client';
export interface FilterResult {
    allowed: boolean;
    action: PrismaFilterAction | null;
    matchedRules: string[];
    score: number;
}
export declare class ContentFilterService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly SPAM_PATTERNS;
    private readonly HARASSMENT_PATTERNS;
    private readonly NSFW_PATTERNS;
    private readonly SUSPICIOUS_LINK_PATTERNS;
    filterContent(content: string, userId?: string): Promise<FilterResult>;
    createRule(dto: CreateContentRuleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        action: import(".prisma/client").$Enums.FilterAction;
        caseSensitive: boolean;
        keywords: string[];
        enabled: boolean;
    }>;
    getRules(includeDisabled?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        action: import(".prisma/client").$Enums.FilterAction;
        caseSensitive: boolean;
        keywords: string[];
        enabled: boolean;
    }[]>;
    updateRule(ruleId: string, updates: Partial<CreateContentRuleDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        action: import(".prisma/client").$Enums.FilterAction;
        caseSensitive: boolean;
        keywords: string[];
        enabled: boolean;
    }>;
    deleteRule(ruleId: string): Promise<{
        success: boolean;
    }>;
    getStats(days?: number): Promise<{
        period: string;
        total: number;
        byAction: {
            blocked: number;
            flagged: number;
            hidden: number;
        };
        topRules: any[];
    }>;
    checkUserSpamScore(userId: string): Promise<number>;
    private checkRule;
    private hasExcessiveCaps;
    private hasRepeatedChars;
    private hasExcessiveLinks;
    private getActionWeight;
    private getActionSeverity;
    private escapeRegex;
    private logFilterEvent;
    private aggregateRuleMatches;
}
