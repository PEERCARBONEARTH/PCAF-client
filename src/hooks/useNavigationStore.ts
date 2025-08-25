import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  visibleItems: string[];
  pinnedItems: string[];
  collapsedGroups: string[];
  compactMode: boolean;
  activeProfile: string;
  navigationOrder: string[];
  
  // Actions
  toggleVisibility: (itemId: string) => void;
  togglePin: (itemId: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  setCompactMode: (compact: boolean) => void;
  setActiveProfile: (profileId: string) => void;
  reorderItems: (newOrder: string[]) => void;
  resetToDefaults: () => void;
  applyProfile: (profileId: string) => void;
}

const defaultState = {
  visibleItems: [
    // Green Finance items
    'dashboard', 'projects', 'varl', 'tranches-builder', 'tranches', 
    'compliance', 'reports', 'alerts', 'users', 'tasks', 
    'workflows', 'marketplace',
    // Financed Emissions items
    'upload', 'summary', 'ledger', 'fe-dashboard', 'fe-reports', 'settings'
  ],
  pinnedItems: ['dashboard', 'upload', 'summary'],
  collapsedGroups: [],
  compactMode: false,
  activeProfile: 'full',
  navigationOrder: [
    'dashboard', 'projects', 'varl', 'tranches-builder', 'tranches', 
    'compliance', 'reports', 'alerts', 'users', 'tasks', 
    'workflows', 'marketplace', 'upload', 'summary', 'ledger', 'fe-dashboard', 'fe-reports', 'settings'
  ]
};

const profileConfigs = {
  full: {
    visibleItems: [
      'dashboard', 'projects', 'varl', 'tranches-builder', 'tranches', 
      'compliance', 'reports', 'alerts', 'users', 'tasks', 
      'workflows', 'marketplace'
    ],
    pinnedItems: ['dashboard', 'projects', 'tranches']
  },
  operations: {
    visibleItems: ['dashboard', 'projects', 'varl', 'tasks', 'workflows', 'reports'],
    pinnedItems: ['projects', 'varl', 'tasks', 'workflows']
  },
  finance: {
    visibleItems: ['dashboard', 'tranches-builder', 'tranches', 'reports', 'alerts'],
    pinnedItems: ['tranches-builder', 'tranches', 'dashboard']
  },
  governance: {
    visibleItems: ['dashboard', 'compliance', 'alerts', 'users', 'reports'],
    pinnedItems: ['compliance', 'alerts', 'users']
  },
  analyst: {
    visibleItems: ['dashboard', 'reports', 'projects', 'tranches'],
    pinnedItems: ['dashboard', 'reports']
  },
  // Financed Emissions profiles
  emissions_full: {
    visibleItems: ['upload', 'summary', 'ledger', 'fe-dashboard', 'fe-reports', 'settings'],
    pinnedItems: ['upload', 'summary', 'fe-dashboard']
  },
  emissions_analyst: {
    visibleItems: ['summary', 'ledger', 'fe-dashboard', 'fe-reports'],
    pinnedItems: ['summary', 'fe-dashboard']
  }
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      toggleVisibility: (itemId: string) =>
        set((state) => ({
          visibleItems: state.visibleItems.includes(itemId)
            ? state.visibleItems.filter(id => id !== itemId)
            : [...state.visibleItems, itemId],
          // Remove from pinned if hiding
          pinnedItems: state.visibleItems.includes(itemId)
            ? state.pinnedItems.filter(id => id !== itemId)
            : state.pinnedItems
        })),

      togglePin: (itemId: string) =>
        set((state) => {
          if (!state.visibleItems.includes(itemId)) return state;
          
          return {
            pinnedItems: state.pinnedItems.includes(itemId)
              ? state.pinnedItems.filter(id => id !== itemId)
              : state.pinnedItems.length < 5
                ? [...state.pinnedItems, itemId]
                : state.pinnedItems
          };
        }),

      toggleGroupCollapse: (groupId: string) =>
        set((state) => ({
          collapsedGroups: state.collapsedGroups.includes(groupId)
            ? state.collapsedGroups.filter(id => id !== groupId)
            : [...state.collapsedGroups, groupId]
        })),

      setCompactMode: (compact: boolean) =>
        set({ compactMode: compact }),

      setActiveProfile: (profileId: string) =>
        set((state) => {
          const profile = profileConfigs[profileId as keyof typeof profileConfigs];
          if (!profile) return { activeProfile: profileId };

          return {
            activeProfile: profileId,
            visibleItems: profile.visibleItems,
            pinnedItems: profile.pinnedItems
          };
        }),

      reorderItems: (newOrder: string[]) =>
        set({ navigationOrder: newOrder }),

      resetToDefaults: () =>
        set(defaultState),

      applyProfile: (profileId: string) => {
        const profile = profileConfigs[profileId as keyof typeof profileConfigs];
        if (profile) {
          set({
            activeProfile: profileId,
            visibleItems: profile.visibleItems,
            pinnedItems: profile.pinnedItems
          });
        }
      }
    }),
    {
      name: 'navigation-preferences',
      version: 1
    }
  )
);