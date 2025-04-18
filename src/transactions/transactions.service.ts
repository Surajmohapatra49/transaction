import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import * as dayjs from 'dayjs'; // Use this import statement

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  // Method to create a new transaction
  async create(data: any): Promise<Transaction> {
    // Get the current time as a UNIX timestamp (seconds)
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000); // UNIX timestamp
    const timestampFormatted = dayjs(now).format('YYYY-MM-DD hh:mm A'); // Formatted time like "2025-04-17 08:30 PM"

    // Create the new transaction object
    const newTransaction = new this.transactionModel({
      ...data,
      timestamp,
      timestampFormatted, // Store both UNIX timestamp and the human-readable format
    });

    // Save and return the new transaction
    return await newTransaction.save();
  }

  // Method to find all transactions with pagination and date range filter
  async findAll(
    filter: any,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    // Prepare the filter for date range if provided
    if (startDate && endDate) {
      const startTimestamp = dayjs(startDate).startOf('day').unix(); // Convert to UNIX timestamp (start of the day)
      const endTimestamp = dayjs(endDate).endOf('day').unix(); // Convert to UNIX timestamp (end of the day)

      filter.timestamp = {
        $gte: startTimestamp, // Greater than or equal to start date
        $lte: endTimestamp, // Less than or equal to end date
      };
    }

    // Find items and total count with filtering, skipping, and limiting
    const [items, total] = await Promise.all([
      this.transactionModel.find(filter).skip(skip).limit(limit).exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    // Return paginated results
    return {
      data: items,
      total,
      page,
      limit,
    };
  }
}
