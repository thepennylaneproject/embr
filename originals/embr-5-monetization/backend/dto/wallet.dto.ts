import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  IsNotEmpty,
} from 'class-validator';

export enum TransactionType {
  TIP_RECEIVED = 'TIP_RECEIVED',
  TIP_SENT = 'TIP_SENT',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  FEE = 'FEE',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class GetTransactionsQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateStripeConnectAccountDto {
  @IsString()
  @IsNotEmpty()
  country: string = 'US';

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  @IsOptional()
  agreesToTerms?: boolean = false;
}

export class CompleteStripeOnboardingDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;
}

export class GetStripeAccountLinkDto {
  @IsString()
  @IsNotEmpty()
  refreshUrl: string;

  @IsString()
  @IsNotEmpty()
  returnUrl: string;
}

export class WalletBalanceDto {
  available: number;
  pending: number;
  total: number;
  currency: string;
}
