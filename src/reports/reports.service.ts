import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer'; // ✅ add this import

@Injectable()
export class ReportsService {
  async generateExcelReport(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    const summary = workbook.addWorksheet('Summary');
    summary.addRow(['Type', 'Total']);
    summary.addRow(['Credit', 100]);
    summary.addRow(['Debit', 80]);

    const dump = workbook.addWorksheet('Dump');
    dump.addRow(['ID', 'Type', 'Invoice', 'Timestamp', 'Status', 'Mobile']);
    dump.addRow([
      '1',
      'credit',
      'INV001',
      '1672531199',
      'success',
      '1234567890',
    ]);

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer); // ✅ wrap it to ensure compatibility
  }
}
