-- ============================================================
--  BASE DE DONNÉES : semi_marathon
-- ============================================================

CREATE DATABASE IF NOT EXISTS semi_marathon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE semi_marathon;

-- ============================================================
--  TABLE EDITIONS
--  Chaque année de la course = une édition
-- ============================================================
CREATE TABLE IF NOT EXISTS editions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL,
  date_event DATE         NOT NULL,
  active     TINYINT(1)   DEFAULT 0,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  TABLE EPREUVES
--  Les différentes épreuves de la course
-- ============================================================
CREATE TABLE IF NOT EXISTS epreuves (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  edition_id INT          NOT NULL,
  nom        VARCHAR(100) NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL,
  heure_depart TIME       NOT NULL,
  type       ENUM('semi','relais','marche') NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edition_id) REFERENCES editions(id) ON DELETE CASCADE
);

-- ============================================================
--  TABLE COUREURS
-- ============================================================
CREATE TABLE IF NOT EXISTS coureurs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  dossard      INT          DEFAULT NULL UNIQUE,
  prenom       VARCHAR(50)  NOT NULL,
  nom          VARCHAR(50)  NOT NULL,
  date_naissance DATE       DEFAULT NULL,
  club         VARCHAR(100) DEFAULT NULL,
  email        VARCHAR(150) DEFAULT NULL,
  pin_code     VARCHAR(6)   DEFAULT NULL,
  epreuve_id   INT          DEFAULT NULL,
  statut       ENUM('inscrit','non_inscrit') DEFAULT 'non_inscrit',
  -- Position GPS
  lat          DOUBLE       DEFAULT NULL,
  lng          DOUBLE       DEFAULT NULL,
  distance_km  DOUBLE       DEFAULT 0,
  temps_s      INT          DEFAULT 0,
  live         TINYINT(1)   DEFAULT 0,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (epreuve_id) REFERENCES epreuves(id) ON DELETE SET NULL
);

-- ============================================================
--  TABLE POSITIONS (historique GPS)
-- ============================================================
CREATE TABLE IF NOT EXISTS positions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  coureur_id    INT    NOT NULL,
  lat           DOUBLE NOT NULL,
  lng           DOUBLE NOT NULL,
  enregistre_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coureur_id) REFERENCES coureurs(id) ON DELETE CASCADE
);

-- ============================================================
--  DONNÉES DE TEST
-- ============================================================

-- Édition active
INSERT INTO editions (nom, date_event, active) VALUES
('53e édition', '2026-07-19', 1);

-- Épreuves
INSERT INTO epreuves (edition_id, nom, distance_km, heure_depart, type) VALUES
(1, 'Semi-Marathon',    21.10, '09:00:00', 'semi'),
(1, 'Relais 2x10km',   20.00, '09:05:00', 'relais'),
(1, 'Marche Nordique',  12.00, '09:30:00', 'marche');

-- 5 coureurs de test (PIN = 123456 pour tous en test)
INSERT INTO coureurs (dossard, prenom, nom, date_naissance, club, email, pin_code, epreuve_id, statut, lat, lng, distance_km, temps_s, live) VALUES
(101, 'Sophie',  'Blanc',   '1990-03-15', 'AS Mende',      'sophie.blanc@email.com',   '112233', 1, 'inscrit',     44.5230, 3.4980,  8.2,  2580, 1),
(247, 'Marc',    'Dupont',  '1985-07-22', 'CA Marvejols',  'marc.dupont@email.com',    '224455', 1, 'inscrit',     44.5310, 3.5120, 12.1,  3420, 1),
(315, 'Julie',   'Renard',  '1992-11-08', 'RC Lozère',     'julie.renard@email.com',   '336677', 2, 'inscrit',     44.5190, 3.4870,  5.4,  1920, 1),
(88,  'Thomas',  'Morel',   '1988-05-30', NULL,            'thomas.morel@email.com',   '448899', 3, 'inscrit',     44.5400, 3.5250, 18.7,  4800, 0),
(427, 'Camille', 'Bernard', '1995-09-12', 'Trail Aubrac',  'camille.bernard@email.com','559900', 1, 'inscrit',     44.5280, 3.5010, 15.3,  4200, 1);
