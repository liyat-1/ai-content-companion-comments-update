import { describe, expect, test } from "bun:test";
import { seedState } from "./marketing";

describe("automated invite channels", () => {
  const invites = seedState().campaigns.filter((campaign) => campaign.group === "invites");

  test("contains exactly the seven return-stay campaigns", () => {
    expect(invites.map((campaign) => campaign.id)).toEqual([
      "after-last-visit",
      "lost-3",
      "lost-6",
      "lost-9",
      "lost-12",
      "lost-15",
      "lost-15-plus",
    ]);
  });

  test.each(invites)("$name sends both email and text to Direct and OTA guests", (campaign) => {
    expect(campaign.strategy).toBe("text_email");
    for (const audience of ["direct", "ota"] as const) {
      expect(campaign.variants[audience].text.message.length).toBeGreaterThan(0);
      expect(campaign.variants[audience].email.body.length).toBeGreaterThan(0);
    }
  });
});