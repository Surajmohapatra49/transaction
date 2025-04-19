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

    // Use aggregation to format timestamp
    const transactions = await this.transactionModel.aggregate([
      {
        $project: {
          type: 1,
          invoice: 1,
          status: 1,
          mobile: 1,
          formattedTimestamp: {
            $dateToString: {
              format: '%Y-%m-%d %I:%M %p',
              date: {
                $toDate: { $multiply: ['$timestamp', 1000] },
              },
            },
          },
        },
      },
    ]);

    transactions.forEach((txn, index) => {
      const row = dumpSheet.addRow([
        index + 1,
        txn.type,
        txn.invoice,
        txn.formattedTimestamp,
        txn.status || '-',
        txn.mobile || '-',
      ]);

      row.getCell(4).numFmt = '@'; // Treat timestamp column as text in Excel
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
