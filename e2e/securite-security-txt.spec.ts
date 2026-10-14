import { test, expect } from "@playwright/test";

/**
 * /.well-known/security.txt (RFC 9116, audit SUP-01) says where to report a
 * vulnerability: at least one `Contact` and an `Expires` expiry date.
 */

test("a researcher finds where to report a vulnerability", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);

  const text = await res.text();
  await test.step("a contact is given", async () => {
    expect.soft(text).toMatch(/^Contact: (mailto:|https:\/\/)\S+$/m);
  });
  await test.step("an expiry date is given", async () => {
    expect.soft(text).toMatch(/^Expires: \d{4}-\d{2}-\d{2}T[\d:.]+Z$/m);
  });
});
