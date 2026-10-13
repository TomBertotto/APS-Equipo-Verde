// Links de la barra de navegación; los que tienen permiso solo se muestran a quien lo tenga,
// y los que tienen requiresTeam solo a quien además tenga una escudería asignada
export type NavLink = { href: string; label: string; permission?: string; requiresTeam?: boolean };

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/calendar', label: 'Calendario' },
  { href: '/drivers', label: 'Pilotos' },
  { href: '/results', label: 'Resultados' },
  { href: '/my-team', label: 'Mi escudería', permission: 'drivers.manage_own', requiresTeam: true },
  { href: '/my-results', label: 'Mis puntajes', permission: 'results.confirm_own', requiresTeam: true },
  { href: '/admin', label: 'Perfiles', permission: 'profiles.manage' },
  { href: '/calendar-admin', label: 'Gestionar calendario', permission: 'calendar.manage' },
  { href: '/results-admin', label: 'Cargar resultados', permission: 'results.manage' },
  { href: '/access', label: 'Usuarios', permission: 'users.manage' },
];
