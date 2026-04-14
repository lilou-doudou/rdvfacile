# Plan d'évolution RDVFACILE vers une version mairie

## 1. Contexte

RDVFACILE a été conçu initialement pour la gestion de rendez-vous dans un contexte de commerce ou de prestation de services simple. Une mairie introduit un niveau d'exigence supérieur :

- plusieurs services administratifs
- plusieurs agents et guichets
- règles d'éligibilité selon les démarches
- documents obligatoires
- contraintes horaires variables
- besoin de traçabilité et de reporting

La V2 doit donc faire évoluer le produit d'un agenda simple vers une plateforme de gestion de rendez-vous administratifs.

## 2. Vision cible

La V2 doit permettre à une mairie de :

- publier ses démarches disponibles
- organiser les rendez-vous par service, guichet et agent
- contrôler les créneaux disponibles selon des règles précises
- informer les citoyens avant leur venue
- suivre le traitement des rendez-vous
- produire des statistiques d'activité

## 3. Objectifs de la V2

### Objectifs métier

- réduire les files d'attente physiques
- améliorer l'organisation des services municipaux
- fluidifier l'accueil des usagers
- réduire les rendez-vous manqués
- rendre l'information plus claire pour les citoyens

### Objectifs produit

- supporter des services administratifs complexes
- introduire une gestion multi-agents et multi-guichets
- fournir un portail citoyen public
- conserver un back-office simple à utiliser
- ouvrir la voie à une offre réutilisable pour d'autres administrations

## 4. Écarts entre la V1 et la V2

### V1

- agenda unique par structure
- services simples
- clients simples
- prise de rendez-vous surtout via back-office
- WhatsApp partiellement implémenté

### V2

- organisation multi-services
- gestion des agents et guichets
- rendez-vous liés à une démarche administrative
- documents requis
- quotas et capacités par créneau
- portail citoyen public
- multicanal : web public, back-office, WhatsApp
- reporting administratif

## 5. Axes d'évolution

### Axe 1. Refonte du modèle métier

Le produit doit passer d'un modèle "service commercial" à un modèle "démarche administrative".

Cela implique d'ajouter :

- services administratifs
- catégories de démarches
- pièces justificatives
- conditions d'accès
- délais de traitement

### Axe 2. Gestion des ressources

Une mairie fonctionne avec des ressources humaines et physiques.

Il faut ajouter :

- agents
- guichets
- bureaux
- affectation des agents aux services
- capacité par créneau

### Axe 3. Gestion avancée du planning

Le moteur de planification doit gérer :

- plages horaires par service
- pauses
- jours fermés
- jours fériés
- exceptions
- quotas journaliers
- quotas par agent
- capacité de traitement simultanée

### Axe 4. Portail citoyen

La V2 doit proposer une interface publique permettant à l'usager de :

- choisir une démarche
- consulter les conditions
- réserver un créneau
- recevoir une confirmation
- retrouver ou annuler son rendez-vous

### Axe 5. Notifications

Le moteur de notification doit couvrir :

- confirmation de rendez-vous
- rappel
- annulation
- report
- liste des documents à apporter

Les canaux cibles sont :

- SMS
- WhatsApp
- email

### Axe 6. Suivi et reporting

La mairie aura besoin d'indicateurs tels que :

- nombre de rendez-vous par service
- nombre de rendez-vous honorés
- nombre d'absences
- temps moyen par démarche
- charge par agent
- fréquentation par période

## 6. Approche de déploiement recommandée

Il est déconseillé de lancer immédiatement une couverture complète de tous les services d'une mairie.

Approche recommandée :

1. Pilote sur 2 ou 3 services
2. Validation des processus
3. Ajustements métiers
4. Extension progressive à d'autres services

## 7. Proposition de roadmap

### Phase 0. Cadrage

- recueil des besoins de la mairie
- sélection des premiers services pilotes
- validation des rôles utilisateurs
- validation des canaux de communication

### Phase 1. Socle V2

- refonte du modèle de données
- gestion des services administratifs
- gestion des agents
- gestion des guichets
- gestion des calendriers de disponibilité

### Phase 2. Portail citoyen

- catalogue public des démarches
- réservation de rendez-vous
- page de confirmation
- consultation d'un rendez-vous par référence

### Phase 3. Notifications et rappels

- emails transactionnels
- SMS / WhatsApp
- rappels automatiques
- notifications de modification

### Phase 4. Pilotage administratif

- tableaux de bord
- reporting par service
- reporting par agent
- export CSV / Excel

### Phase 5. Montée en charge

- multi-sites
- multi-mairies
- supervision
- archivage
- sécurité renforcée

## 8. MVP mairie recommandé

Le MVP mairie doit rester volontairement limité.

Périmètre conseillé :

- 3 services maximum
- 1 site principal
- 1 portail citoyen web
- back-office agents
- rappels email ou WhatsApp
- reporting simple

Exemples de services pilotes :

- légalisation de documents
- demande d'acte de naissance
- prise de rendez-vous état civil

## 9. Risques majeurs

- complexité métier sous-estimée
- multiplication trop rapide des cas particuliers
- surcharge fonctionnelle dès le MVP
- dépendance forte aux habitudes internes de la mairie
- besoin de formation et d'accompagnement du personnel

## 10. Recommandations

- commencer par un pilote concret
- documenter chaque démarche comme un processus métier distinct
- séparer clairement les rôles citoyen, agent, superviseur, administrateur
- prévoir très tôt la traçabilité et le reporting
- ne pas dépendre uniquement de WhatsApp pour le canal citoyen

## 11. Conclusion

La V2 mairie de RDVFACILE est pertinente et réaliste si elle est pensée comme une plateforme administrative structurée, et non comme une simple extension du produit actuel. La priorité est de construire un socle robuste pour les services, les agents, les créneaux et le portail citoyen, puis d'étendre progressivement la couverture fonctionnelle.
