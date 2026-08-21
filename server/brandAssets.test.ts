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
const settingsSource = readFileSync(
  new URL("../client/src/pages/Settings.tsx", import.meta.url),
  "utf8"
);
const manifestSource = readFileSync(
  new URL("../client/public/site.webmanifest", import.meta.url),
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
      'href="/manus-storage/metrcmatch-favicon-32_3a811441.png"'
    );
  });

  it("records the visual identity rules and managed asset inventory", () => {
    expect(visualIdentitySource).toContain("Manrope ExtraBold");
    expect(visualIdentitySource).toContain("DM Mono");
    expect(visualIdentitySource).toContain("#173F3A");
    expect(visualIdentitySource).toContain("metrcmatch-app-icon_b5732b20.png");
  });

  it("declares device-specific app icons and complete link-preview metadata", () => {
    expect(manifestSource).toContain(
      "metrcmatch-android-chrome-192_15e6dc47.png"
    );
    expect(manifestSource).toContain(
      "metrcmatch-android-chrome-512_44dfad61.png"
    );
    expect(documentSource).toContain('property="og:image"');
    expect(documentSource).toContain("metrcmatch-open-graph-card_b35d2757.png");
    expect(documentSource).toContain('name="twitter:card"');
  });

  it("adds the reviewed reconciliation visual to the OLCC onboarding panel", () => {
    expect(settingsSource).toContain(
      "metrcmatch-onboarding-reconciliation_8b9db974.png"
    );
    expect(settingsSource).toContain("Oregon OLCC onboarding");
    expect(settingsSource).toContain(
      "Use MetrcMatch as a reconciliation workpaper: connect the"
    );
  });
});
