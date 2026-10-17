export const THEMES = ['surface', 'netspace', 'evangelion'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'surface';
export const SECRET_THEME: Theme = 'evangelion';
export const THEME_STORAGE_KEY = 'theme';
export const THEME_CHANGE_EVENT = 'theme:change';

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);
