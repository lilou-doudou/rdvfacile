# Guide de déploiement — RdvFacile

## Architecture de production

> Etat du depot au 28 avril 2026 :
> - le frontend de production est deploie sur Vercel
> - le frontend pointe actuellement vers un backend DigitalOcean App Platform
> - le depot contient aussi une configuration `render.yaml`, qui correspond a un ancien/deuxieme mode de deploiement du backend
> - la base de donnees de reference documentee reste Neon PostgreSQL

```
[Utilisateur]
    │
    ▼
[Vercel] — frontend Angular
    │  appels API → backend de production
    ▼
[DigitalOcean App Platform ou Render] — backend Spring Boot
    │  JDBC PostgreSQL
    ▼
[Neon] — base de données PostgreSQL
```

## Etat actuel detecte dans le code

### Frontend

- `frontend-web/vercel.json` redirige `/api/*` vers `https://rdvfacile-df5iu.ondigitalocean.app/api/$1`
- `frontend-web/src/environments/environment.production.ts` utilise aussi `https://rdvfacile-df5iu.ondigitalocean.app/api`
- conclusion : la production actuellement versionnee dans le depot cible **DigitalOcean** pour le backend

### Backend

- `render.yaml` existe toujours et permet de deployer le backend sur **Render**
- `backend/Dockerfile` permet aussi un deploiement conteneurise compatible avec **DigitalOcean App Platform**
- conclusion : le backend peut etre redeploye sur **Render** ou **DigitalOcean**, mais la configuration frontend actuelle suppose **DigitalOcean**

---

## Checklist nouvel ordinateur

Si tu changes de machine, voici ce qu'il faut recuperer en priorite :

1. Acces GitHub au depot `rdvfacile`
2. Acces Vercel au projet frontend
3. Acces au backend de production :
   - soit DigitalOcean App Platform
   - soit Render si tu veux reutiliser `render.yaml`
4. Acces Neon pour la base PostgreSQL
5. Acces Twilio si l'envoi WhatsApp est actif
6. Les secrets suivants :
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM`

### Outils a reinstaller localement

- `git`
- `java 21`
- `maven`
- `node.js 20+`
- `npm`
- `vercel` CLI optionnel
- `doctl` optionnel si tu geres DigitalOcean en CLI
- `render` CLI optionnel si tu geres Render autrement que via le dashboard

---

## Étape 1 — Base de données PostgreSQL sur Neon

### 1.1 Créer la base

1. Aller sur [https://neon.tech](https://neon.tech) et créer un compte (gratuit)
2. Créer un nouveau projet : `rdvfacile`
3. Dans le projet, créer une base : `rdvfacile_bd`
4. Copier les informations de connexion dans **Connection Details** → choisir le format **JDBC**

### 1.2 Informations à récupérer

| Variable      | Valeur exemple Neon                                                       |
|---------------|---------------------------------------------------------------------------|
| `DB_URL`      | `jdbc:postgresql://ep-xxx.us-east-2.aws.neon.tech/rdvfacile_bd?sslmode=require` |
| `DB_USERNAME` | `neondb_owner` (affiché dans Neon)                                        |
| `DB_PASSWORD` | `xxxxxxxxxxxx` (affiché dans Neon)                                        |

> Garder ces valeurs pour l'étape 2.

---

## Étape 2 — Backend sur Render

### 2.1 Créer le service

1. Aller sur [https://render.com](https://render.com) et créer un compte
2. **New** → **Web Service**
3. Connecter le dépôt GitHub : `lilou-doudou/rdvfacile`
4. Paramètres :

| Champ            | Valeur                                             |
|------------------|----------------------------------------------------|
| Name             | `rdvfacile-backend`                                |
| Root Directory   | `backend`                                          |
| Environment      | `Java`                                             |
| Build Command    | `mvn clean package -DskipTests`                    |
| Start Command    | `java -jar target/rdvfacile-backend-0.0.1-SNAPSHOT.jar` |
| Health Check Path| `/api/actuator/health`                             |
| Plan             | Free                                               |

### 2.2 Variables d'environnement à configurer dans Render

Aller dans **Environment** → ajouter les variables suivantes :

| Variable              | Valeur                                      |
|-----------------------|---------------------------------------------|
| `DB_URL`              | URL JDBC Neon (ex: `jdbc:postgresql://...`) |
| `DB_USERNAME`         | Utilisateur Neon                            |
| `DB_PASSWORD`         | Mot de passe Neon                           |
| `JWT_SECRET`          | Clé secrète JWT (min. 64 caractères)        |
| `TWILIO_ACCOUNT_SID`  | SID Twilio (laisser vide si non utilisé)    |
| `TWILIO_AUTH_TOKEN`   | Token Twilio (laisser vide si non utilisé)  |
| `TWILIO_WHATSAPP_FROM`| `whatsapp:+14155238886`                     |

### 2.3 Générer une clé JWT sécurisée

```bash
openssl rand -base64 64
```

### 2.4 Vérifier le déploiement

Une fois déployé, l'URL sera du type :
`https://rdvfacile-backend.onrender.com`

Tester : `https://rdvfacile-backend.onrender.com/api/actuator/health`

→ Réponse attendue : `{"status":"UP"}`

> **Important** : noter l'URL exacte du service Render, elle sera nécessaire à l'étape 3.

---

## Étape 3 — Frontend sur Vercel

### 3.1 Mettre à jour vercel.json avec l'URL Render

Dans `frontend-web/vercel.json`, remplacer l'URL par celle obtenue à l'étape 2 :

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://rdvfacile-backend.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Committer et pousser ce changement avant de déployer sur Vercel.

### 3.2 Déployer sur Vercel

1. Aller sur [https://vercel.com](https://vercel.com) et créer un compte
2. **Add New Project** → importer `lilou-doudou/rdvfacile`
3. Paramètres :

| Champ             | Valeur                          |
|-------------------|---------------------------------|
| Root Directory    | `frontend-web`                  |
| Framework Preset  | `Angular`                       |
| Build Command     | `npm run build`                 |
| Output Directory  | `dist/rdvfacile-backoffice/browser` |

4. Pas de variable d'environnement nécessaire (le proxy Vercel redirige vers Render)
5. Cliquer **Deploy**

### 3.3 Vérifier le déploiement

L'URL sera du type : `https://rdvfacile.vercel.app`

Tester la connexion à l'API : `https://rdvfacile.vercel.app/api/actuator/health`

---

## Récapitulatif des URLs de production

| Service    | URL                                             |
|------------|-------------------------------------------------|
| Frontend   | `https://rdvfacile-ten.vercel.app`              |
| Backend    | `https://rdvfacile-backend.onrender.com`        |
| API Health | `https://rdvfacile-backend.onrender.com/api/actuator/health` |
| Base       | Neon (accès uniquement depuis le backend)       |

---

## Variables d'environnement — récapitulatif complet

### Backend (Render)

| Variable              | Description                          | Obligatoire |
|-----------------------|--------------------------------------|-------------|
| `DB_URL`              | URL JDBC de la base Neon             | Oui         |
| `DB_USERNAME`         | Utilisateur PostgreSQL Neon          | Oui         |
| `DB_PASSWORD`         | Mot de passe PostgreSQL Neon         | Oui         |
| `JWT_SECRET`          | Clé secrète JWT (64+ caractères)     | Oui         |
| `TWILIO_ACCOUNT_SID`  | Account SID Twilio WhatsApp          | Non         |
| `TWILIO_AUTH_TOKEN`   | Auth Token Twilio                    | Non         |
| `TWILIO_WHATSAPP_FROM`| Numéro WhatsApp Twilio               | Non         |

### Frontend (Vercel)

Aucune variable d'environnement requise.

---

## Fichiers de configuration modifiés pour la production

| Fichier                                          | Modification                                   |
|--------------------------------------------------|------------------------------------------------|
| `backend/src/main/resources/application.yml`     | `DB_URL`, `PORT` injectés via variables env    |
| `backend/pom.xml`                                | Ajout de `spring-boot-starter-actuator`        |
| `render.yaml`                                    | Config du service Render                       |
| `frontend-web/vercel.json`                       | Proxy `/api/*` vers Render                     |
