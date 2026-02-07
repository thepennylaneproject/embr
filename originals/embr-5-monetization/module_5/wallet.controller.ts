/**
 * Wallet Controller - REST API endpoints for monetization
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { WalletService } from '../services/wallet.service';
import {
  GetTransactionsDto,
  SendTipDto,
  RequestPayoutDto,
  ApprovePayoutDto,
  RejectPayoutDto,
} from '../dto/wallet.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // ==========================================================================
  // WALLET ENDPOINTS
  // ==========================================================================

  @Get('balance')
  async getBalance(@Request() req) {
    return this.walletService.getWalletBalance(req.user.id);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query() query: GetTransactionsDto,
  ) {
    const filters: any = {};

    if (query.type) {
      filters.type = query.type.split(',');
    }

    if (query.status) {
      filters.status = query.status.split(',');
    }

    if (query.startDate) {
      filters.startDate = query.startDate;
    }

    if (query.endDate) {
      filters.endDate = query.endDate;
    }

    return this.walletService.getTransactions(
      req.user.id,
      query.page,
      query.perPage,
      filters,
    );
  }

  // ==========================================================================
  // TIP ENDPOINTS
  // ==========================================================================

  @Post('tip')
  @HttpCode(HttpStatus.OK)
  async sendTip(@Request() req, @Body() body: SendTipDto) {
    return this.walletService.sendTip(
      req.user.id,
      body.recipientId,
      body.amount,
      body.postId,
      body.message,
      body.isAnonymous,
    );
  }

  @Get('tips/sent')
  async getSentTips(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('perPage', new ParseIntPipe({ optional: true })) perPage: number = 20,
  ) {
    return this.walletService.getTransactions(req.user.id, page, perPage, {
      type: ['tip_sent' as any],
    });
  }

  @Get('tips/received')
  async getReceivedTips(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('perPage', new ParseIntPipe({ optional: true })) perPage: number = 20,
  ) {
    return this.walletService.getTransactions(req.user.id, page, perPage, {
      type: ['tip_received' as any],
    });
  }

  // ==========================================================================
  // STRIPE CONNECT ENDPOINTS
  // ==========================================================================

  @Post('connect/create')
  async createConnectAccount(@Request() req) {
    return this.walletService.createStripeConnectAccount(req.user.id);
  }

  @Post('connect/refresh')
  async refreshConnectLink(@Request() req) {
    return this.walletService.refreshStripeConnectLink(req.user.id);
  }

  @Get('connect/status')
  async updateConnectStatus(@Request() req) {
    return this.walletService.updateStripeAccountStatus(req.user.id);
  }

  @Get('connect/details')
  async getConnectDetails(@Request() req) {
    return this.walletService.getStripeAccountDetails(req.user.id);
  }

  // ==========================================================================
  // PAYOUT ENDPOINTS
  // ==========================================================================

  @Post('payout/request')
  @HttpCode(HttpStatus.OK)
  async requestPayout(@Request() req, @Body() body: RequestPayoutDto) {
    return this.walletService.requestPayout(
      req.user.id,
      body.amount,
      body.notes,
    );
  }

  @Get('payouts')
  async getPayouts(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('perPage', new ParseIntPipe({ optional: true })) perPage: number = 20,
  ) {
    return this.walletService.getPayouts(req.user.id, page, perPage);
  }

  @Get('payouts/:payoutId')
  async getPayoutDetails(
    @Request() req,
    @Param('payoutId') payoutId: string,
  ) {
    // Implementation: fetch single payout with details
    // This would be added to WalletService
    return { message: 'Not implemented yet' };
  }

  // ==========================================================================
  // ADMIN ENDPOINTS
  // ==========================================================================

  @Post('admin/payout/approve')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async approvePayout(@Request() req, @Body() body: ApprovePayoutDto) {
    return this.walletService.approvePayout(
      body.payoutId,
      req.user.id,
      body.notes,
    );
  }

  @Post('admin/payout/reject')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  async rejectPayout(@Request() req, @Body() body: RejectPayoutDto) {
    return this.walletService.rejectPayout(
      body.payoutId,
      req.user.id,
      body.reason,
      body.notes,
    );
  }

  @Get('admin/payouts/pending')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async getPendingPayouts(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('perPage', new ParseIntPipe({ optional: true })) perPage: number = 50,
  ) {
    // Implementation: fetch all pending payouts for admin review
    // This would be added to WalletService
    return { message: 'Not implemented yet' };
  }
}
