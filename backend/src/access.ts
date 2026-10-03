import { Router } from 'express';
import { pool } from './db.js';
import { PERMISSIONS, ROLES, requirePermission } from './permissions.js';

export const accessRouter = Router();

accessRouter.use(requirePermission('users.manage'));

accessRouter.get('/users', async (_req, res) => {
  const result = await pool.query('SELECT id, username, role FROM users ORDER BY username');
  res.json(result.rows);
});

accessRouter.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) {
    res.status(400).json({ error: 'Perfil inválido' });
    return;
  }
  if (Number(req.params.id) === res.locals.user.id) {
    res.status(400).json({ error: 'No podés cambiar tu propio perfil' });
    return;
  }
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
  res.json({ ok: true });
});

accessRouter.get('/permissions', async (_req, res) => {
  const result = await pool.query('SELECT role, permission FROM role_permissions');
  const grants: Record<string, string[]> = { admin: PERMISSIONS };
  for (const role of ROLES.filter((r) => r !== 'admin')) {
    grants[role] = result.rows.filter((r) => r.role === role).map((r) => r.permission);
  }
  res.json({ roles: ROLES, permissions: PERMISSIONS, grants });
});

accessRouter.put('/permissions/:role', async (req, res) => {
  const { role } = req.params;
  const permissions: string[] = req.body.permissions ?? [];
  if (!ROLES.includes(role) || role === 'admin') {
    res.status(400).json({ error: 'Perfil inválido' });
    return;
  }
  await pool.query('DELETE FROM role_permissions WHERE role = $1', [role]);
  for (const permission of permissions.filter((p) => PERMISSIONS.includes(p))) {
    await pool.query('INSERT INTO role_permissions (role, permission) VALUES ($1, $2)', [
      role,
      permission,
    ]);
  }
  res.json({ ok: true });
});
