import { describe, it, expect } from "vitest";

import {
  UnsafeE2eDatabaseError,
  VARIABLE_ECHAPPEMENT,
  assertTestDatabaseUrl,
} from "./e2e-db-guard";

const SANS_ECHAPPEMENT: Record<string, string | undefined> = {};
const AVEC_ECHAPPEMENT: Record<string, string | undefined> = {
  [VARIABLE_ECHAPPEMENT]: "1",
};

function refuse(url: string | undefined, env = SANS_ECHAPPEMENT) {
  expect(() => assertTestDatabaseUrl(url, env)).toThrow(UnsafeE2eDatabaseError);
}

describe("assertTestDatabaseUrl — ce qui passe", () => {
  it("accepte une base locale", () => {
    expect(() =>
      assertTestDatabaseUrl(
        "postgresql://postgres:test@localhost:5432/codeforge_test",
        SANS_ECHAPPEMENT
      )
    ).not.toThrow();
  });

  it("accepte l'URL du service Postgres de la CI", () => {
    // .github/workflows/ci.yml, job e2e. La garde ne doit pas casser la CI.
    expect(() =>
      assertTestDatabaseUrl("postgresql://ci:ci@localhost:5432/ci", SANS_ECHAPPEMENT)
    ).not.toThrow();
  });

  it("accepte 127.0.0.1 et ::1", () => {
    expect(() =>
      assertTestDatabaseUrl("postgres://u:p@127.0.0.1:5432/app", SANS_ECHAPPEMENT)
    ).not.toThrow();
    expect(() =>
      assertTestDatabaseUrl("postgres://u:p@[::1]:5432/app", SANS_ECHAPPEMENT)
    ).not.toThrow();
  });

  it("accepte une base distante explicitement nommée test, avec l'échappatoire", () => {
    expect(() =>
      assertTestDatabaseUrl(
        "postgresql://u:p@db.interne.exemple:5432/codeforge_e2e",
        AVEC_ECHAPPEMENT
      )
    ).not.toThrow();
  });
});

describe("assertTestDatabaseUrl — ce qui est refusé", () => {
  it("refuse une URL absente ou vide", () => {
    refuse(undefined);
    refuse("");
  });

  it("refuse une URL illisible", () => {
    refuse("pas-une-url");
  });

  it("refuse un protocole inattendu", () => {
    refuse("mysql://u:p@localhost:3306/app");
  });

  it("refuse une URL qui ne nomme aucune base", () => {
    refuse("postgresql://u:p@localhost:5432");
  });

  it("refuse la base Supabase de production — le cas qui motive cette garde", () => {
    refuse("postgresql://postgres:motdepasse@db.abcdefgh.supabase.co:5432/postgres");
    refuse(
      "postgresql://postgres.abcdefgh:motdepasse@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
    );
  });

  it("refuse un hébergeur géré MÊME avec l'échappatoire et un nom en « test »", () => {
    refuse(
      "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/codeforge_test",
      AVEC_ECHAPPEMENT
    );
    refuse("postgresql://u:p@ep-x-y.eu-central-1.aws.neon.tech:5432/e2e", AVEC_ECHAPPEMENT);
  });

  it("refuse un hôte distant sans échappatoire, même nommé test", () => {
    refuse("postgresql://u:p@db.interne.exemple:5432/codeforge_test");
  });

  it("refuse un hôte distant avec l'échappatoire mais sans marqueur de test", () => {
    refuse("postgresql://u:p@db.interne.exemple:5432/codeforge", AVEC_ECHAPPEMENT);
  });

  it("explique comment corriger", () => {
    try {
      assertTestDatabaseUrl(
        "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
        SANS_ECHAPPEMENT
      );
      expect.unreachable("la garde aurait dû lever");
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain("DATABASE_URL");
      expect(message).toContain("migrate deploy");
      expect(message).toContain(VARIABLE_ECHAPPEMENT);
    }
  });
});
