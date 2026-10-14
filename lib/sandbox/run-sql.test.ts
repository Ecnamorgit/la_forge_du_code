import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { runSql, _setSqlLocateFile } from "./run-sql";

// Under Node, sql.js loads the wasm from node_modules.
beforeAll(() => {
  _setSqlLocateFile((file) =>
    path.join(process.cwd(), "node_modules/sql.js/dist", file)
  );
});

describe("runSql", () => {
  it("runs a CREATE + INSERT and reads the state via verify", async () => {
    const run = await runSql(
      "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);\n" +
        "INSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);",
      { verify: "SELECT id, nom, niveau FROM pilotes ORDER BY id" }
    );
    expect(run.error).toBeNull();
    expect(run.verify).not.toBeNull();
    expect(run.verify!.rows).toEqual([[1, "Lia", 5]]);
  });

  it("returns the result of a SELECT on a pre-seeded database", async () => {
    const seed =
      "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom TEXT, niveau INTEGER);" +
      "INSERT INTO pilotes VALUES (1,'Lia',5),(2,'Bo',2),(3,'Kal',8);";
    const run = await runSql(
      "SELECT nom, niveau FROM pilotes WHERE niveau >= 5 ORDER BY niveau DESC LIMIT 10;",
      { seed }
    );
    expect(run.error).toBeNull();
    expect(run.result).not.toBeNull();
    expect(run.result!.columns).toEqual(["nom", "niveau"]);
    expect(run.result!.rows).toEqual([
      ["Kal", 8],
      ["Lia", 5],
    ]);
  });

  it("captures an SQL syntax error without crashing", async () => {
    const run = await runSql("SELECT FROM WHERE;");
    expect(run.result).toBeNull();
    expect(run.error).toBeTruthy();
  });

  it("reflects an UPDATE/DELETE via the verify query", async () => {
    const seed =
      "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, niveau INTEGER);" +
      "INSERT INTO pilotes VALUES (1,5),(2,2),(3,8);";
    const run = await runSql(
      "UPDATE pilotes SET niveau = 10 WHERE id = 1; DELETE FROM pilotes WHERE niveau < 3;",
      { seed, verify: "SELECT id, niveau FROM pilotes ORDER BY id" }
    );
    expect(run.error).toBeNull();
    // id=2 (niveau 2) deleted, id=1 raised to 10.
    expect(run.verify!.rows).toEqual([
      [1, 10],
      [3, 8],
    ]);
  });
});
