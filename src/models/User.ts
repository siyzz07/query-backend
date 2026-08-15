import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  secretKey: string;
  apiKey?: string;
  botName?: string;
  botRole?: string;
  companyName?: string;
  primaryGoal?: string;
  toneOfVoice?: string;
  allowedTopics?: string;
  forbiddenTopics?: string;
  fallbackMessage?: string;
  maxLengthSentences?: number;
  preferredLanguage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  secretKey: { type: String, required: true },
  apiKey: { type: String, required: false },
  botName: { type: String, default: '' },
  botRole: { type: String, default: '' },
  companyName: { type: String, default: '' },
  primaryGoal: { type: String, default: '' },
  toneOfVoice: { type: String, default: '' },
  allowedTopics: { type: String, default: '' },
  forbiddenTopics: { type: String, default: '' },
  fallbackMessage: { type: String, default: '' },
  maxLengthSentences: { type: Number, default: 3 },
  preferredLanguage: { type: String, default: 'English' }
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);

