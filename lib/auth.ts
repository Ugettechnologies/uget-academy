import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_only';
const encodedKey = new TextEncoder().encode(secretKey);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await signToken({ userId, role, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

/**
 * Generate a student username formatted like: 2026/STU/A026
 */
export function generateStudentUsername(prefixNum?: number): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${year}/STU/${code}`;
}

/**
 * Generate an instructor username formatted like: UGT2026/INSCS/A026 or UGT2026/INSDA/A026
 */
export function generateInstructorUsername(deptCode?: string): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const cleanDept = deptCode ? deptCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const insPrefix = cleanDept ? `INS${cleanDept}` : 'INS';
  return `UGT${year}/${insPrefix}/${code}`;
}

/**
 * Generate a staff username formatted like: UGT2026/STF/A026
 */
export function generateStaffUsername(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UGT${year}/STF/${code}`;
}

/**
 * Generate a clean, secure auto-generated password code for any role.
 * E.g. INS-8A4F92, STF-3B1902, STU-9X4281
 */
export function generateAutoPassword(role: string): string {
  const prefix = role === 'INSTRUCTOR' ? 'INS' : role === 'STAFF' ? 'STF' : role === 'ADMIN' ? 'ADM' : 'STU';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}
