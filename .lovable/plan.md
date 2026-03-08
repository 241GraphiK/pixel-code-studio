
**Compréhension de la demande :**
Vous souhaitez enrichir l'éditeur de texte riche (WYSIWYG) avec des fonctionnalités avancées, à savoir l'ajout de liens hypertextes, l'insertion d'images et des options d'alignement du texte (gauche, centre, droite, justifié).

**Dépendances nécessaires :**
Pour ajouter ces fonctionnalités à Tiptap, nous aurons besoin de nouvelles extensions officielles :
- `@tiptap/extension-link` : pour gérer les liens.
- `@tiptap/extension-image` : pour insérer des images via URL.
- `@tiptap/extension-text-align` : pour l'alignement des paragraphes et des titres.

**Plan d'implémentation :**

1.  **Installation des extensions Tiptap :**
    Nous allons installer les paquets manquants via le gestionnaire de paquets (`bun add @tiptap/extension-link @tiptap/extension-image @tiptap/extension-text-align`).

2.  **Mise à jour du composant `RichTextEditor` (`src/components/ui/rich-text-editor.tsx`) :**
    *   **Importation :** Ajouter les imports pour `Link`, `Image` et `TextAlign` depuis Tiptap.
    *   **Configuration de l'éditeur :**
        *   Ajouter `TextAlign.configure({ types: ['heading', 'paragraph'] })`.
        *   Ajouter `Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline underline-offset-4' } })`.
        *   Ajouter `Image.configure({ HTMLAttributes: { class: 'rounded-md border border-border max-w-full' } })`.
    *   **Nouvelles icônes de la barre d'outils :** Importer `Link as LinkIcon`, `Image as ImageIcon`, `AlignLeft`, `AlignCenter`, `AlignRight`, et `AlignJustify` depuis `lucide-react`.
    *   **Fonctions d'interaction :**
        *   **Lien :** Un bouton qui ouvre une boîte de dialogue native (ex: `window.prompt`) pour saisir ou modifier l'URL du lien, ou le supprimer si le champ est vide.
        *   **Image :** Un bouton qui demande l'URL de l'image via un prompt (la méthode la plus directe) pour l'insérer au niveau du curseur.
        *   **Alignement :** Quatre boutons pour aligner le texte à gauche, au centre, à droite ou le justifier.

3.  **Adaptation du rendu CSS (`tailwind.config.ts` ou classes utilitaires) :**
    *   L'intégration de `@tailwindcss/typography` gère déjà plutôt bien les images et les liens, mais nous vérifierons que l'alignement injecté en ligne par Tiptap (ex: `style="text-align: center"`) n'est pas écrasé par les styles par défaut.

4.  **Test :**
    *   Vérifier que les nouveaux boutons apparaissent bien dans la barre d'outils de création de cours.
    *   Tester l'ajout d'une image depuis une URL publique et l'alignement d'un paragraphe pour valider le bon fonctionnement.
