import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { runSql, _setSqlLocateFile } from "./run-sql";

// Sous Node, sql.js charge le wasm depuis node_modules.
beforeAll(() => {
  _setSqlLocateFile((file) =>
    path.join(process.cwd(), "node_modules/sql.js/dist", file)
  );
});

describe("runSql", () => {
  it("exécute un CREATE + INSERT et lit l'état via verify", async () => {
    const run = await runSql(
      "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);\n" +
        "INSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);",
      { verify: "SELECT id, nom, niveau FROM pilotes ORDER BY id" }
    );
    expect(run.error).toBeNull();
    expect(run.verify).not.toBeNull();
    expect(run.verify!.rows).toEqual([[1, "Lia", 5]]);
  });

  it("renvoie le résultat d'un SELECT sur une base pré-seedée", async () => {
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

  it("capture une erreur de syntaxe SQL sans planter", async () => {
    const run = await runSql("SELECT FROM WHERE;");
    expect(run.result).toBeNull();
    expect(run.error).toBeTruthy();
  });

  it("reflète un UPDATE/DELETE via la requête verify", async () => {
    const seed =
      "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, niveau INTEGER);" +
      "INSERT INTO pilotes VALUES (1,5),(2,2),(3,8);";
    const run = await runSql(
      "UPDATE pilotes SET niveau = 10 WHERE id = 1; DELETE FROM pilotes WHERE niveau < 3;",
      { seed, verify: "SELECT id, niveau FROM pilotes ORDER BY id" }
    );
    expect(run.error).toBeNull();
    // id=2 (niveau 2) supprimé, id=1 passé à 10.
    expect(run.verify!.rows).toEqual([
      [1, 10],
      [3, 8],
    ]);
  });
});
