# Nouvelle architecture de données adaptée aux mairies

## 1. Objectif

Cette architecture de données a pour but de faire évoluer RDVFACILE vers un modèle adapté aux services publics, en particulier aux mairies.

Le modèle doit permettre :

- la gestion multi-services
- la gestion multi-agents et multi-guichets
- la gestion des démarches administratives
- la planification avancée
- la traçabilité

## 2. Principes de modélisation

- séparer la structure administrative de ses services
- distinguer les ressources humaines des ressources physiques
- rattacher chaque rendez-vous à une démarche, un citoyen et une ressource
- prévoir la traçabilité des changements
- conserver une architecture multi-tenant si le produit est amené à servir plusieurs entités

## 3. Entités principales

### 3.1 Organization

Représente l'entité administrative.

Exemples :

- Mairie de Cocody
- Mairie de Yopougon

Champs recommandés :

- `id`
- `name`
- `type`
- `phone`
- `email`
- `address`
- `timezone`
- `status`
- `created_at`
- `updated_at`

### 3.2 Site

Représente un lieu physique rattaché à l'organisation.

Exemples :

- siège principal
- mairie annexe
- centre administratif

Champs :

- `id`
- `organization_id`
- `name`
- `address`
- `phone`
- `is_active`

### 3.3 Department

Représente un grand domaine administratif.

Exemples :

- état civil
- affaires sociales
- urbanisme

Champs :

- `id`
- `organization_id`
- `site_id`
- `name`
- `description`
- `is_active`

### 3.4 ServiceCatalog

Représente une démarche réservable.

Exemples :

- acte de naissance
- légalisation
- certificat de résidence

Champs :

- `id`
- `department_id`
- `name`
- `slug`
- `description`
- `duration_minutes`
- `preparation_instructions`
- `is_active`
- `booking_channel_web`
- `booking_channel_whatsapp`
- `booking_channel_agent`

### 3.5 RequiredDocument

Liste des pièces demandées pour une démarche.

Champs :

- `id`
- `service_catalog_id`
- `name`
- `description`
- `is_mandatory`
- `display_order`

### 3.6 Citizen

Représente l'usager.

Champs :

- `id`
- `organization_id`
- `first_name`
- `last_name`
- `full_name`
- `phone`
- `email`
- `national_id_number`
- `date_of_birth`
- `address`
- `notes`
- `created_at`

### 3.7 User

Représente un utilisateur interne authentifié.

Champs :

- `id`
- `organization_id`
- `site_id`
- `full_name`
- `email`
- `password_hash`
- `role`
- `is_active`
- `last_login_at`

### 3.8 AgentProfile

Spécialisation métier du compte utilisateur interne.

Champs :

- `id`
- `user_id`
- `employee_code`
- `job_title`
- `is_bookable`

### 3.9 Counter

Représente un guichet, bureau ou point de traitement.

Champs :

- `id`
- `site_id`
- `department_id`
- `name`
- `code`
- `capacity`
- `is_active`

### 3.10 AgentServiceAssignment

Table de liaison entre agent et service.

Champs :

- `id`
- `agent_profile_id`
- `service_catalog_id`
- `site_id`
- `counter_id`
- `is_primary`
- `is_active`

## 4. Entités de planification

### 4.1 BusinessCalendar

Calendrier général d'un site ou d'un service.

Champs :

- `id`
- `organization_id`
- `site_id`
- `department_id`
- `service_catalog_id`
- `name`
- `timezone`
- `is_active`

### 4.2 OpeningRule

Règles horaires récurrentes.

Champs :

- `id`
- `business_calendar_id`
- `day_of_week`
- `start_time`
- `end_time`
- `slot_interval_minutes`

### 4.3 CalendarException

Exceptions au planning.

Exemples :

- jour férié
- fermeture exceptionnelle
- ouverture exceptionnelle

Champs :

- `id`
- `business_calendar_id`
- `date`
- `type`
- `start_time`
- `end_time`
- `reason`

### 4.4 AgentAvailability

Disponibilités spécifiques d'un agent.

Champs :

- `id`
- `agent_profile_id`
- `date`
- `start_time`
- `end_time`
- `status`

### 4.5 SlotQuota

Permet de limiter le nombre de rendez-vous sur un créneau.

Champs :

- `id`
- `service_catalog_id`
- `site_id`
- `counter_id`
- `date`
- `start_time`
- `end_time`
- `max_appointments`

## 5. Entités de rendez-vous

### 5.1 Appointment

Entité centrale du système.

Champs :

- `id`
- `organization_id`
- `site_id`
- `department_id`
- `service_catalog_id`
- `citizen_id`
- `agent_profile_id`
- `counter_id`
- `reference_code`
- `channel`
- `status`
- `start_at`
- `end_at`
- `notes`
- `created_by_user_id`
- `created_at`
- `updated_at`

### 5.2 AppointmentDocumentStatus

Permet de suivre l'état des pièces demandées pour un rendez-vous.

Champs :

- `id`
- `appointment_id`
- `required_document_id`
- `status`
- `comment`

### 5.3 AppointmentStatusHistory

Historise les changements de statut.

Champs :

- `id`
- `appointment_id`
- `old_status`
- `new_status`
- `changed_by_user_id`
- `changed_at`
- `reason`

### 5.4 AppointmentAuditLog

Trace les actions importantes.

Champs :

- `id`
- `appointment_id`
- `event_type`
- `actor_type`
- `actor_id`
- `payload_json`
- `created_at`

## 6. Entités de notification

### 6.1 NotificationTemplate

Modèle de message.

Champs :

- `id`
- `organization_id`
- `channel`
- `event_type`
- `language`
- `subject`
- `body`
- `is_active`

### 6.2 NotificationDispatch

Historique des envois.

Champs :

- `id`
- `appointment_id`
- `citizen_id`
- `channel`
- `event_type`
- `recipient`
- `status`
- `sent_at`
- `provider_response`

## 7. Entités de sécurité et d'administration

### 7.1 RolePermission

Table de permissions par rôle.

Champs :

- `id`
- `role`
- `permission_code`

### 7.2 ApiClient

Pour les intégrations futures.

Champs :

- `id`
- `organization_id`
- `name`
- `client_key`
- `client_secret_hash`
- `is_active`

## 8. Relations majeures

Les relations structurantes sont les suivantes :

- une `Organization` possède plusieurs `Site`
- un `Site` possède plusieurs `Department`
- un `Department` possède plusieurs `ServiceCatalog`
- un `ServiceCatalog` possède plusieurs `RequiredDocument`
- un `User` peut être lié à un `AgentProfile`
- un `AgentProfile` peut être affecté à plusieurs services via `AgentServiceAssignment`
- un `Appointment` relie un citoyen, un service, un site, éventuellement un agent et un guichet
- un `Appointment` possède un historique de statuts et des journaux d'audit

## 9. Statuts recommandés

### Appointment.status

Valeurs recommandées :

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `RESCHEDULED`
- `IN_PROGRESS`
- `COMPLETED`
- `NO_SHOW`

### Appointment.channel

Valeurs recommandées :

- `BACK_OFFICE`
- `PUBLIC_WEB`
- `WHATSAPP`
- `PHONE_AGENT`

## 10. Schéma relationnel simplifié

```text
Organization
  -> Site
    -> Department
      -> ServiceCatalog
        -> RequiredDocument

Organization
  -> User
    -> AgentProfile
      -> AgentServiceAssignment

Site
  -> Counter

ServiceCatalog
  -> BusinessCalendar
    -> OpeningRule
    -> CalendarException

Citizen
  -> Appointment
       -> AppointmentDocumentStatus
       -> AppointmentStatusHistory
       -> AppointmentAuditLog
       -> NotificationDispatch
```

## 11. Choix d'architecture recommandés

### Choix 1. Multi-tenant conservé

Même pour une première mairie, il est préférable de garder une séparation forte par `organization_id`. Cela évite de reconstruire plus tard si le produit est mutualisé.

### Choix 2. Référentiel de services séparé

Le service réservable doit être traité comme un catalogue structuré, pas comme une simple ligne de prestation.

### Choix 3. Historisation native

Les besoins administratifs imposent une traçabilité forte. Il faut donc prévoir l'historique au niveau du modèle, et pas comme un ajout tardif.

### Choix 4. Ressources explicites

Il faut modéliser explicitement les agents et les guichets. Un simple agenda global devient vite insuffisant dans un contexte mairie.

## 12. Migration conceptuelle depuis la V1

Correspondances probables :

- `Business` devient `Organization`
- `ServiceEntity` évolue vers `ServiceCatalog`
- `Customer` évolue vers `Citizen`
- `User` est conservé mais enrichi
- `Appointment` est conservé mais devient beaucoup plus riche

## 13. Conclusion

La V2 mairie nécessite une architecture de données plus normalisée, plus traçable et plus orientée ressources. Ce modèle fournit un socle suffisamment solide pour supporter un pilote mairie crédible et pour ouvrir ensuite le produit à d'autres administrations ou structures multisites.
