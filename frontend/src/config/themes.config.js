/**
 * Default themes per business type.
 * These are applied when a tenant hasn't customized their theme.
 * Tenant's own theme settings always override these defaults.
 */

export const BUSINESS_THEMES = {
  RESTAURANT: {
    primaryColor:    '#c9a227',
    secondaryColor:  '#e8c547',
    backgroundColor: '#000000',
    surfaceColor:    '#111111',
    textColor:       '#ffffff',
    fontFamily:      'Inter, sans-serif',
    borderRadius:    '1rem',
    mode:            'dark',
    // UI personality
    heroHeadline:    'Savor the Art of Fine Dining',
    heroSub:         'Crafted with passion, served with excellence',
    accentEmoji:     '🍱',
    cardStyle:       'glass',
  }
};

/**
 * Merge tenant's saved theme with business-type defaults.
 * Tenant settings always win.
 */
export function resolveTheme(tenant) {
  const defaults = BUSINESS_THEMES[tenant?.businessType] || BUSINESS_THEMES.CUSTOM;
  const saved = tenant?.theme || {};

  // Only override defaults with saved values that are actually set (non-null, non-empty)
  const merged = { ...defaults };
  for (const [key, val] of Object.entries(saved)) {
    if (val !== null && val !== undefined && val !== '') {
      merged[key] = val;
    }
  }

  return {
    ...merged,
    businessName: tenant?.businessName || 'Store',
    logo:         tenant?.logo   || null,
    banner:       tenant?.banner || null,
    favicon:      tenant?.favicon || null,
    businessType: tenant?.businessType || 'CUSTOM',
    // Keep personality from business defaults (not overridable via saved theme)
    accentEmoji:  defaults.accentEmoji,
    heroHeadline: defaults.heroHeadline,
    heroSub:      defaults.heroSub,
    cardStyle:    defaults.cardStyle,
  };
}

/**
 * Apply theme to CSS custom properties on :root
 */
export function applyThemeToDom(theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary',    theme.primaryColor);
  root.style.setProperty('--color-secondary',  theme.secondaryColor);
  root.style.setProperty('--color-bg',         theme.backgroundColor);
  root.style.setProperty('--color-surface',    theme.surfaceColor);
  root.style.setProperty('--color-text',       theme.textColor);
  root.style.setProperty('--font-family',      theme.fontFamily);
  root.style.setProperty('--border-radius',    theme.borderRadius);

  // Sync with core variables used in index.css
  root.style.setProperty('--bg',               theme.backgroundColor);
  root.style.setProperty('--text',             theme.textColor);
  root.style.setProperty('--accent',           theme.primaryColor);
  root.style.setProperty('--primary',          theme.primaryColor);

  // Update favicon if provided
  if (theme.favicon) {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = theme.favicon;
    document.head.appendChild(link);
  }

  // Update page title
  if (theme.businessName) {
    document.title = `${theme.businessName}`;
  }
}
