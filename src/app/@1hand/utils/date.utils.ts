/**
 * Utilitaires pour le formatage des dates
 */

/**
 * Formate une date avec l'heure au format français
 * @param date - La date à formater (Date, string ou number)
 * @param options - Options de formatage personnalisées
 * @returns La date formatée avec l'heure (ex: "07/09/2025 à 14:30")
 */
export function formatDateWithTime(
  date: Date | string | number,
  options?: {
    locale?: string;
    dateStyle?: "short" | "medium" | "long";
    timeStyle?: "short" | "medium";
    separator?: string;
  }
): string {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const {
    locale = "fr-FR",
    dateStyle = "short",
    timeStyle = "short",
    separator = " à ",
  } = options || {};

  const dateFormatted = dateObj.toLocaleDateString(locale, {
    dateStyle: dateStyle,
  });

  const timeFormatted = dateObj.toLocaleTimeString(locale, {
    timeStyle: timeStyle,
  });

  return `${dateFormatted}${separator}${timeFormatted}`;
}

/**
 * Formate une date sans l'heure au format français
 * @param date - La date à formater (Date, string ou number)
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns La date formatée (ex: "07/09/2025")
 */
export function formatDateOnly(
  date: Date | string | number,
  locale: string = "fr-FR"
): string {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString(locale);
}

/**
 * Formate l'heure seulement
 * @param date - La date à formater (Date, string ou number)
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns L'heure formatée (ex: "14:30")
 */
export function formatTimeOnly(
  date: Date | string | number,
  locale: string = "fr-FR"
): string {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleTimeString(locale, {
    timeStyle: "short",
  });
}

/**
 * Formate une date de manière relative (il y a X temps)
 * @param date - La date à formater (Date, string ou number)
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns La date relative (ex: "il y a 2 heures")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = "fr-FR"
): string {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Utiliser Intl.RelativeTimeFormat si disponible
  if (Intl.RelativeTimeFormat) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, "second");
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
    }
  }

  // Fallback pour les navigateurs plus anciens
  if (diffInSeconds < 60) {
    return "à l'instant";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  } else {
    return formatDateOnly(dateObj, locale);
  }
}

/**
 * Vérifie si une date est aujourd'hui
 * @param date - La date à vérifier
 * @returns true si la date est aujourd'hui
 */
export function isToday(date: Date | string | number): boolean {
  if (!date) return false;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Vérifie si une date est hier
 * @param date - La date à vérifier
 * @returns true si la date est hier
 */
export function isYesterday(date: Date | string | number): boolean {
  if (!date) return false;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateObj.toDateString() === yesterday.toDateString();
}
