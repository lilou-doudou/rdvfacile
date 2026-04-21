-- Migration V3: Ajout des champs de vérification d'email
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Les comptes existants sont considérés comme vérifiés
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;
