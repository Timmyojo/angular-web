// export const sanitanize = (object: Object) =>  {
//     return Object.keys(object).filter(key => !!object[key]).map((key) => )

// }

export const wait = async (delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), delay);
  });
};

export function goToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function convertToProfileFormat(data: any) {
  return {
    personalInfo: {
      name: data.name || "Utilisateur",
      title: data.profession || "Professionnel",
      email: data.account?.email || "",
      phone: data.phone || "",
      address: data.placeOfBirth || "",
      website: data.website || "",
      profile: data.photoFileId
        ? `/images/${data.photoFileId}`
        : "/images/profil.png",
      sexe: data.gender || data.sexe || "non spécifié",
    },
    experiences: data.experiences || [],
    education: data.education || [],
    skills:
      data.skills?.map((skill: { name: any; level: any }, index: number) => ({
        id: index + 1,
        name: skill.name || skill,
        level: skill.level || "Débutant",
      })) || [],
    languages:
      data.languages?.map((lang: { name: any; level: any }, index: number) => ({
        id: index + 1,
        name: lang.name || lang,
        level: lang.level || "Débutant",
      })) || [],
    certifications: data.certifications || [], // Array vide si pas de certifications
    metadata: {
      id: data.id,
      accountId: data.accountId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      bio: data.bio,
      nationality: data.nationality,
      notes: data.notes,
      resumeUrl: data.resumeUrl,
      tools: data.tools,
      archived: data.archived,
      deleted: data.deleted,
    },
  };
}

export function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} Ko`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} Mo`;
}

export function formatDateForInput(date: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // retourne '2025-08-13'
}

export const clearSpaces = (str: string) => {
  return str.replace(/\s/g, "");
};

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
