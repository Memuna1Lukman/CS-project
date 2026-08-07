import { ResourceType } from '@/types/resource';

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  SLIDES: 'Slides',
  PAST_QUESTION: 'Past Question',
  LAB_MANUAL: 'Lab Manual',
  NOTES: 'Notes',
  OTHER: 'Other',
};

// Candy-tint badge classes per type (UI-SPEC v2): strong type colour as text
// on its -soft tint background. Tokens only — both themes defined in globals.css.
export const RESOURCE_TYPE_BADGE_CLASSES: Record<ResourceType, string> = {
  SLIDES: 'bg-[var(--type-slides-soft)] text-[var(--type-slides)]',
  PAST_QUESTION: 'bg-[var(--type-past-question-soft)] text-[var(--type-past-question)]',
  LAB_MANUAL: 'bg-[var(--type-lab-manual-soft)] text-[var(--type-lab-manual)]',
  NOTES: 'bg-[var(--type-notes-soft)] text-[var(--type-notes)]',
  OTHER: 'bg-[var(--type-other-soft)] text-[var(--type-other)]',
};
