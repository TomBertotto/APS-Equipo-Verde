import { Request, Response, NextFunction } from 'express';
import { pool } from './db.js';

export const ROLES = ['admin', 'team_manager', 'user'];
export const PERMISSIONS = ['profiles.manage', 'users.manage'];

export type AuthUser = { id: number; username: string; role: string; permissions: string[] };

export function getToken(req: Request) {
  return req.headers.authorization?.replace('Bearer ', '') ?? '';
}

export async function getPermissions(role: string) {
  if (role === 'admin') return PERMISSIONS;
  const result = await pool.query('SELECT permission FROM role_permissions WHERE role = $1', [role]);
  return result.rows.map((r) => r.permission as string);
}

export async function getUserByToken(token: string): Promise<AuthUser | undefined> {
  const result = await pool.query(
    'SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1',
    [token],
  );
  const user = result.rows[0];
  if (!user) return undefined;
  return { ...user, permissions: await getPermissions(user.role) };
}

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserByToken(getToken(req));
    if (!user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!user.permissions.includes(permission)) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }
    res.locals.user = user;
    next();
  };
}
