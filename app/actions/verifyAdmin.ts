'use server';

export async function verifySuperAdmin(password: string): Promise<boolean> {
  // Use environment variable if available, fallback to hardcoded value ONLY on server side.
  // The server-side code NEVER ships to the browser bundle.
  const correctPassword = process.env.SUPERADMIN_PASSWORD || 'createme2026';
  
  if (password === correctPassword) {
    return true;
  }
  return false;
}
