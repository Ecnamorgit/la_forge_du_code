import type { Validator } from "@/data/courses/html/types";
import { validators as chapitre1Validators } from "./chapitre-1";
import { validators as chapitre2Validators } from "./chapitre-2";
import { validators as chapitre3Validators } from "./chapitre-3";
import { validators as chapitre4Validators } from "./chapitre-4";
import { validators as chapitre5Validators } from "./chapitre-5";
import { validators as chapitre6Validators } from "./chapitre-6";
import { validators as chapitre7Validators } from "./chapitre-7";
import { validators as chapitre8Validators } from "./chapitre-8";
import { validators as chapitre9Validators } from "./chapitre-9";
import { validators as chapitre10Validators } from "./chapitre-10";

export const VALIDATORS_BY_CHAPTER: Record<string, Validator[]> = {
  "chapitre-1": chapitre1Validators,
  "chapitre-2": chapitre2Validators,
  "chapitre-3": chapitre3Validators,
  "chapitre-4": chapitre4Validators,
  "chapitre-5": chapitre5Validators,
  "chapitre-6": chapitre6Validators,
  "chapitre-7": chapitre7Validators,
  "chapitre-8": chapitre8Validators,
  "chapitre-9": chapitre9Validators,
  "chapitre-10": chapitre10Validators,
};
