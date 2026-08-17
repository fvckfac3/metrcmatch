import { describe, expect, it } from "vitest";
import { countTestingRecords } from "./metrc";

describe("Metrc testing record summaries", () => {
  it("counts package records with a returned lab testing state", () => {
    expect(
      countTestingRecords([
        { testingStatus: "Passed" },
        { testingStatus: "Failed" },
        { testingStatus: "Unknown" },
      ])
    ).toBe(2);
  });
});
