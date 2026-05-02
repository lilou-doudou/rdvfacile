-- Invalide tous les tokens de reset et de vérification stockés en plaintext.
-- Après ce déploiement, les tokens sont stockés en SHA-256.
-- Les utilisateurs devront refaire une demande de reset ou de vérification.
UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE reset_token IS NOT NULL;
UPDATE users SET verification_token = NULL WHERE verification_token IS NOT NULL AND email_verified = false;
