import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { connectToDatabase, isDatabaseConnected } from './db';
import AdminModel from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'velora_runtime_jwt_secret_token';
const COOKIE_NAME = 'velora_admin_token';

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
  const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
  const envAdminPassword = process.env.ADMIN_PASSWORD;

  // Validate against configured environment variables
  if (
    envAdminEmail &&
    envAdminPassword &&
    email.trim().toLowerCase() === envAdminEmail.toLowerCase() &&
    password === envAdminPassword
  ) {
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
