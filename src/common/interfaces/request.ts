import { Request } from 'express';

export interface CRequest extends Request {
  user: {
    id: string;
    role: any;
  };
  lang : 'uz' | 'ru' | 'en'
}
