"use client";

import { OnboardingWizard } from "./onboarding-wizard";

export function OnboardingWrapper({ hasApps }: { hasApps: boolean }) {
  if (hasApps) return null;
  return <OnboardingWizard />;
}
