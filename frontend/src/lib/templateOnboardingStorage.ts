const STORAGE_KEY = 'mailcraft:template-create-onboarding'

export type TemplateOnboardingStorageValue = 'skipped' | 'completed'

export function getTemplateOnboardingStatus(): TemplateOnboardingStorageValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'skipped' || v === 'completed') return v
    return null
  } catch {
    return null
  }
}

export function shouldShowCreateTemplateOnboarding(): boolean {
  return getTemplateOnboardingStatus() === null
}

export function setTemplateOnboardingSkipped(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'skipped')
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function setTemplateOnboardingCompleted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'completed')
  } catch {
    /* ignore */
  }
}
