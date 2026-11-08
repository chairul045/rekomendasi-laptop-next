// src/lib/admin-auth.ts - Centralized Admin Authorization Service
import { User } from '@supabase/supabase-js';
import type { User as PrismaUser } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/auth-constants';

export interface AdminAuthSession {
  user: User;
  profile: PrismaUser;
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Memverifikasi apakah session saat ini merupakan admin resmi.
 * Mengembalikan objek AdminAuthSession jika valid, atau null jika tidak terotorisasi.
 */
export async function checkAdminAuth(): Promise<AdminAuthSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await prisma.user.findUnique({ where: { id: user.id } });
    if (!profile || profile.role !== 'admin' || !isSuperAdminEmail(profile.email)) {
      return null;
    }

    return {
      user,
      profile,
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    };
  } catch (error: any) {
    if (error && typeof error === 'object' && error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error during checkAdminAuth:', error);
    return null;
  }
}

/**
 * Alias checkAdmin untuk backward compatibility dengan seluruh rute API admin
 */
export const checkAdmin = checkAdminAuth;

/**
 * Memeriksa apakah seorang pengguna (berdasarkan ID profil database) adalah admin resmi
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.user.findUnique({ where: { id: userId } });
    if (!profile) return false;
    return profile.role === 'admin' && isSuperAdminEmail(profile.email);
  } catch {
    return false;
  }
}
