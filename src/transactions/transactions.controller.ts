import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(
    @Query('type') type: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.transactionsService.findAll(
      { type, start, end },
      Number(page),
      Number(limit),
    );
  }
}
