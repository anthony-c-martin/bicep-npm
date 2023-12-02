import { install } from "../src/utils/bicep";

describe("install", () => {
  it("should return true", () => {
    expect(install()).toBe(true);
  });
});