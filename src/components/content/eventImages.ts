import { CalendarDays, Heart, TreePine, Trophy, type LucideIcon } from "lucide-react";
import marathonImg from "@/assets/events/nyc-marathon.jpg";
import paradeImg from "@/assets/events/thanksgiving-parade.jpg";
import treeImg from "@/assets/events/rockefeller-tree.jpg";
import christmasImg from "@/assets/events/christmas-day.jpg";
import broadwayImg from "@/assets/events/broadway-week.jpg";
import foliageImg from "@/assets/events/fall-foliage.jpg";

/** Event photography shared by the starter cards, the visual content plan, and the calendar. */
export const EVENT_IMAGES: Record<string, string> = { marathon: marathonImg, thanksgiving: paradeImg, tree: treeImg, christmas: christmasImg, broadway: broadwayImg, fall: foliageImg };

/** Fallback icon per event type. */
export const EVENT_ICONS: Record<string, LucideIcon> = { Holiday: Heart, "Local event": Trophy, Seasonal: TreePine, Standard: CalendarDays };
