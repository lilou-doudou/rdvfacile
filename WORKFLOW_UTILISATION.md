# Workflow d'utilisation de RDVFACILE

## 1. Vue d'ensemble

RDVFACILE est une application de prise de rendez-vous pensée autour de deux parcours principaux :

- le parcours du professionnel, qui utilise un back-office web pour gérer son activité
- le parcours du client, qui prend rendez-vous via WhatsApp

L'objectif est de permettre à un commerce de gérer ses rendez-vous de manière simple, sans imposer au client l'installation d'une application mobile.

## 2. Parcours du professionnel

### 2.1 Inscription

Le professionnel commence par créer son espace marchand.

Il renseigne :

- le nom du commerce
- le numéro WhatsApp du commerce
- son nom complet
- son email
- son mot de passe

Une fois l'inscription terminée :

- le compte utilisateur est créé
- le commerce est créé
- l'utilisateur est connecté automatiquement
- il est redirigé vers le tableau de bord

### 2.2 Connexion

Lors des utilisations suivantes, le professionnel se connecte avec :

- son email
- son mot de passe

Après authentification, il accède à son espace de gestion.

### 2.3 Tableau de bord

Le tableau de bord permet d'avoir une vue rapide sur l'activité du commerce.

Il affiche notamment :

- les rendez-vous du jour
- le nombre total de clients
- le nombre de services actifs
- le nombre de rendez-vous du mois

Cette page sert de point d'entrée pour le pilotage quotidien.

### 2.4 Configuration initiale

Avant de pouvoir utiliser l'application efficacement, le professionnel doit configurer sa base métier.

#### a. Création des services

Dans le module `Services`, il crée les prestations proposées par son commerce.

Pour chaque service, il définit :

- le nom du service
- la durée en minutes
- le prix
- l'état actif ou inactif

Exemples :

- coupe homme
- consultation
- soin du visage

#### b. Création des clients

Dans le module `Clients`, il ajoute les clients connus du commerce.

Pour chaque client, il peut enregistrer :

- le nom complet
- le numéro WhatsApp
- l'email

Le numéro de téléphone doit être unique pour éviter les doublons.

### 2.5 Gestion des rendez-vous

Dans le module `Rendez-vous`, le professionnel visualise son planning dans un calendrier.

Il peut :

- consulter les rendez-vous existants
- créer un nouveau rendez-vous
- cliquer sur un créneau du calendrier pour préremplir une heure
- consulter le détail d'un rendez-vous
- annuler un rendez-vous

Lors de la création d'un rendez-vous, il choisit :

- le client
- le service
- la date et l'heure de début
- des notes éventuelles

Le système calcule automatiquement l'heure de fin selon la durée du service sélectionné.

### 2.6 Règles métier appliquées par le système

À chaque création ou modification de rendez-vous, l'application vérifie :

- que le client existe bien dans le commerce concerné
- que le service existe bien dans le commerce concerné
- que le rendez-vous est dans les horaires d'ouverture
- que le créneau n'entre pas en conflit avec un autre rendez-vous
- que la limite mensuelle n'est pas atteinte pour le plan gratuit

Si une règle n'est pas respectée, le rendez-vous est refusé et un message d'erreur est affiché.

## 3. Parcours du client

Le parcours client est conçu pour fonctionner via WhatsApp.

Le client n'a pas besoin de créer de compte ni d'installer d'application.

Le principe est le suivant :

1. le client envoie un message au numéro WhatsApp du commerce
2. le système reçoit le message via Twilio
3. le système identifie le client à partir de son numéro
4. le système demande le service souhaité
5. le système propose des créneaux disponibles
6. le client choisit un créneau
7. le rendez-vous est confirmé
8. un rappel est envoyé avant le rendez-vous

Ce parcours représente la promesse produit principale de RDVFACILE : réserver simplement depuis WhatsApp.

## 4. Parcours système

Le traitement technique du rendez-vous suit ce flux :

1. le client envoie un message WhatsApp
2. WhatsApp transmet le message à Twilio
3. Twilio appelle le webhook du backend RDVFACILE
4. le backend lit le message et l'état de la conversation
5. le backend identifie ou crée le client
6. le backend prépare la suite de l'échange
7. le backend crée le rendez-vous quand le créneau est validé
8. le backend envoie une confirmation WhatsApp
9. le backend envoie ensuite un rappel automatique 24h avant

## 5. État actuel du produit

Dans l'état actuel du projet, le workflow le plus abouti est celui du back-office professionnel.

Déjà opérationnel :

- inscription
- connexion
- tableau de bord
- gestion des services
- gestion des clients
- création de rendez-vous dans le calendrier
- annulation de rendez-vous

Partiellement implémenté côté WhatsApp :

- réception des messages
- création ou récupération du client par numéro
- logique de conversation de base
- messages de confirmation et de rappel

Encore à finaliser côté WhatsApp :

- sélection réelle du service
- récupération réelle des créneaux disponibles dans la conversation
- création complète du rendez-vous depuis WhatsApp

## 6. Résumé opérationnel

Le workflow global de RDVFACILE peut être résumé ainsi :

### Professionnel

Inscription -> Connexion -> Création des services -> Ajout des clients -> Gestion des rendez-vous -> Suivi quotidien

### Client

Message WhatsApp -> Choix du service -> Choix du créneau -> Confirmation -> Rappel

### Système

WhatsApp -> Twilio -> Webhook backend -> Logique métier -> Enregistrement du rendez-vous -> Notification

## 7. Conclusion

RDVFACILE repose sur une logique simple :

- le professionnel administre son activité depuis un back-office web
- le client interagit depuis WhatsApp
- le système relie les deux pour automatiser la prise de rendez-vous

Le back-office est déjà exploitable pour la gestion quotidienne. Le canal WhatsApp est la prochaine étape clé pour compléter l'expérience utilisateur de bout en bout.



digitalocean console :https://cloud.digitalocean.com

neon console : console.neon.tech

vercel console : vercel.com/dashboard