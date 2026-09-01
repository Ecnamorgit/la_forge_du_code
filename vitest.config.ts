import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests unitaires des fonctions pures (validateurs, XP, helpers).
// Aucune dépendance à la base ni au navigateur : environnement Node.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts", "data/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // `server-only` lève une erreur à l'import hors Server Component ; en test
      // (Node) on le neutralise pour pouvoir tester les helpers serveur purs.
      "server-only": fileURLToPath(
        new URL("./test/server-only-stub.ts", import.meta.url)
      ),
    },
  },
});
