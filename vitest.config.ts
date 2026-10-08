import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests unitaires de fonctions pures, sans base ni navigateur.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts", "data/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // `server-only` lève une erreur à l'import hors Server Component : on le
      // neutralise pour tester les helpers serveur.
      "server-only": fileURLToPath(
        new URL("./test/server-only-stub.ts", import.meta.url)
      ),
    },
  },
});
