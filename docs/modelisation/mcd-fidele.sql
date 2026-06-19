-- =====================================================================
-- CodeForge / Nebula Command - MCD/MLD VERSION FIDELE A LA BASE
-- =====================================================================
-- A importer dans Looping via : Fichier -> Retro-conception
-- Looping reconstruit le MLD puis derive le MCD editable.
--
-- Perimetre : domaine metier + authentification simplifiee.
-- Cette version reflete le schema Prisma tel quel (denormalise) :
--   - le badge est un simple identifiant texte (badge_id)
--   - une etape terminee stocke cours / chapitre / index_etape a plat
--
-- Source de verite : prisma/schema.prisma
-- =====================================================================

-- ---------------------------------------------------------------------
-- UTILISATEUR (coeur metier + avatar)
-- ---------------------------------------------------------------------
CREATE TABLE UTILISATEUR (
    id_utilisateur        VARCHAR(30)  NOT NULL,
    email                 VARCHAR(255) NOT NULL,
    username              VARCHAR(50)  NOT NULL,
    nom                   VARCHAR(100),
    mot_de_passe          VARCHAR(255),            -- hache ; null pour OAuth seul
    email_verifie         TIMESTAMP,
    image                 VARCHAR(255),
    date_inscription      TIMESTAMP    NOT NULL,
    total_xp              INTEGER      NOT NULL,
    streak                INTEGER      NOT NULL,
    derniere_visite       VARCHAR(10),             -- date ISO yyyy-mm-dd
    dernier_cours_visite  VARCHAR(100),            -- slug du dernier cours
    date_onboarding       TIMESTAMP,
    espece                VARCHAR(20),             -- avatar (cosmetique)
    couleur_uniforme      VARCHAR(20),
    role                  VARCHAR(20),
    CONSTRAINT pk_utilisateur PRIMARY KEY (id_utilisateur),
    CONSTRAINT uq_utilisateur_email UNIQUE (email),
    CONSTRAINT uq_utilisateur_username UNIQUE (username)
);

-- ---------------------------------------------------------------------
-- COMPTE (authentification simplifiee : regroupe Account/Session)
-- ---------------------------------------------------------------------
CREATE TABLE COMPTE (
    id_compte        VARCHAR(30)  NOT NULL,
    id_utilisateur   VARCHAR(30)  NOT NULL,
    fournisseur      VARCHAR(50)  NOT NULL,        -- github, google, credentials...
    type_compte      VARCHAR(50)  NOT NULL,        -- oauth, email, credentials
    date_expiration  TIMESTAMP,
    CONSTRAINT pk_compte PRIMARY KEY (id_compte)
);

-- ---------------------------------------------------------------------
-- JETON (OneTimeToken : verification email + reset mot de passe)
-- ---------------------------------------------------------------------
CREATE TABLE JETON (
    id_jeton         VARCHAR(30)  NOT NULL,
    id_utilisateur   VARCHAR(30)  NOT NULL,
    valeur           VARCHAR(255) NOT NULL,        -- hachee
    type             VARCHAR(30)  NOT NULL,        -- email_verify | password_reset
    date_expiration  TIMESTAMP    NOT NULL,
    date_utilisation TIMESTAMP,
    date_creation    TIMESTAMP    NOT NULL,
    CONSTRAINT pk_jeton PRIMARY KEY (id_jeton),
    CONSTRAINT uq_jeton_valeur UNIQUE (valeur)
);

-- ---------------------------------------------------------------------
-- BADGE_UTILISATEUR (fidele : id de substitution + badge_id en texte)
-- ---------------------------------------------------------------------
CREATE TABLE BADGE_UTILISATEUR (
    id_badge_utilisateur VARCHAR(30) NOT NULL,
    id_utilisateur       VARCHAR(30) NOT NULL,
    badge_id             VARCHAR(50) NOT NULL,     -- identifiant texte du badge
    date_deblocage       TIMESTAMP   NOT NULL,
    CONSTRAINT pk_badge_utilisateur PRIMARY KEY (id_badge_utilisateur),
    CONSTRAINT uq_badge_utilisateur UNIQUE (id_utilisateur, badge_id)
);

-- ---------------------------------------------------------------------
-- ETAPE_TERMINEE (fidele : cours/chapitre/index a plat)
-- ---------------------------------------------------------------------
CREATE TABLE ETAPE_TERMINEE (
    id_etape_terminee VARCHAR(30) NOT NULL,
    id_utilisateur    VARCHAR(30) NOT NULL,
    cours             VARCHAR(100) NOT NULL,
    chapitre          VARCHAR(100) NOT NULL,
    index_etape       INTEGER      NOT NULL,
    date_completion   TIMESTAMP    NOT NULL,
    CONSTRAINT pk_etape_terminee PRIMARY KEY (id_etape_terminee),
    CONSTRAINT uq_etape_terminee UNIQUE (id_utilisateur, cours, chapitre, index_etape)
);

-- ---------------------------------------------------------------------
-- Cles etrangeres (associations 1,n - 1,1 vers UTILISATEUR)
-- ---------------------------------------------------------------------
ALTER TABLE COMPTE
    ADD CONSTRAINT fk_compte_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE JETON
    ADD CONSTRAINT fk_jeton_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE BADGE_UTILISATEUR
    ADD CONSTRAINT fk_badge_utilisateur_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);

ALTER TABLE ETAPE_TERMINEE
    ADD CONSTRAINT fk_etape_terminee_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES UTILISATEUR (id_utilisateur);
