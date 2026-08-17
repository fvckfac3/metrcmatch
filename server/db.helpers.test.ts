import { describe, expect, it } from "vitest";
import { getInsertId, processInBatches } from "./db";

describe("getInsertId", () => {
  it("normalizes both direct and mysql2 tuple insert results", () => {
    expect(getInsertId({ insertId: 42 })).toBe(42);
    expect(getInsertId([{ insertId: 43 }, undefined])).toBe(43);
  });

  it("rejects malformed or missing insert IDs instead of persisting NaN", () => {
    expect(() => getInsertId({ insertId: 0 })).toThrow("valid record ID");
    expect(() => getInsertId({})).toThrow("valid record ID");
  });
});

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
