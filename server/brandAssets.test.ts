import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const brandLockupSource = readFileSync(
  new URL("../client/src/components/BrandLockup.tsx", import.meta.url),
  "utf8"
);
const landingSource = readFileSync(
  new URL("../client/src/pages/Landing.tsx", import.meta.url),
  "utf8"
);
const dashboardLayoutSource = readFileSync(
  new URL("../client/src/components/DashboardLayout.tsx", import.meta.url),
  "utf8"
);
const documentSource = readFileSync(
  new URL("../client/index.html", import.meta.url),
  "utf8"
);
const visualIdentitySource = readFileSync(
  new URL("../docs/visual-identity.md", import.meta.url),
  "utf8"
);

describe("MetrcMatch brand asset integration", () => {
  it("defines a reusable generated brand mark and typeset lockup", () => {
    expect(brandLockupSource).toContain(
      "/manus-storage/metrcmatch-app-icon_b5732b20.png"
    );
    expect(brandLockupSource).toContain("brand-wordmark");
    expect(brandLockupSource).toContain("Oregon operations");
  });

  it("uses the visual identity across public, workspace, and browser-icon surfaces", () => {
    expect(landingSource).toContain("<BrandLockup />");
    expect(dashboardLayoutSource).toContain("<BrandMark");
    expect(documentSource).toContain(
      'href="/manus-storage/metrcmatch-app-icon_b5732b20.png"'
    );
  });

  it("records the visual identity rules and managed asset inventory", () => {
    expect(visualIdentitySource).toContain("Manrope ExtraBold");
    expect(visualIdentitySource).toContain("DM Mono");
    expect(visualIdentitySource).toContain("#173F3A");
    expect(visualIdentitySource).toContain("metrcmatch-app-icon_b5732b20.png");
  });
});
