import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetPreferences {
  visible: Record<string, boolean>;
  collapsed: Record<string, boolean>;
}

interface WidgetState {
  preferences: Record<string, WidgetPreferences>;
  isWidgetVisible: (role: string, widgetId: string) => boolean;
  isWidgetCollapsed: (role: string, widgetId: string) => boolean;
  toggleWidgetVisibility: (role: string, widgetId: string) => void;
  toggleWidgetCollapse: (role: string, widgetId: string) => void;
  setWidgetVisibility: (role: string, widgetId: string, visible: boolean) => void;
}

const getDefaults = (): WidgetPreferences => ({
  visible: {},
  collapsed: {},
});

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      preferences: {},

      isWidgetVisible: (role: string, widgetId: string) => {
        const prefs = get().preferences[role];
        if (!prefs || prefs.visible[widgetId] === undefined) return true;
        return prefs.visible[widgetId];
      },

      isWidgetCollapsed: (role: string, widgetId: string) => {
        const prefs = get().preferences[role];
        if (!prefs) return false;
        return !!prefs.collapsed[widgetId];
      },

      toggleWidgetVisibility: (role: string, widgetId: string) => {
        set((state) => {
          const rolePrefs = state.preferences[role] || getDefaults();
          const current = rolePrefs.visible[widgetId] ?? true;
          return {
            preferences: {
              ...state.preferences,
              [role]: {
                ...rolePrefs,
                visible: { ...rolePrefs.visible, [widgetId]: !current },
              },
            },
          };
        });
      },

      toggleWidgetCollapse: (role: string, widgetId: string) => {
        set((state) => {
          const rolePrefs = state.preferences[role] || getDefaults();
          const current = !!rolePrefs.collapsed[widgetId];
          return {
            preferences: {
              ...state.preferences,
              [role]: {
                ...rolePrefs,
                collapsed: { ...rolePrefs.collapsed, [widgetId]: !current },
              },
            },
          };
        });
      },

      setWidgetVisibility: (role: string, widgetId: string, visible: boolean) => {
        set((state) => {
          const rolePrefs = state.preferences[role] || getDefaults();
          return {
            preferences: {
              ...state.preferences,
              [role]: {
                ...rolePrefs,
                visible: { ...rolePrefs.visible, [widgetId]: visible },
              },
            },
          };
        });
      },
    }),
    {
      name: 'stryde-widgets',
    }
  )
);
