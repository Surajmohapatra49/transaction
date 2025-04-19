import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import * as dayjs from 'dayjs';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  // CREATE TRANSACTION (stores UNIX timestamp)
  async create(data: any): Promise<Transaction> {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);

    const lastTransaction = await this.transactionModel
      .findOne({})
      .sort({ createdAt: -1 })
      .exec();

    let newInvoice = 'INV001';
    if (lastTransaction?.invoice) {
      const match = lastTransaction.invoice.match(/INV(\d+)/);
      if (match && match[1]) {
        const nextNumber = parseInt(match[1]) + 1;
        newInvoice = `INV${String(nextNumber).padStart(3, '0')}`;
      }
    }

    const newTransaction = new this.transactionModel({
      ...data,
      invoice: newInvoice,
      timestamp, // stored as UNIX timestamp
    });

    return await newTransaction.save();
  }

  // GET WITH FILTERS
  async findAll(
    page = 1,
    limit = 10,
    type?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Optional type filter
    if (type && ['credit', 'debit'].includes(type)) {
      filter.type = type;
    }

    // Optional date range filter (convert to UNIX)
    if (startDate && endDate) {
      const startTimestamp = dayjs(startDate).startOf('day').unix();
      const endTimestamp = dayjs(endDate).endOf('day').unix();

      console.log('⏳ Filtering timestamps:', {
        startTimestamp,
        endTimestamp,
      });

      filter.timestamp = {
        $gte: startTimestamp,
        $lte: endTimestamp,
      };
    }

    // Fetch from DB
    const [items, total] = await Promise.all([
      this.transactionModel.find(filter).skip(skip).limit(limit).exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    // Convert UNIX to readable date This one is optional according to the requirement
    const formattedItems = items.map((txn) => ({
      ...txn.toObject(),
      timestampFormatted: dayjs
        .unix(txn.timestamp)
        .format('YYYY-MM-DD hh:mm A'), // this is for formatted time stamp for optional
    }));

    return {
      data: formattedItems,
      total,
      page,
      limit,
    };
  }
}
