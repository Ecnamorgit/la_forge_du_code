-- =====================================================================
-- CodeForge / Nebula Command - MCD/MLD VERSION NORMALISEE (ACADEMIQUE)
-- =====================================================================
-- A importer dans Looping via : Fichier -> Retro-conception
-- Looping reconstruit le MLD puis derive le MCD editable.
--
-- Perimetre : domaine metier + authentification simplifiee.
-- Cette version fait emerger les vraies entites conceptuelles :
--   - BADGE (catalogue) <-> UTILISATEUR via association DEBLOQUE
--   - hierarchie COURS -> CHAPITRE -> ETAPE
--   - UTILISATEUR <-> ETAPE via association TERMINE
--   - UTILISATEUR -> COURS via association A_VISITE_EN_DERNIER
--
-- REGLE LOOPING : une table de jonction a CLE PRIMAIRE COMPOSITE des deux
-- cles etrangeres devient une ASSOCIATION (n,n) dans le MCD ; une cle de
-- substitution la ferait apparaitre comme une entite.
-- =====================================================================

-- ---------------------------------------------------------------------
-- UTILISATEUR (coeur metier + avatar)
-- dernier_cours_visite est remplace par l'association A_VISITE_EN_DERNIER
-- (FK nullable id_dernier_cours).
-- ---------------------------------------------------------------------
CREATE TABLE UTILISATEUR (
    id_utilisateur    VARCHAR(30)  NOT NULL,
    email             VARCHAR(255) NOT NULL,
    username          VARCHAR(50)  NOT NULL,
    nom               VARCHAR(100),
    mot_de_passe      VARCHAR(255),                -- hache ; null pour OAuth seul
    email_verifie     TIMESTAMP,
    image             VARCHAR(255),
    date_inscription  TIMESTAMP    NOT NULL,
    total_xp          INTEGER      NOT NULL,
    streak            INTEGER      NOT NULL,
    derniere_visite   VARCHAR(10),                 -- date ISO yyyy-mm-dd
    date_onboarding   TIMESTAMP,
    espece            VARCHAR(20),
    couleur_uniforme  VARCHAR(20),
    role              VARCHAR(20),
    id_dernier_cours  VARCHAR(30),                 -- FK nullable -> COURS
    CONSTRAINT pk_utilisateur PRIMARY KEY (id_utilisateur),
    CONSTRAINT uq_utilisateur_email UNIQUE (email),
    CONSTRAINT uq_utilisateur_username UNIQUE (username)
);

-- ---------------------------------------------------------------------
-- COMPTE (authentification simplifiee)
-- ---------------------------------------------------------------------
CREATE TABLE COMPTE (
    id_compte        VARCHAR(30)  NOT NULL,
    id_utilisateur   VARCHAR(30)  NOT NULL,
    fournisseur      VARCHAR(50)  NOT NULL,
    type_compte      VARCHAR(50)  NOT NULL,
    date_expiration  TIMESTAMP,
    CONSTRAINT pk_compte PRIMARY KEY (id_compte)
);

-- ---------------------------------------------------------------------
-- JETON (OneTimeToken)
-- ---------------------------------------------------------------------
CREATE TABLE JETON (
    id_jeton         VARCHAR(30)  NOT NULL,
    id_utilisateur   VARCHAR(30)  NOT NULL,
    valeur           VARCHAR(255) NOT NULL,
    type             VARCHAR(30)  NOT NULL,
    date_expiration  TIMESTAMP    NOT NULL,
    date_utilisation TIMESTAMP,
    date_creation    TIMESTAMP    NOT NULL,
    CONSTRAINT pk_jeton PRIMARY KEY (id_jeton),
    CONSTRAINT uq_jeton_valeur UNIQUE (valeur)
);

-- ---------------------------------------------------------------------
-- BADGE (catalogue)
-- ---------------------------------------------------------------------
CREATE TABLE BADGE (
    id_badge    VARCHAR(30)  NOT NULL,
    code        VARCHAR(50)  NOT NULL,
    libelle     VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT pk_badge PRIMARY KEY (id_badge),
    CONSTRAINT uq_badge_code UNIQUE (code)
);

-- ---------------------------------------------------------------------
-- COURS -> CHAPITRE -> ETAPE (hierarchie pedagogique)
-- ---------------------------------------------------------------------
CREATE TABLE COURS (
    id_cours    VARCHAR(30)  NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    titre       VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT pk_cours PRIMARY KEY (id_cours),
    CONSTRAINT uq_cours_slug UNIQUE (slug)
);

CREATE TABLE CHAPITRE (
    id_chapitre VARCHAR(30)  NOT NULL,
    id_cours    VARCHAR(30)  NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    titre       VARCHAR(150) NOT NULL,
    ordre       INTEGER      NOT NULL,
    CONSTRAINT pk_chapitre PRIMARY KEY (id_chapitre)
);

CREATE TABLE ETAPE (
    id_etape    VARCHAR(30)  NOT NULL,
    id_chapitre VARCHAR(30)  NOT NULL,
    index_etape INTEGER      NOT NULL,
    titre       VARCHAR(150),
    type        VARCHAR(30),
    CONSTRAINT pk_etape PRIMARY KEY (id_etape)
);

-- ---------------------------------------------------------------------
-- Tables de jonction -> ASSOCIATIONS (cle primaire composite des FK)
-- ---------------------------------------------------------------------

-- DEBLOQUE : UTILISATEUR (0,n) <-> (0,n) BADGE
CREATE TABLE BADGE_UTILISATEUR (
    id_utilisateur VARCHAR(30) NOT NULL,
    id_badge       VARCHAR(30) NOT NULL,
    date_deblocage TIMESTAMP   NOT NULL,
    CONSTRAINT pk_badge_utilisateur PRIMARY KEY (id_utilisateur, id_badge)
);

-- TERMINE : UTILISATEUR (0,n) <-> (0,n) ETAPE
CREATE TABLE ETAPE_TERMINEE (
    id_utilisateur  VARCHAR(30) NOT NULL,
    id_etape        VARCHAR(30) NOT NULL,
    date_completion TIMESTAMP   NOT NULL,
    CONSTRAINT pk_etape_terminee PRIMARY KEY (id_utilisateur, id_etape)
);

-- ---------------------------------------------------------------------
-- Cles etrangeres
-- ---------------------------------------------------------------------
ALTER TABLE UTILISATEUR
    ADD CONSTRAINT fk_utilisateur_dernier_cours
    FOREIGN KEY (id_dernier_cours) REFERENCES COURS (id_cours);

ALTER TABLE COMPTE
    ADD CONSTRAINT fk_compte_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE JETON
    ADD CONSTRAINT fk_jeton_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE CHAPITRE
    ADD CONSTRAINT fk_chapitre_cours
    FOREIGN KEY (id_cours) REFERENCES COURS (id_cours);

ALTER TABLE ETAPE
    ADD CONSTRAINT fk_etape_chapitre
    FOREIGN KEY (id_chapitre) REFERENCES CHAPITRE (id_chapitre);

ALTER TABLE BADGE_UTILISATEUR
    ADD CONSTRAINT fk_badge_utilisateur_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE BADGE_UTILISATEUR
    ADD CONSTRAINT fk_badge_utilisateur_badge
    FOREIGN KEY (id_badge) REFERENCES BADGE (id_badge);

ALTER TABLE ETAPE_TERMINEE
    ADD CONSTRAINT fk_etape_terminee_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE ETAPE_TERMINEE
    ADD CONSTRAINT fk_etape_terminee_etape
    FOREIGN KEY (id_etape) REFERENCES ETAPE (id_etape);
