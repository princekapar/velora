import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { connectToDatabase, isDatabaseConnected } from './db';
import AdminModel from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'velora_super_secret_jwt_key_987456321_luxury_platform';
const COOKIE_NAME = 'velora_admin_token';

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@velora.art',
  password: process.env.ADMIN_PASSWORD || 'velora2026',
};

export interface AdminPayload {
  email: string;
  role: string;
  exp?: number;
}

export function signAdminToken(email: string, role: string = 'admin'): string {
  return jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (e) {
    return null;
  }
}

export async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  // Check default env admin
  if (email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() && password === DEFAULT_ADMIN.password) {
    return true;
  }

  // Check MongoDB Admin collection
  const conn = await connectToDatabase();
  if (conn && isDatabaseConnected()) {
    try {
      const admin = await AdminModel.findOne({ email: email.toLowerCase() });
      if (admin && admin.passwordHash) {
        return await bcrypt.compare(password, admin.passwordHash);
      }
    } catch (e) {
      console.error('[Auth] MongoDB credential check failed:', e);
    }
  }

  return false;
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch (err) {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
