import type { Validator } from "@/data/courses/html/types";
import { validators as chapitre1Validators } from "./chapitre-1";

export const VALIDATORS_BY_CHAPTER: Record<string, Validator[]> = {
  "chapitre-1": chapitre1Validators,
};
