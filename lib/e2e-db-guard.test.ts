import { describe, it, expect } from "vitest";

import {
  UnsafeE2eDatabaseError,
  UnsafeE2eTargetError,
  DB_OVERRIDE_VARIABLE,
  APP_OVERRIDE_VARIABLE,
  assertLocalAppUnderTest,
  assertTestDatabaseUrl,
} from "./e2e-db-guard";

const WITHOUT_OVERRIDE: Record<string, string | undefined> = {};
const WITH_OVERRIDE: Record<string, string | undefined> = {
  [DB_OVERRIDE_VARIABLE]: "1",
};

function refuse(url: string | undefined, env = WITHOUT_OVERRIDE) {
  expect(() => assertTestDatabaseUrl(url, env)).toThrow(UnsafeE2eDatabaseError);
}

describe("assertTestDatabaseUrl — what is accepted", () => {
  it("accepts a local database", () => {
    expect(() =>
      assertTestDatabaseUrl(
        "postgresql://postgres:test@localhost:5432/codeforge_test",
        WITHOUT_OVERRIDE
      )
    ).not.toThrow();
  });

  it("accepts the URL of the CI Postgres service", () => {
    // .github/workflows/ci.yml, e2e job. The guard must not break CI.
    expect(() =>
      assertTestDatabaseUrl("postgresql://ci:ci@localhost:5432/ci", WITHOUT_OVERRIDE)
    ).not.toThrow();
  });

  it("accepts 127.0.0.1 and ::1", () => {
    expect(() =>
      assertTestDatabaseUrl("postgres://u:p@127.0.0.1:5432/app", WITHOUT_OVERRIDE)
    ).not.toThrow();
    expect(() =>
      assertTestDatabaseUrl("postgres://u:p@[::1]:5432/app", WITHOUT_OVERRIDE)
    ).not.toThrow();
  });

  it("accepts a remote database explicitly named test, with the override", () => {
    expect(() =>
      assertTestDatabaseUrl(
        "postgresql://u:p@db.interne.exemple:5432/codeforge_e2e",
        WITH_OVERRIDE
      )
    ).not.toThrow();
  });
});

describe("assertTestDatabaseUrl — what is rejected", () => {
  it("rejects a missing or empty URL", () => {
    refuse(undefined);
    refuse("");
  });

  it("rejects an unparseable URL", () => {
    refuse("pas-une-url");
  });

  it("rejects an unexpected protocol", () => {
    refuse("mysql://u:p@localhost:3306/app");
  });

  it("rejects a URL that names no database", () => {
    refuse("postgresql://u:p@localhost:5432");
  });

  it("rejects the production Supabase database — the case behind this guard", () => {
    refuse("postgresql://postgres:motdepasse@db.abcdefgh.supabase.co:5432/postgres");
    refuse(
      "postgresql://postgres.abcdefgh:motdepasse@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
    );
  });

  it("rejects a managed host EVEN with the override and a 'test' name", () => {
    refuse(
      "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/codeforge_test",
      WITH_OVERRIDE
    );
    refuse("postgresql://u:p@ep-x-y.eu-central-1.aws.neon.tech:5432/e2e", WITH_OVERRIDE);
  });

  it("rejects a remote host without the override, even if named test", () => {
    refuse("postgresql://u:p@db.interne.exemple:5432/codeforge_test");
  });

  it("rejects a remote host with the override but no test marker", () => {
    refuse("postgresql://u:p@db.interne.exemple:5432/codeforge", WITH_OVERRIDE);
  });

  it("explains how to fix it", () => {
    try {
      assertTestDatabaseUrl(
        "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
        WITHOUT_OVERRIDE
      );
      expect.unreachable("the guard should have thrown");
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain("DATABASE_URL");
      expect(message).toContain("migrate deploy");
      expect(message).toContain(DB_OVERRIDE_VARIABLE);
    }
  });
});

describe("assertTestDatabaseUrl — the 'host' parameter that overrides the host", () => {
  // pg-connection-string lets this parameter override the host: a URL
  // that looks local can target production.
  it("rejects a local URL whose query redirects to a managed host", () => {
    refuse(
      "postgresql://u:p@localhost:5432/codeforge_test?host=db.abcdefgh.supabase.co"
    );
  });

  it("rejects the parameter even when it points somewhere other than a known host", () => {
    refuse("postgresql://u:p@localhost:5432/codeforge_test?host=interne.exemple");
  });

  it("rejects hostaddr, the address-based variant", () => {
    refuse("postgresql://u:p@localhost:5432/codeforge_test?hostaddr=203.0.113.7");
  });

  it("rejects even with the override: the target is undecidable, not just remote", () => {
    refuse(
      "postgresql://u:p@localhost:5432/codeforge_test?host=db.abcdefgh.supabase.co",
      WITH_OVERRIDE
    );
  });

  it("lets other connection parameters through", () => {
    expect(() =>
      assertTestDatabaseUrl(
        "postgresql://postgres:test@localhost:5432/codeforge_test?sslmode=disable&connect_timeout=5",
        WITHOUT_OVERRIDE
      )
    ).not.toThrow();
  });
});

describe("assertLocalAppUnderTest", () => {
  const WITHOUT: Record<string, string | undefined> = {};
  const WITH: Record<string, string | undefined> = {
    [APP_OVERRIDE_VARIABLE]: "1",
  };

  it("accepts a missing URL: Playwright then starts its own application", () => {
    expect(() => assertLocalAppUnderTest(undefined, WITHOUT)).not.toThrow();
    expect(() => assertLocalAppUnderTest("", WITHOUT)).not.toThrow();
    expect(() => assertLocalAppUnderTest("   ", WITHOUT)).not.toThrow();
  });

  it("accepts a local application", () => {
    expect(() => assertLocalAppUnderTest("http://localhost:3000", WITHOUT)).not.toThrow();
    expect(() => assertLocalAppUnderTest("http://127.0.0.1:3000", WITHOUT)).not.toThrow();
    expect(() => assertLocalAppUnderTest("https://localhost:8443", WITHOUT)).not.toThrow();
  });

  it("accepts a localhost subdomain, which resolves to loopback", () => {
    expect(() => assertLocalAppUnderTest("http://app.localhost:3000", WITHOUT)).not.toThrow();
  });

  it("rejects a remote application: its database is not the one we seeded", () => {
    expect(() => assertLocalAppUnderTest("https://laforgeducode.fr", WITHOUT)).toThrow(
      UnsafeE2eTargetError
    );
  });

  it("rejects an unparseable URL rather than guessing", () => {
    expect(() => assertLocalAppUnderTest("pas une url", WITHOUT)).toThrow(UnsafeE2eTargetError);
  });

  it("yields to an explicit override", () => {
    expect(() => assertLocalAppUnderTest("https://staging.exemple", WITH)).not.toThrow();
  });

  it("explains why, and how to fix it", () => {
    try {
      assertLocalAppUnderTest("https://laforgeducode.fr", WITHOUT);
      expect.unreachable("the guard should have thrown");
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain("E2E_BASE_URL");
      expect(message).toContain(APP_OVERRIDE_VARIABLE);
    }
  });
});
