import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, enum: ['credit', 'debit'] })
  type: 'credit' | 'debit';

  @Prop({ required: true })
  invoice: string;

  //UNIX timestamp in seconds
  @Prop({ required: true })
  timestamp: number;

  // Human-readable formatted time (e.g., "2025-04-17 08:30 PM")
  // @Prop({ required: true })
  // timestampFormatted: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  mobile: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
