# RdvFacile

SaaS de prise de rendez-vous conçu pour le marché africain. Les clients prennent rendez-vous directement via **WhatsApp**, sans application à télécharger. Le professionnel gère son agenda depuis un **back-office web Angular**, accessible depuis n'importe quel navigateur.

---

## Table des matières

- [Vision](#vision)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [API REST](#api-rest)
- [Modèle de données](#modèle-de-données)
- [Règles métier](#règles-métier)
- [Intégration WhatsApp](#intégration-whatsapp)
- [Plans tarifaires](#plans-tarifaires)
- [Structure du projet](#structure-du-projet)
- [Roadmap MVP](#roadmap-mvp)

---

## Vision

Permettre à n'importe quel commerce (coiffeur, médecin, esthéticienne…) de gérer ses rendez-vous automatiquement via WhatsApp, sans formation technique.

**Flux client :**
```
Client WhatsApp → Twilio → Webhook Spring Boot → Logique RDV → Confirmation WhatsApp
```

---

## Architecture

| Couche | Technologie |
|---|---|
| Backend | Spring Boot 3.2, Java 21 |
| Base de données (dev) | H2 en mémoire — aucune installation |
| Base de données (prod) | PostgreSQL 16 + Flyway |
| Sécurité | JWT (JJWT 0.12) + Spring Security |
| Frontend | Angular 17 (standalone components) |
| UI | Angular Material 17 (thème vert) |
| Agenda | FullCalendar 6 |
| État (Angular) | Signals |
| WhatsApp | Twilio API |

---

## Prérequis

- Java 21+
- Maven 3.9+
- Node.js 20+
- Un compte [Twilio](https://twilio.com) (optionnel — mode mock disponible)

---

## Démarrage rapide

### 1. Cloner le projet

```bash
git clone https://github.com/votre-org/rdvfacile.git
cd rdvfacile
```

### 2. Lancer le backend (H2 en mémoire — aucune installation de base de données requise)

```bash
./backend/start.sh
# ou directement :
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev
```

L'API démarre en quelques secondes sur **http://localhost:8080/api**

> Console H2 (inspecter la base de données) : **http://localhost:8080/api/h2-console**
> - JDBC URL : `jdbc:h2:mem:rdvfacile`
> - User : `sa` / Password : *(vide)*

### 3. Lancer le frontend Angular

```bash
cd frontend-web
npm install
npm start
# ou :
./node_modules/.bin/ng serve --open
```

Le back-office est disponible sur **http://localhost:4200**

Le proxy Angular redirige automatiquement `/api/*` vers `http://localhost:8080/api`.

---

### Mode production (PostgreSQL)

Configurer les variables d'environnement puis lancer sans le profil `dev` :

```bash
export DB_USERNAME=rdvfacile
export DB_PASSWORD=motdepasse
export JWT_SECRET=votre-cle-secrete-256-bits
mvn -f backend/pom.xml spring-boot:run
```

---

## Variables d'environnement

Utilisées uniquement en **mode production** (profil par défaut, PostgreSQL). En mode `dev`, H2 est utilisé sans configuration.

| Variable | Description | Défaut |
|---|---|---|
| `DB_USERNAME` | Utilisateur PostgreSQL | `rdvfacile` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `rdvfacile123` |
| `JWT_SECRET` | Clé secrète JWT (min. 256 bits) | *(à changer impérativement en prod)* |
| `TWILIO_ACCOUNT_SID` | SID Twilio | *(vide = mode mock)* |
| `TWILIO_AUTH_TOKEN` | Token Twilio | *(vide = mode mock)* |
| `TWILIO_WHATSAPP_FROM` | Numéro Twilio WhatsApp | `whatsapp:+14155238886` |

> **Mode mock** : si `TWILIO_ACCOUNT_SID` est vide, les messages sont loggés en console sans être envoyés.

---

## API REST

Base URL : `http://localhost:8080/api`

### Authentification

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Créer un compte + business | Non |
| `POST` | `/auth/login` | Se connecter | Non |

Toutes les routes suivantes nécessitent le header :
```
Authorization: Bearer <token>
```

### Services

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/services` | Lister les services actifs |
| `POST` | `/services` | Créer un service |
| `PUT` | `/services/{id}` | Modifier un service |
| `DELETE` | `/services/{id}` | Désactiver un service (soft delete) |

### Clients

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | Lister les clients |
| `POST` | `/customers` | Créer un client |
| `PUT` | `/customers/{id}` | Modifier un client |
| `DELETE` | `/customers/{id}` | Supprimer un client |

### Rendez-vous

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/appointments` | Tous les RDV |
| `GET` | `/appointments/range?start=&end=` | RDV par plage de dates |
| `GET` | `/appointments/{id}` | Détail d'un RDV |
| `POST` | `/appointments` | Créer un RDV |
| `PUT` | `/appointments/{id}` | Modifier un RDV |
| `PATCH` | `/appointments/{id}/status` | Changer le statut |
| `GET` | `/appointments/slots?serviceId=&date=` | Créneaux disponibles |

### Webhook WhatsApp

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/webhooks/whatsapp` | Réception messages Twilio |

---

### Exemples de requêtes

**Inscription :**
```json
POST /auth/register
{
  "businessName": "Salon Mariama",
  "businessPhone": "+221771234567",
  "businessAddress": "Dakar, Plateau",
  "fullName": "Mariama Diallo",
  "email": "mariama@example.com",
  "password": "motdepasse123"
}
```

**Créer un rendez-vous :**
```json
POST /appointments
{
  "customerId": "uuid-du-client",
  "serviceId": "uuid-du-service",
  "startTime": "2026-04-15T10:00:00",
  "notes": "Première visite"
}
```

**Changer le statut :**
```json
PATCH /appointments/{id}/status
{
  "status": "DONE"
}
```

---

## Modèle de données

```
Business (1) ──────────── (N) User
    │
    ├── (N) Service
    ├── (N) Customer
    └── (N) Appointment ──── Customer
                         └── Service
```

**Isolation multi-tenant** : chaque requête est filtrée par `business_id` extrait du JWT. Un professionnel ne peut jamais accéder aux données d'un autre business.

### Statuts de rendez-vous

| Statut | Description |
|---|---|
| `BOOKED` | Confirmé |
| `CANCELLED` | Annulé |
| `DONE` | Terminé |

---

## Règles métier

- **Anti-chevauchement** : un nouveau RDV est refusé si un autre RDV actif (non annulé) occupe déjà le créneau pour le même business.
- **Horaires d'ouverture** : les RDV doivent rester dans la plage `opening_time` / `closing_time` du business.
- **Validation backend only** : toute validation de créneaux se fait côté serveur, jamais côté client uniquement.
- **Plan FREE** : limité à 30 RDV par mois. Au-delà, les créations sont bloquées avec un message d'upgrade.
- **Rappels automatiques** : tâche cron (toutes les heures) qui envoie un message WhatsApp 24h avant chaque RDV.

---

## Intégration WhatsApp

### Configuration Twilio

1. Créer un compte sur [twilio.com](https://twilio.com)
2. Activer le bac à sable WhatsApp
3. Configurer le webhook vers : `https://votre-domaine.com/api/webhooks/whatsapp`
4. Méthode HTTP : `POST`

### Flux de conversation MVP

```
[Client] Bonjour !
[Bot]    Bonjour ! Quel service souhaitez-vous ?

[Client] Coupe femme
[Bot]    Voici les créneaux disponibles :
         1. 15/04/2026 à 10:00
         2. 15/04/2026 à 11:00
         3. 16/04/2026 à 09:00

[Client] 1
[Bot]    ✅ Votre rendez-vous est confirmé pour le 15/04/2026 à 10:00 !

[J-1]   ⏰ Rappel : vous avez RDV demain à 10:00 chez Salon Mariama.
```

### Annulation

Le client peut répondre `ANNULER` à tout moment pour annuler son dernier RDV actif.

---

## Plans tarifaires

| Plan | Prix | Limite |
|---|---|---|
| **Free** | Gratuit | 30 RDV / mois |
| **Pro** | 10 000 FCFA / mois | Illimité |
| **Pro+** | 15 000 FCFA / mois | Illimité + fonctionnalités avancées |

Paiement accepté via WhatsApp / Mobile Money (Orange Money, Wave…).

---

## Structure du projet

```
RdvFacile/
├── .gitignore
│
├── backend/                                   ← Spring Boot 3.2 / Java 21
│   ├── start.sh                               ← Script de démarrage dev (H2)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/rdvfacile/
│       │   ├── RdvFacileApplication.java
│       │   ├── config/
│       │   │   └── SecurityConfig.java        ← JWT, CORS, STATELESS
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── AppointmentController.java
│       │   │   ├── ServiceController.java
│       │   │   ├── CustomerController.java
│       │   │   └── WhatsAppWebhookController.java
│       │   ├── dto/
│       │   │   ├── auth/                      ← RegisterRequest, LoginRequest, AuthResponse
│       │   │   ├── appointment/               ← AppointmentRequest, AppointmentResponse
│       │   │   ├── service/                   ← ServiceRequest, ServiceResponse
│       │   │   └── customer/                  ← CustomerRequest, CustomerResponse
│       │   ├── exception/
│       │   │   ├── BusinessException.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── model/
│       │   │   ├── Business.java
│       │   │   ├── User.java
│       │   │   ├── ServiceEntity.java
│       │   │   ├── Customer.java
│       │   │   ├── Appointment.java
│       │   │   └── enums/
│       │   │       ├── AppointmentStatus.java
│       │   │       ├── PlanType.java
│       │   │       └── UserRole.java
│       │   ├── repository/
│       │   │   ├── AppointmentRepository.java ← Anti-chevauchement JPQL
│       │   │   ├── BusinessRepository.java
│       │   │   ├── CustomerRepository.java
│       │   │   ├── ServiceRepository.java
│       │   │   └── UserRepository.java
│       │   ├── security/
│       │   │   ├── JwtUtils.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── AppointmentService.java    ← Logique créneaux + limite plan
│       │       ├── CustomerService.java
│       │       ├── ServiceEntityService.java
│       │       └── WhatsAppService.java       ← Twilio + cron rappels
│       └── resources/
│           ├── application.yml                ← Config prod (PostgreSQL)
│           ├── application-dev.yml            ← Config dev (H2 en mémoire)
│           └── db/migration/
│               └── V1__initial_schema.sql     ← Flyway (prod uniquement)
│
└── frontend-web/                              ← Angular 17 (back-office web)
    ├── package.json
    ├── angular.json
    ├── proxy.conf.json                        ← /api → localhost:8080
    └── src/app/
        ├── app.config.ts                      ← provideRouter, JWT interceptor
        ├── app.routes.ts                      ← Routes lazy-loaded + guards
        ├── core/
        │   ├── models/                        ← auth, appointment, service, customer
        │   ├── guards/                        ← auth.guard, guest.guard
        │   ├── interceptors/                  ← jwt.interceptor (Bearer token)
        │   └── services/                      ← auth, appointment, service-api, customer
        ├── shared/
        │   └── layout/shell/                  ← Sidebar + topbar (MatSidenav)
        └── features/
            ├── auth/login/                    ← Formulaire de connexion
            ├── auth/register/                 ← Création compte + business
            ├── dashboard/                     ← Statistiques du jour
            ├── appointments/                  ← Agenda FullCalendar semaine
            ├── services/                      ← CRUD services (table + dialog)
            └── customers/                     ← CRUD clients (table + recherche)
```

---

## Roadmap MVP (30 jours)

| Semaine | Tâches |
|---|---|
| **S1** | ✅ Setup projet, Auth JWT, schéma DB |
| **S2** | ✅ CRUD Services + Clients, back-office Angular |
| **S3** | ✅ Agenda FullCalendar, logique anti-chevauchement, créneaux disponibles |
| **S4** | Intégration Twilio WhatsApp complète, tests terrain, déploiement |

---

## Objectifs de lancement

- [ ] 10 commerces utilisateurs actifs
- [ ] 5 clients payants (plan Pro)
- [ ] Validation du marché local (Dakar)
