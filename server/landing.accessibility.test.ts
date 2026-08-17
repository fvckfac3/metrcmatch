import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const landingSource = readFileSync(
  new URL("../client/src/pages/Landing.tsx", import.meta.url),
  "utf8"
);

describe("public landing-page keyboard access", () => {
  it("keeps header section links in a predictable document-order focus sequence", () => {
    const headerTargets = [
      'href="#how-it-works"',
      'href="#features"',
      'href="#proof"',
      'href="#faq"',
    ];
    const positions = headerTargets.map(target =>
      landingSource.indexOf(target)
    );

    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right)
    );
  });

  it("retains visible focus treatment for navigation, workspace actions, and FAQ controls", () => {
    expect(
      landingSource.match(/focus-visible:ring-2/g)?.length
    ).toBeGreaterThanOrEqual(5);
    expect(landingSource).toContain("<AccordionTrigger");
    expect(landingSource).toContain("Claim Your 14-Day Free Audit");
    expect(landingSource).toContain("Schedule a Live Demo");
  });
});
