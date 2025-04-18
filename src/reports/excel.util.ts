import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelUtil {
  async generateTransactionReport(
    summaryData: any[],
    dumpData: any[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Create Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Total Transactions', key: 'count', width: 20 },
      { header: 'Total Amount', key: 'amount', width: 20 },
    ];

    summaryData.forEach((item) => {
      summarySheet.addRow(item);
    });

    // Create Dump sheet
    const dumpSheet = workbook.addWorksheet('Dump');
    dumpSheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Invoice', key: 'invoice', width: 20 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Mobile', key: 'mobile', width: 15 },
    ];

    dumpData.forEach((transaction) => {
      dumpSheet.addRow({
        _id: transaction._id,
        type: transaction.type,
        invoice: transaction.invoice,
        timestamp: new Date(transaction.timestamp * 1000).toLocaleString(), // convert UNIX to human date
        status: transaction.status,
        mobile: transaction.mobile,
      });
    });

    // Fix: Ensure returned value is NodeJS Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
