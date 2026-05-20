import type { Validator } from "@/data/courses/html/types";
import { VALIDATORS_BY_CHAPTER as HTML_VALIDATORS } from "./html";
import { VALIDATORS_BY_CHAPTER as CSS_VALIDATORS } from "./css";
import { VALIDATORS_BY_CHAPTER as JS_VALIDATORS } from "./javascript";

const REGISTRY: Record<string, Record<string, Validator[]>> = {
  html: HTML_VALIDATORS,
  css: CSS_VALIDATORS,
  javascript: JS_VALIDATORS,
};

export function getValidators(course: string, chapterSlug: string): Validator[] {
  return REGISTRY[course]?.[chapterSlug] ?? [];
}
