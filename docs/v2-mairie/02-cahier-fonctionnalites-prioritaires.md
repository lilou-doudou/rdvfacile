# Cahier des fonctionnalités prioritaires - RDVFACILE V2 Mairie

## 1. Objet

Ce document décrit les fonctionnalités prioritaires à implémenter dans RDVFACILE V2 pour une utilisation par une mairie.

L'objectif est de définir un périmètre fonctionnel clair, ordonné par priorité, afin de construire un MVP crédible puis une version plus complète.

## 2. Rôles utilisateurs

### Citoyen

Peut :

- consulter les démarches disponibles
- réserver un rendez-vous
- recevoir une confirmation
- consulter, annuler ou reprogrammer son rendez-vous selon les règles définies

### Agent

Peut :

- consulter son planning
- traiter les rendez-vous qui lui sont affectés
- changer le statut d'un rendez-vous
- consulter les informations du citoyen et des pièces attendues

### Superviseur de service

Peut :

- suivre les rendez-vous d'un service
- affecter les agents
- ajuster les disponibilités
- consulter les statistiques du service

### Administrateur

Peut :

- paramétrer les services
- gérer les agents, guichets et horaires
- configurer les règles de réservation
- accéder aux reportings globaux

## 3. Priorisation

### Priorité P1 - indispensable au MVP

#### 3.1 Gestion des services administratifs

Le système doit permettre de créer un service administratif avec :

- nom
- description
- durée standard
- site ou lieu
- documents requis
- conditions particulières
- état actif ou inactif

#### 3.2 Gestion des agents

Le système doit permettre :

- de créer un agent
- de l'affecter à un ou plusieurs services
- de gérer son statut actif ou inactif
- d'associer son agenda aux services concernés

#### 3.3 Gestion des guichets ou bureaux

Le système doit permettre :

- de définir un guichet ou bureau
- de le rattacher à un service
- de gérer sa disponibilité

#### 3.4 Moteur de disponibilité

Le système doit calculer les créneaux disponibles selon :

- les horaires d'ouverture
- le service choisi
- l'agent ou le guichet
- la durée de la démarche
- les conflits existants
- les jours fermés

#### 3.5 Portail citoyen public

Le citoyen doit pouvoir :

- accéder à une page publique
- sélectionner un service
- visualiser les informations de la démarche
- choisir un créneau
- renseigner ses informations
- confirmer la réservation

#### 3.6 Gestion des rendez-vous

Le système doit permettre :

- la création d'un rendez-vous
- la consultation du détail
- l'annulation
- la reprogrammation
- l'affectation à un agent ou un guichet

#### 3.7 Notifications de base

Le système doit envoyer :

- une confirmation de réservation
- un rappel avant la date du rendez-vous
- un message d'annulation ou de modification

#### 3.8 Référence de rendez-vous

Chaque rendez-vous doit disposer :

- d'un identifiant unique
- d'un code de consultation partageable avec le citoyen

### Priorité P2 - fortement recommandée après le MVP

#### 3.9 Gestion documentaire

Le système doit permettre :

- d'afficher les documents exigés
- d'indiquer les documents fournis ou manquants
- éventuellement de téléverser des pièces

#### 3.10 Statuts avancés

Le système doit gérer au minimum les statuts suivants :

- en attente
- confirmé
- annulé
- traité
- absent
- reprogrammé

#### 3.11 Reporting métier

Le système doit fournir :

- nombre de rendez-vous par service
- nombre de rendez-vous par agent
- taux d'absence
- taux d'annulation
- activité par période

#### 3.12 Journal d'audit

Le système doit enregistrer :

- qui a créé un rendez-vous
- qui l'a modifié
- quand il a été annulé
- quels statuts ont changé

### Priorité P3 - évolution

#### 3.13 Multicanal complet

Le système pourra permettre :

- réservation via WhatsApp
- réservation via chatbot
- réservation via centre d'appel

#### 3.14 Multi-sites

Le système pourra gérer :

- plusieurs mairies annexes
- plusieurs bâtiments
- plusieurs points d'accueil

#### 3.15 Tableaux de bord avancés

Le système pourra proposer :

- comparaison entre services
- charge prévisionnelle
- export analytique

## 4. Exigences fonctionnelles clés

### EF1. Réservation

Le citoyen doit pouvoir réserver un rendez-vous sans assistance interne.

### EF2. Lisibilité

Avant la réservation, le citoyen doit pouvoir comprendre :

- l'objet du service
- les pièces nécessaires
- la durée
- le lieu

### EF3. Maîtrise de charge

L'administration doit garder le contrôle sur :

- le nombre de créneaux ouverts
- les ressources affectées
- les jours disponibles

### EF4. Traçabilité

Chaque réservation ou modification doit être historisée.

### EF5. Simplicité d'usage

Le back-office doit rester accessible à des agents non techniques.

## 5. Exigences non fonctionnelles

- interface web responsive
- sécurité des accès
- isolation des données par structure
- journalisation des événements
- performance correcte sur consultation de planning
- possibilité d'exporter les données

## 6. MVP fonctionnel recommandé

Le MVP doit inclure :

- services administratifs
- agents
- guichets
- moteur de créneaux
- portail citoyen web
- confirmation et rappel
- back-office de gestion
- reporting simple

## 7. Hors périmètre MVP conseillé

À reporter après validation du pilote :

- paiement en ligne
- signature électronique
- workflow documentaire complexe
- interconnexion avec registre d'état civil
- intelligence conversationnelle avancée

## 8. Conclusion

Le MVP V2 pour mairie doit se concentrer sur la réservation fiable, la bonne affectation des ressources et la clarté du parcours citoyen. La réussite dépendra moins du volume de fonctionnalités que de la robustesse du moteur de planification et de la simplicité du back-office.
