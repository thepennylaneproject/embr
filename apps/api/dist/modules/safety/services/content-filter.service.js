"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentFilterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ContentFilterService = class ContentFilterService {
    constructor(prisma) {
        this.prisma = prisma;
        this.SPAM_PATTERNS = [
            /\b(viagra|cialis|casino|lottery|winner|prize|free\s+money)\b/i,
            /\b(click\s+here|buy\s+now|limited\s+time|act\s+now)\b/i,
            /\b(make\s+money|work\s+from\s+home|easy\s+cash)\b/i,
            /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)/i,
        ];
        this.HARASSMENT_PATTERNS = [
            /\b(kill\s+yourself|kys|hang\s+yourself)\b/i,
            /\b(worthless|pathetic|loser)\b.*\b(die|suicide)\b/i,
        ];
        this.NSFW_PATTERNS = [
            /\b(porn|xxx|nsfw|18\+)\b/i,
        ];
        this.SUSPICIOUS_LINK_PATTERNS = [
            /bit\.ly|tinyurl|shorturl/i,
            /\b(discord\.gg|t\.me)\b/i,
        ];
    }
    async filterContent(content, userId) {
        const result = {
            allowed: true,
            action: null,
            matchedRules: [],
            score: 0,
        };
        const rules = await this.prisma.contentRule.findMany({
            where: { enabled: true },
        });
        const builtInChecks = [
            { patterns: this.SPAM_PATTERNS, name: 'Spam Detection', weight: 50 },
            { patterns: this.HARASSMENT_PATTERNS, name: 'Harassment Detection', weight: 100 },
            { patterns: this.NSFW_PATTERNS, name: 'NSFW Detection', weight: 30 },
            { patterns: this.SUSPICIOUS_LINK_PATTERNS, name: 'Suspicious Links', weight: 40 },
        ];
        for (const check of builtInChecks) {
            for (const pattern of check.patterns) {
                if (pattern.test(content)) {
                    result.matchedRules.push(check.name);
                    result.score += check.weight;
                }
            }
        }
        for (const rule of rules) {
            const matched = this.checkRule(content, rule);
            if (matched) {
                result.matchedRules.push(rule.name);
                result.score += this.getActionWeight(rule.action);
                if (!result.action || this.getActionSeverity(rule.action) > this.getActionSeverity(result.action)) {
                    result.action = rule.action;
                }
            }
        }
        if (this.hasExcessiveCaps(content)) {
            result.matchedRules.push('Excessive Caps');
            result.score += 20;
        }
        if (this.hasRepeatedChars(content)) {
            result.matchedRules.push('Spam Characters');
            result.score += 15;
        }
        if (this.hasExcessiveLinks(content)) {
            result.matchedRules.push('Excessive Links');
            result.score += 30;
        }
        if (result.score >= 100) {
            result.action = client_1.FilterAction.BLOCK;
            result.allowed = false;
        }
        else if (result.score >= 50) {
            result.action = client_1.FilterAction.FLAG;
            result.allowed = true;
        }
        else if (result.score >= 30) {
            result.action = client_1.FilterAction.HIDE;
            result.allowed = true;
        }
        if (result.score > 0 && userId) {
            await this.logFilterEvent(userId, content, result);
        }
        return result;
    }
    async createRule(dto) {
        const rule = await this.prisma.contentRule.create({
            data: {
                name: dto.name,
                description: dto.description,
                keywords: dto.keywords,
                action: dto.action,
                caseSensitive: dto.caseSensitive,
                enabled: dto.enabled,
            },
        });
        return rule;
    }
    async getRules(includeDisabled = false) {
        const where = includeDisabled ? {} : { enabled: true };
        const rules = await this.prisma.contentRule.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return rules;
    }
    async updateRule(ruleId, updates) {
        const data = { ...updates };
        if (updates.action) {
            data.action = updates.action;
        }
        const rule = await this.prisma.contentRule.update({
            where: { id: ruleId },
            data,
        });
        return rule;
    }
    async deleteRule(ruleId) {
        await this.prisma.contentRule.delete({
            where: { id: ruleId },
        });
        return { success: true };
    }
    async getStats(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const [totalFiltered, blocked, flagged, hidden, byRule] = await Promise.all([
            this.prisma.filterLog.count({
                where: { createdAt: { gte: since } },
            }),
            this.prisma.filterLog.count({
                where: {
                    createdAt: { gte: since },
                    action: client_1.FilterAction.BLOCK,
                },
            }),
            this.prisma.filterLog.count({
                where: {
                    createdAt: { gte: since },
                    action: client_1.FilterAction.FLAG,
                },
            }),
            this.prisma.filterLog.count({
                where: {
                    createdAt: { gte: since },
                    action: client_1.FilterAction.HIDE,
                },
            }),
            this.prisma.filterLog.groupBy({
                by: ['matchedRules'],
                where: { createdAt: { gte: since } },
                _count: true,
            }),
        ]);
        return {
            period: `Last ${days} days`,
            total: totalFiltered,
            byAction: {
                blocked,
                flagged,
                hidden,
            },
            topRules: this.aggregateRuleMatches(byRule),
        };
    }
    async checkUserSpamScore(userId) {
        const recentContent = await this.prisma.filterLog.findMany({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
        });
        let score = 0;
        score += recentContent.length * 10;
        for (const log of recentContent) {
            if (log.action === client_1.FilterAction.BLOCK)
                score += 50;
            if (log.action === client_1.FilterAction.FLAG)
                score += 30;
            if (log.action === client_1.FilterAction.HIDE)
                score += 15;
        }
        if (recentContent.length > 10) {
            score += (recentContent.length - 10) * 20;
        }
        return Math.min(score, 1000);
    }
    checkRule(content, rule) {
        const text = rule.caseSensitive ? content : content.toLowerCase();
        for (const keyword of rule.keywords) {
            const searchTerm = rule.caseSensitive ? keyword : keyword.toLowerCase();
            const regex = new RegExp(`\\b${this.escapeRegex(searchTerm)}\\b`, 'g');
            if (regex.test(text)) {
                return true;
            }
        }
        return false;
    }
    hasExcessiveCaps(content) {
        const letters = content.replace(/[^a-zA-Z]/g, '');
        if (letters.length < 10)
            return false;
        const capsCount = (content.match(/[A-Z]/g) || []).length;
        const ratio = capsCount / letters.length;
        return ratio > 0.7;
    }
    hasRepeatedChars(content) {
        return /(.)\1{4,}/.test(content);
    }
    hasExcessiveLinks(content) {
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = content.match(urlRegex) || [];
        return urls.length > 3;
    }
    getActionWeight(action) {
        switch (action) {
            case client_1.FilterAction.BLOCK:
                return 100;
            case client_1.FilterAction.FLAG:
                return 50;
            case client_1.FilterAction.HIDE:
                return 30;
            default:
                return 0;
        }
    }
    getActionSeverity(action) {
        switch (action) {
            case client_1.FilterAction.BLOCK:
                return 3;
            case client_1.FilterAction.FLAG:
                return 2;
            case client_1.FilterAction.HIDE:
                return 1;
            default:
                return 0;
        }
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    async logFilterEvent(userId, content, result) {
        await this.prisma.filterLog.create({
            data: {
                userId,
                content: content.substring(0, 500),
                action: result.action,
                score: result.score,
                matchedRules: result.matchedRules,
            },
        });
    }
    aggregateRuleMatches(byRule) {
        const ruleCounts = {};
        for (const item of byRule) {
            for (const rule of item.matchedRules) {
                ruleCounts[rule] = (ruleCounts[rule] || 0) + item._count;
            }
        }
        return Object.entries(ruleCounts)
            .map(([rule, count]) => ({ rule, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
};
exports.ContentFilterService = ContentFilterService;
exports.ContentFilterService = ContentFilterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentFilterService);
//# sourceMappingURL=content-filter.service.js.map