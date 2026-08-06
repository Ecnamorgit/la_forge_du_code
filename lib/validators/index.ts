import type { Validator } from "@/data/courses/html/types";
import { VALIDATORS_BY_CHAPTER as HTML_VALIDATORS } from "./html";
import { VALIDATORS_BY_CHAPTER as CSS_VALIDATORS } from "./css";
import { VALIDATORS_BY_CHAPTER as JS_VALIDATORS } from "./javascript";
import { VALIDATORS_BY_CHAPTER as REACT_VALIDATORS } from "./react";
import { VALIDATORS_BY_CHAPTER as TS_VALIDATORS } from "./typescript";
import { VALIDATORS_BY_CHAPTER as GIT_VALIDATORS } from "./git";
import { VALIDATORS_BY_CHAPTER as SQL_VALIDATORS } from "./sql";
import { VALIDATORS_BY_CHAPTER as NODEJS_VALIDATORS } from "./nodejs";
import { VALIDATORS_BY_CHAPTER as TESTS_VALIDATORS } from "./tests";
import { VALIDATORS_BY_CHAPTER as DEVOPS_VALIDATORS } from "./devops";
import { VALIDATORS_BY_CHAPTER as MONGODB_VALIDATORS } from "./mongodb";
import { VALIDATORS_BY_CHAPTER as SECURITY_VALIDATORS } from "./security";
import { VALIDATORS_BY_CHAPTER as PYTHON_VALIDATORS } from "./python";
import { VALIDATORS_BY_CHAPTER as ALGO_VALIDATORS } from "./algo";

const REGISTRY: Record<string, Record<string, Validator[]>> = {
  html: HTML_VALIDATORS,
  css: CSS_VALIDATORS,
  javascript: JS_VALIDATORS,
  react: REACT_VALIDATORS,
  typescript: TS_VALIDATORS,
  git: GIT_VALIDATORS,
  sql: SQL_VALIDATORS,
  nodejs: NODEJS_VALIDATORS,
  tests: TESTS_VALIDATORS,
  devops: DEVOPS_VALIDATORS,
  mongodb: MONGODB_VALIDATORS,
  security: SECURITY_VALIDATORS,
  python: PYTHON_VALIDATORS,
  algo: ALGO_VALIDATORS,
};

export function getValidators(course: string, chapterSlug: string): Validator[] {
  return REGISTRY[course]?.[chapterSlug] ?? [];
}

/**
 * Slugs des cursus ayant des validateurs.
 *
 * `getValidators` renvoie `[]` aussi bien pour un cursus absent que pour un
 * chapitre inconnu : sans cette fonction, les deux cas sont indistinguables.
 */
export function listValidatorCourses(): string[] {
  return Object.keys(REGISTRY);
}
