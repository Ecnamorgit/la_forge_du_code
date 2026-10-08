/**
 * Réinitialise directement en base le mot de passe d'un utilisateur, sans
 * passer par l'e-mail, et marque son adresse comme vérifiée.
 *
 * Usage :
 *   npx tsx scripts/reset-password.ts <email> <newPassword>
 *
 * Nécessite DATABASE_URL dans .env.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";

async function main(): Promise<void> {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/reset-password.ts <email> <newPassword>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Le mot de passe doit faire au moins 8 caractères.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { password: hashed, emailVerified: new Date() },
    select: { email: true, username: true },
  });

  console.log(
    `✓ Mot de passe reinitialise pour ${user.email} (${user.username}). Email marque verifie.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(
      "Echec : utilisateur introuvable ou erreur DB.",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  });
