import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/transaction.schema';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async generateExcelReport(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // ====== SUMMARY SHEET ======
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Type', 'Total']);

    const creditCount = await this.transactionModel.countDocuments({
      type: 'credit',
    });
    const debitCount = await this.transactionModel.countDocuments({
      type: 'debit',
    });

    summarySheet.addRow(['Credit', creditCount]);
    summarySheet.addRow(['Debit', debitCount]);

    // ====== DUMP SHEET ======
    const dumpSheet = workbook.addWorksheet('Dump');
    dumpSheet.addRow([
      'ID',
      'Type',
      'Invoice',
      'Timestamp',
      'Status',
      'Mobile',
    ]);

    const transactions = await this.transactionModel.find();

    transactions.forEach((txn, index) => {
      const formattedTimestamp = dayjs
        .unix(txn.timestamp)
        .format('YYYY-MM-DD hh:mm A'); // 👈 12-hour format with AM/PM

      dumpSheet.addRow([
        index + 1,
        txn.type,
        txn.invoice,
        formattedTimestamp,
        txn.status || '-',
        txn.mobile || '-',
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
