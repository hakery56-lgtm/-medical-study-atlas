import { BookOpen, FlaskConical, StickyNote, ClipboardCheck, Bone, HeartPulse, Wind, Droplets, Pill, Microscope, type LucideIcon } from "lucide-react"
import type { ResourceType, Subject } from "@/data/subjects"

export const typeIcons: Record<ResourceType, LucideIcon> = {
  lecture: BookOpen,
  lab: FlaskConical,
  note: StickyNote,
  exam: ClipboardCheck,
}

export const typeLabels: Record<ResourceType, string> = {
  lecture: "Lecture",
  lab: "Lab",
  note: "Note",
  exam: "Quiz",
}

/** Returns inline styles for a resource type badge using theme tokens. */
export function typeBadgeStyle(type: ResourceType) {
  return {
    color: `var(--type-${type})`,
    backgroundColor: `var(--type-${type}-bg)`,
  }
}

export const subjectIcons: Record<Subject["icon"], LucideIcon> = {
  bone: Bone,
  heart: HeartPulse,
  lungs: Wind,
  blood: Droplets,
  pill: Pill,
  microscope: Microscope,
}
