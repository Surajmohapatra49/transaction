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
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection using async factory
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI is not defined in the environment');
        }
        console.log('MongoDB URI:', uri); // Optional: for debugging
        return { uri };
      },
    }),

    // JWT setup with env-based config
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),

    // MongoDB schemas
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
