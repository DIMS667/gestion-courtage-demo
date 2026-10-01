# Gestion du courtage — démonstration interactive

Application React + Vite destinée à présenter le futur back-office d’un cabinet de courtage en assurance.

Cette version est une démonstration : elle n’utilise ni backend, ni API externe, ni paiement réel, ni donnée personnelle réelle. Toutes les opérations sont simulées dans le navigateur et persistées dans `localStorage`.

## Périmètre fonctionnel

- connexion de démonstration ;
- tableau de bord et rapports ;
- clients et fiche client 360° ;
- pipeline d’opportunités ;
- préparation de propositions en six étapes ;
- comparaison de plusieurs offres assureurs ;
- polices, risques, garanties et transactions ;
- compagnies et transmissions assureurs ;
- factures, paiements et commissions ;
- documents, renouvellements et sinistres ;
- utilisateurs, rôles et paramètres.

Le portail client est volontairement exclu de cette première version.

## Architecture

```text
src/
  courtier-app.tsx   Coque applicative, vues, dialogues et interactions
  demo-data.ts       Modèle relationnel et génération des données fictives
app/
  page.tsx           Point d’entrée de l’application
  globals.css        Thème, composants métier et responsive
components/ui/       Composants d’interface réutilisables
public/favicon.svg   Icône neutre de la démonstration
```

Le dataset est relationnel :

```text
Client → Opportunité → Proposition → Offre → Police
                                      ├→ Facture → Paiement
                                      ├→ Commission
                                      ├→ Document
                                      └→ Sinistre / Renouvellement
```

Les références `CL-xxx`, `OPP-xxx`, `PROP-xxx`, `POL-xxx`, `FAC-xxx`, `PAY-xxx` et `COM-xxx` sont partagées entre les modules concernés.

## Jeu de démonstration

- 184 clients ;
- 42 opportunités ;
- 28 propositions initiales, chacune avec trois offres ;
- 267 polices ;
- 267 factures et plus de 200 paiements ;
- 267 lignes de commission ;
- 18 sinistres ;
- 16 transmissions assureurs ;
- 72 documents fictifs.

## Lancer en local

Prérequis : Node.js 22 ou plus récent.

```powershell
cd "C:\PROJET DEV\App_courtier\plateforme-courtage-demo"
npm install
npm run dev
```

Ouvrir ensuite l’adresse affichée par Vite, généralement `http://127.0.0.1:5173/`.

## Construire la version de production

```powershell
npm run build
npm run start
```

La version statique optimisée est générée dans `dist/`.

## Déployer en ligne

### Option recommandée — Render

Le fichier `render.yaml` inclus à la racine configure automatiquement le projet comme site statique.

1. Placer ce dossier dans un dépôt GitHub, GitLab ou Bitbucket.
2. Dans Render, choisir **New > Blueprint**.
3. Connecter le dépôt qui contient ce projet.
4. Render détecte `render.yaml`, exécute `npm ci && npm run build` et publie le dossier `dist`.
5. Une adresse publique en `onrender.com` est fournie à la fin du déploiement.

En configuration manuelle, choisir **New > Static Site**, puis utiliser :

- Build Command : `npm ci && npm run build`
- Publish Directory : `dist`

### Option 2 — Netlify

1. Créer un nouveau site à partir du dépôt Git du projet.
2. Choisir `npm run build` comme commande de construction.
3. Choisir `dist` comme dossier de publication.
4. Ne configurer aucune variable d’environnement.
5. Déployer.

### Option 3 — Vercel

1. Importer le dépôt Git.
2. Sélectionner le framework `Vite`.
3. Conserver `npm run build` comme commande de construction.
4. Utiliser `dist` comme répertoire de sortie.
5. Déployer.

### Option 4 — Cloudflare Pages

1. Connecter le dépôt Git dans Pages.
2. Utiliser le preset `Vite`.
3. Utiliser `npm run build` comme commande de construction.
4. Utiliser `dist` comme dossier de sortie.
5. Déployer.

L’application est une SPA sans routes serveur : aucune redirection spéciale n’est nécessaire dans cette version.

## Vérifications réalisées

- construction Vite de production ;
- vérification TypeScript ;
- connexion et accès au dashboard ;
- navigation dans tous les groupes du menu ;
- fiche client 360° ;
- changement d’étape d’une opportunité ;
- assistant de proposition et comparatif assureurs ;
- enregistrement et affectation d’un paiement ;
- modification du statut d’un sinistre ;
- affichage desktop et mobile ;
- navigation mobile avec fermeture automatique du menu.
