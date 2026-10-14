export interface DocExample {
  code: string;
  caption?: string;
}

export interface DocEntry {
  /** Stable identifier, e.g. "html/doctype". */
  id: string;
  /** Domain, e.g. "html". */
  domain: string;
  /** Term shown by default in an inline link, e.g. "<!DOCTYPE html>". */
  term: string;
  /** Sheet title. */
  title: string;
  /** One-sentence summary (preview / cluster). */
  summary: string;
  /** Body in our in-house markdown (same parser as the briefing). */
  body: string;
  /** Optional syntax block. */
  syntax?: string;
  /** Optional examples. */
  examples?: DocExample[];
  /** Common pitfalls. */
  pitfalls?: string[];
  /** Other related sheets (ids). */
  related?: string[];
  /** Optional external link to the official docs. */
  official?: { label: string; url: string };
}
