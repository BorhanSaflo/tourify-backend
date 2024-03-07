import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

dotenv.config();

/* App Config */
export const APP_PORT = parseInt(process.env.APP_PORT!) || 3000 as number;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as Secret;
export const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY as string;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';