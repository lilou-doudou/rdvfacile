# Deploiement de test gratuit

Stack recommandee pour ce projet :

- Frontend Angular : Vercel
- Backend Spring Boot : Render
- Base PostgreSQL : Neon

## 1. Creer la base sur Neon

Creer un projet PostgreSQL gratuit sur Neon puis recuperer :

- l'hote
- le port
- le nom de la base
- l'utilisateur
- le mot de passe

Construire ensuite `DB_URL` au format :

```text
jdbc:postgresql://HOST:PORT/DBNAME?sslmode=require
```

Exemple :

```text
jdbc:postgresql://ep-xxxx.eu-west-3.aws.neon.tech/neondb?sslmode=require
```

## 2. Deployer le backend sur Render

Le repo contient deja un fichier [render.yaml](/Users/sergepatrick/workspace/RdvFacile/render.yaml:1).

Sur Render :

1. Connecter le repo GitHub
2. Creer un service via `Blueprint` ou un `Web Service`
3. Si tu crées le service à la main :
   - Root directory : `backend`
   - Build command : `mvn clean package -DskipTests`
   - Start command : `java -Dserver.port=$PORT -jar target/rdvfacile-backend-0.0.1-SNAPSHOT.jar`

Variables Render a renseigner :

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `TWILIO_ACCOUNT_SID` optionnel
- `TWILIO_AUTH_TOKEN` optionnel
- `TWILIO_WHATSAPP_FROM` optionnel

URL de sante :

```text
/api/actuator/health
```

## 3. Brancher Vercel sur le backend

Le frontend reste configure avec `apiUrl: '/api'`.

Le fichier [frontend-web/vercel.json](/Users/sergepatrick/workspace/RdvFacile/frontend-web/vercel.json:1) proxy les appels `/api` vers Render. Avant de deployer, remplace :

```text
https://your-render-backend.onrender.com
```

par l'URL reelle de ton backend Render.

## 4. Deployer le frontend sur Vercel

Dans Vercel :

1. Importer le repo GitHub
2. Selectionner `frontend-web` comme Root Directory
3. Build command : `npm run build`
4. Output directory : `dist/rdvfacile-backoffice`

Le fichier `vercel.json` gere :

- le proxy `/api` vers Render
- la redirection SPA vers `index.html`

## 5. Verification rapide

Quand les deux deployments sont termines :

1. Ouvrir l'URL Vercel
2. Verifier l'inscription et la connexion
3. Verifier dans l'onglet reseau que les appels partent vers `/api/...`
4. Verifier que Render repond sur `/api/actuator/health`
