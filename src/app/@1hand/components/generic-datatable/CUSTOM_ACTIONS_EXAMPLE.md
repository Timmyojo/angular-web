# Generic Datatable - Actions Personnalisées

## Vue d'ensemble

Le composant `generic-datatable` supporte maintenant les boutons d'action personnalisés dans la colonne d'actions. Cette fonctionnalité permet d'ajouter des boutons spécifiques avec des icônes, du texte optionnel, des tooltips et des callbacks personnalisés.

## Interface CustomActionButton

```typescript
export interface CustomActionButton<T = any> {
  icon: string; // classe CSS de l'icône (ex: 'fas fa-credit-card')
  text?: string; // texte optionnel à afficher à côté de l'icône
  title: string; // tooltip du bouton
  callback: (item: T) => void; // fonction à appeler lors du clic
  color?: string; // couleur personnalisée (ex: 'blue', 'green', 'red')
  visible?: (item: T) => boolean; // fonction pour déterminer si le bouton doit être visible
}
```

## Utilisation

### Exemple basique - Bouton de paiement pour les étudiants

```typescript
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import {
  CustomActionButton,
  GenericDatatableColumnDef,
} from "@1hand/components/generic-datatable/generic-datatable.component";

interface Student {
  id: number;
  name: string;
  email: string;
  hasUnpaidFees: boolean;
}

@Component({
  selector: "app-students-list",
  template: `
    <app-generic-datatable
      [items]="students"
      [columns]="columns"
    ></app-generic-datatable>
  `,
})
export class StudentsListComponent {
  students: Student[] = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean@example.com",
      hasUnpaidFees: true,
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie@example.com",
      hasUnpaidFees: false,
    },
  ];

  columns: GenericDatatableColumnDef<Student>[] = [
    { key: "name", label: "Nom" },
    { key: "email", label: "Email" },
    {
      label: "Actions",
      canView: true,
      canEdit: true,
      canDelete: true,
      customActions: [
        {
          icon: "fas fa-credit-card",
          title: "Aller au paiement",
          color: "green",
          callback: (student: Student) => {
            this.router.navigate(["/payments", student.id]);
          },
          visible: (student: Student) => student.hasUnpaidFees,
        },
        {
          icon: "fas fa-envelope",
          text: "Email",
          title: "Envoyer un email",
          color: "blue",
          callback: (student: Student) => {
            window.location.href = `mailto:${student.email}`;
          },
        },
      ],
    },
  ];

  constructor(private router: Router) {}
}
```

### Exemple avancé - Multiples actions conditionnelles

```typescript
customActions: [
  // Bouton de paiement (visible seulement si l'étudiant a des frais impayés)
  {
    icon: "fas fa-credit-card",
    title: "Aller au paiement",
    color: "green",
    callback: (student: Student) => {
      this.router.navigate(["/payments", student.id]);
    },
    visible: (student: Student) => student.hasUnpaidFees,
  },

  // Bouton d'envoi d'email
  {
    icon: "fas fa-envelope",
    title: "Envoyer un email",
    color: "blue",
    callback: (student: Student) => {
      this.openEmailDialog(student);
    },
  },

  // Bouton de téléchargement de relevé
  {
    icon: "fas fa-download",
    text: "Relevé",
    title: "Télécharger le relevé de notes",
    color: "purple",
    callback: (student: Student) => {
      this.downloadTranscript(student.id);
    },
  },

  // Bouton d'archivage (visible seulement pour les étudiants inactifs)
  {
    icon: "fas fa-archive",
    title: "Archiver l'étudiant",
    color: "yellow",
    callback: (student: Student) => {
      this.archiveStudent(student);
    },
    visible: (student: Student) => !student.isActive,
  },
];
```

## Couleurs disponibles

Les couleurs prédéfinies sont :

- `blue` (par défaut)
- `green`
- `red`
- `yellow`
- `purple`
- `orange`

## Fonctionnalités

1. **Icônes personnalisées** : Utilisez n'importe quelle classe CSS d'icône (FontAwesome, etc.)
2. **Texte optionnel** : Ajoutez du texte à côté de l'icône
3. **Tooltips** : Chaque bouton peut avoir un tooltip explicatif
4. **Callbacks personnalisés** : Définissez la logique à exécuter lors du clic
5. **Visibilité conditionnelle** : Affichez/masquez les boutons selon des conditions
6. **Couleurs personnalisées** : Choisissez parmi plusieurs couleurs prédéfinies
7. **Intégration transparente** : Les boutons personnalisés s'intègrent parfaitement avec les actions standard (voir, éditer, supprimer)

## Notes importantes

- Les actions personnalisées sont affichées après les actions standard (voir, éditer, supprimer)
- La fonction `visible` est optionnelle - si elle n'est pas fournie, le bouton sera toujours visible
- La couleur par défaut est `blue` si aucune couleur n'est spécifiée
- Le texte est optionnel et s'affiche à droite de l'icône
