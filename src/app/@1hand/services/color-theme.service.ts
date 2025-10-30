import { Injectable } from "@angular/core";

const CLASS_COLORS = [
  {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-600",
    hover: "hover:bg-red-200",
  },
  {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-600",
    hover: "hover:bg-blue-200",
  },
  {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-600",
    hover: "hover:bg-green-200",
  },
  {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-600",
    hover: "hover:bg-yellow-200",
  },
  {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-600",
    hover: "hover:bg-purple-200",
  },
  {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-600",
    hover: "hover:bg-orange-200",
  },
  {
    bg: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-600",
    hover: "hover:bg-pink-200",
  },
  {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-600",
    hover: "hover:bg-teal-200",
  },
  {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-600",
    hover: "hover:bg-cyan-200",
  },
  {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-600",
    hover: "hover:bg-rose-200",
  },
];

@Injectable({ providedIn: "root" })
export class ColorThemeService {
  private colorMap: Record<string, number> = {};

  private getIndex(key: string): number {
    const normalized = key.toLowerCase();

    if (!(normalized in this.colorMap)) {
      const existing = Object.values(this.colorMap);
      const available = CLASS_COLORS.map((_, i) => i).filter(
        (i) => !existing.includes(i)
      );
      const index = available.length
        ? available[0]
        : Math.floor(Math.random() * CLASS_COLORS.length);
      this.colorMap[normalized] = index;
    }

    return this.colorMap[normalized];
  }

  getBackgroundColor(key: string): string {
    const i = this.getIndex(key);
    return `${CLASS_COLORS[i].bg} ${CLASS_COLORS[i].hover}`;
  }

  getBorderColor(key: string): string {
    const i = this.getIndex(key);
    return `${CLASS_COLORS[i].border} ${CLASS_COLORS[i].text}`;
  }

  getTextColor(key: string): string {
    const i = this.getIndex(key);
    return `${CLASS_COLORS[i].text}`;
  }

  getBadgeColor(key: string): string {
    const i = this.getIndex(key);
    return `${CLASS_COLORS[i].bg} ${CLASS_COLORS[i].text}`;
  }

  getFullColorSet(key: string) {
    const i = this.getIndex(key);
    return CLASS_COLORS[i];
  }
}
