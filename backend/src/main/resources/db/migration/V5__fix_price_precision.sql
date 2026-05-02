-- Migration V5: Augmenter la précision du champ price dans services
-- DECIMAL(10,2) max = 99,999,999.99 → insuffisant pour les prix en FCFA
-- DECIMAL(15,2) max = 9,999,999,999,999.99 → suffisant
ALTER TABLE services ALTER COLUMN price TYPE DECIMAL(15, 2);
