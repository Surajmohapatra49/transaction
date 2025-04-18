import { IsString, IsIn, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsIn(['credit', 'debit'])
  @IsNotEmpty()
  type: 'credit' | 'debit';

  @IsString()
  @IsNotEmpty()
  invoice: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;
}
