import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasSeenTour: Record<string, boolean>;
  currentStep: number;
  isTourActive: boolean;
  markSeen: (role: string) => void;
  setStep: (step: number) => void;
  startTour: () => void;
  endTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenTour: {},
      currentStep: 0,
      isTourActive: false,

      markSeen: (role: string) =>
        set((state) => ({
          hasSeenTour: { ...state.hasSeenTour, [role]: true },
          isTourActive: false,
          currentStep: 0,
        })),

      setStep: (step: number) => set({ currentStep: step }),

      startTour: () => set({ isTourActive: true, currentStep: 0 }),

      endTour: () => set({ isTourActive: false, currentStep: 0 }),
    }),
    {
      name: 'stryde-onboarding',
    }
  )
);
