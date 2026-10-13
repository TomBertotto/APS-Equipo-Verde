import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../viewmodels/AuthProvider';
import { NAV_LINKS } from './navLinks';
import { colors, fonts, spacing, WIDE_BREAKPOINT } from './theme';

export function NavBar() {
  const auth = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const wide = width >= WIDE_BREAKPOINT;

  const links = NAV_LINKS.filter(
    (l) => (!l.permission || auth.can(l.permission)) && (!l.requiresTeam || !!auth.currentUser?.teamId),
  );

  function go(href: string) {
    setMenuOpen(false);
    router.navigate(href as never);
  }

  async function logout() {
    setMenuOpen(false);
    await auth.logout();
    router.replace('/');
  }

  const linkItems = links.map((link) => {
    const active = pathname === link.href;
    return (
      <Pressable key={link.href} onPress={() => go(link.href)} style={wide ? styles.link : styles.menuLink}>
        <Text style={[styles.linkText, active && styles.activeText]}>{link.label}</Text>
        {wide && active ? <View style={styles.activeBar} /> : null}
      </Pressable>
    );
  });

  const sessionItems = auth.currentUser ? (
    <>
      <Text style={styles.user} numberOfLines={1}>
        {auth.currentUser.username}
      </Text>
      <Pressable onPress={logout} style={wide ? styles.link : styles.menuLink}>
        <Text style={styles.linkText}>Salir</Text>
      </Pressable>
    </>
  ) : (
    <>
      <Pressable onPress={() => go('/login')} style={wide ? styles.link : styles.menuLink}>
        <Text style={[styles.linkText, pathname === '/login' && styles.activeText]}>Ingresar</Text>
      </Pressable>
      <Pressable onPress={() => go('/register')} style={[styles.cta, !wide && styles.menuCta]}>
        <Text style={styles.ctaText}>Registrarse</Text>
      </Pressable>
    </>
  );

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => go('/')} style={styles.brand}>
          <View style={styles.brandMark} />
          <Text style={styles.brandText}>
            FIA <Text style={styles.brandAccent}>CONNECT</Text>
          </Text>
        </Pressable>
        {wide ? (
          <>
            <View style={styles.links}>{linkItems}</View>
            <View style={styles.session}>{auth.loading ? null : sessionItems}</View>
          </>
        ) : (
          <Pressable onPress={() => setMenuOpen(!menuOpen)} style={styles.burger} accessibilityLabel="Menú">
            <Text style={styles.burgerText}>{menuOpen ? '✕' : '☰'}</Text>
          </Pressable>
        )}
      </View>
      {!wide && menuOpen ? (
        <View style={styles.menu}>
          {linkItems}
          <View style={styles.menuDivider} />
          {auth.loading ? null : sessionItems}
        </View>
      ) : null}
      <View style={styles.stripe} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.dark, zIndex: 10 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 8, height: 26, backgroundColor: colors.primary, transform: [{ skewX: '-15deg' }] },
  brandText: { fontFamily: fonts.black, fontSize: 20, color: colors.onDark, letterSpacing: 1 },
  brandAccent: { color: colors.primary },
  links: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  link: { paddingHorizontal: spacing.sm, paddingVertical: 18 },
  linkText: { fontFamily: fonts.semibold, fontSize: 14, color: '#C9C9CF', textTransform: 'uppercase' },
  activeText: { color: colors.onDark },
  activeBar: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  session: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  user: { fontFamily: fonts.regular, fontSize: 13, color: '#C9C9CF', maxWidth: 200 },
  cta: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  ctaText: { fontFamily: fonts.bold, fontSize: 13, color: colors.onDark, textTransform: 'uppercase' },
  burger: { marginLeft: 'auto', padding: spacing.sm },
  burgerText: { fontSize: 24, color: colors.onDark },
  menu: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.xs },
  menuLink: { paddingVertical: 10 },
  menuCta: { alignSelf: 'flex-start', marginTop: spacing.xs },
  menuDivider: { height: 1, backgroundColor: colors.darkSoft, marginVertical: spacing.xs },
  stripe: { height: 3, backgroundColor: colors.primary },
});
