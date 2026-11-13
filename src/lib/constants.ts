export const TERMS_VERSION = "2026-11-v1";

export const COMMUNITY_ROLES = [
  "Funeral director",
  "Embalmer",
  "Arranger",
  "Funeral home staff",
  "Owner / manager",
  "Cremation professional",
  "Pet aftercare",
  "Student / apprentice",
  "Educator",
  "Vendor / partner",
  "Retired",
  "Other",
] as const;

export const REPORT_REASONS = [
  "Harassment or personal attack",
  "Identifies a family or deceased person",
  "Confidential business information",
  "Spam or solicitation",
  "Political or partisan content",
  "Misleading or unsafe advice",
  "Something else",
] as const;

export const SPACE_ICONS: Record<
  string,
  "chair" | "campfire" | "coffee" | "question" | "heart"
> = {
  chair: "chair",
  campfire: "campfire",
  coffee: "coffee",
  question: "question",
  heart: "heart",
};
