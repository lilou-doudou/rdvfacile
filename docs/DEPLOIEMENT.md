# Guide de déploiement — RdvFacile

## Architecture de production

```
[Utilisateur]
    │
    ▼
[Vercel] — frontend Angular
    │  proxy /api/* → Render
    ▼
[Render] — backend Spring Boot
    │  JDBC PostgreSQL
    ▼
[Neon] — base de données PostgreSQL
```

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
| Frontend   | `https://rdvfacile.vercel.app`                  |
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
