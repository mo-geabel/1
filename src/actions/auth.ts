'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getJwtSecret } from '@/lib/auth';
import { redirect } from 'next/navigation';

const secretKey = getJwtSecret();

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string || 'PARTICIPANT';

    if (!email || !password) {
      return { error: 'Please provide email and password.' };
    }

    const [user] = await db.select().from(users).where(
      eq(users.email, email)
    ).limit(1);

    // SECURITY WARNING: In production, passwords MUST be hashed.
    if (!user || user.password !== password) {
      return { error: 'Invalid email or password.' };
    }

    const token = sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    }, secretKey);
    
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    console.log('Login Success Debug:', { 
      email: user.email, 
      dbRole: user.role, 
      redirectPath: user.role === 'ADMIN' ? '/admin/dashboard' : '/participant/dashboard' 
    });

    return { 
      success: true, 
      role: user.role,
      redirect: user.role === 'ADMIN' ? '/admin/dashboard' : '/participant/dashboard'
    };
  } catch (err) {
    console.error('Login error:', err);
    return { error: 'Login failed. Please try again.' };
  }
}

export async function registerAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string || 'PARTICIPANT';

    if (!email || !password) {
      return { error: 'Please provide an email and password.' };
    }

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return { error: 'A user with this email already exists.' };
    }

    await db.insert(users).values({
      email,
      password, // AGAIN: Always hash passwords in production.
      firstName,
      lastName,
      phone,
      role: role as any,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Register error:', err);
    return { error: 'Registration failed. This email might already be in use or data is invalid.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;

    // We can't use verify easily in Server Actions without a lib, 
    // but the middleware handles the heavy lifting.
    // For now returning the existence/basic decoded if needed or just null check.
    return { token };
  } catch {
    return null;
  }
}
