import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';

import { TransactionsController } from './transactions/transactions.controller';
import { TransactionService } from './transactions/transactions.service';
import {
  Transaction,
  TransactionSchema,
} from './transactions/transaction.schema';

import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Use ConfigService to load Mongo URI safely
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    // JWT setup
    JwtModule.register({ secret: 'secretKey' }),

    // Register Transaction schema
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [AuthController, TransactionsController, ReportsController],
  providers: [
    AuthService,
    JwtStrategy,
    TransactionService,
    ReportsService,
    JwtAuthGuard,
  ],
})
export class AppModule {}
