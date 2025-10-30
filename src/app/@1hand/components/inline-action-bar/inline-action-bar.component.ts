import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";

export interface ActionMenuItem {
  title: string;
  description?: string;
  icon: string; // ex: 'fas fa-users'
  color?: string; // ex: 'bg-blue-500'
  hoverColor?: string; // ex: 'hover:bg-blue-600'
  action: string; // ex: 'students'
  count?: number;
  disabled?: boolean;
}

@Component({
  selector: "app-inline-action-bar",
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./inline-action-bar.component.html",
})
export class InlineActionBarComponent {
  /** Données à afficher */
  @Input() items: ActionMenuItem[] = [];
  /** Empêche le retour à la ligne sur petits écrans */
  @Input() nowrap = true;
  /** Affiche la description en tooltip (title) */
  @Input() showTooltips = true;
  /** Désactive globalement tous les éléments */
  @Input() disabled = false;

  /** Événement émis au clic sur un menu */
  @Output() menuClick = new EventEmitter<{
    action: string;
    item: ActionMenuItem;
  }>();

  trackByAction = (_: number, item: ActionMenuItem) => item.action;

  handleClick(item: ActionMenuItem, ev: Event) {
    // Empêcher l'action si l'élément ou le composant entier est désactivé
    if (item.disabled || this.disabled) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    this.menuClick.emit({ action: item.action, item });
  }

  /** Gère les événements clavier pour l'accessibilité */
  handleKeydown(item: ActionMenuItem, ev: KeyboardEvent) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      this.handleClick(item, ev);
    }
  }

  /** Vérifie si un élément est désactivé (individuellement ou globalement) */
  isItemDisabled(item: ActionMenuItem): boolean {
    return !!(item.disabled || this.disabled);
  }

  /** Convertit 'bg-blue-500' -> 'text-blue-500' pour la couleur d'icône */
  getTextColor(bg?: string | null): string | null {
    return !!bg ? bg.replace("bg-", "text-") : null;
  }

  /** Convertit 'hover:bg-blue-600' -> 'hover:text-blue-600' pour le survol */
  getHoverTextColor(hoverBg?: string | null): string | null {
    return hoverBg ? hoverBg.replace("hover:bg-", "hover:text-") : null;
  }

  /** Retourne les classes CSS appropriées pour un élément */
  getItemClasses(item: ActionMenuItem): Record<string, boolean> {
    const isDisabled = this.isItemDisabled(item);

    return {
      "text-gray-700 hover:text-gray-900": !isDisabled,
      "text-gray-300": isDisabled,
      "hover:bg-gray-100 active:bg-gray-200": !isDisabled && !item.hoverColor,
      [this.getHoverTextColor(item.hoverColor) || "hover:text-blue-600"]:
        !isDisabled && !!item.hoverColor,
    };
  }

  /** Retourne les classes CSS appropriées pour les icônes */
  getIconClasses(item: ActionMenuItem): Record<string, boolean> {
    const isDisabled = this.isItemDisabled(item);
    const textColor = this.getTextColor(item.color) || "text-blue-500";

    return {
      [textColor]: !isDisabled,
      "text-gray-300": isDisabled,
    };
  }

  /** Retourne les classes CSS appropriées pour les badges de comptage */
  getBadgeClasses(item: ActionMenuItem): Record<string, boolean> {
    const isDisabled = this.isItemDisabled(item);
    const bgColor = item.color || "bg-blue-500";

    return {
      [bgColor]: !isDisabled,
      "bg-gray-300": isDisabled,
    };
  }
}
