import { describe, expect, it } from "vitest";
import { processInBatches } from "./db";

describe("processInBatches", () => {
  it("limits concurrent work to the configured batch size while processing every item", async () => {
    const processed: number[] = [];
    let active = 0;
    let maximumActive = 0;

    await processInBatches([1, 2, 3, 4, 5], 2, async item => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise(resolve => setTimeout(resolve, 1));
      processed.push(item);
      active -= 1;
    });

    expect(maximumActive).toBe(2);
    expect(processed).toEqual([1, 2, 3, 4, 5]);
  });
});
