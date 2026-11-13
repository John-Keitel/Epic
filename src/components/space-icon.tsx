import {
  Armchair,
  Coffee,
  Flame,
  Heart,
  MessageCircle,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  chair: Armchair,
  campfire: Flame,
  coffee: Coffee,
  question: MessagesSquare,
  heart: Heart,
  chat: MessageCircle,
};

export function SpaceIcon({
  icon,
  className = "h-5 w-5",
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? MessageCircle;
  return <Icon className={className} aria-hidden />;
}
