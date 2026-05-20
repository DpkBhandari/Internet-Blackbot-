import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, status: "unauthenticated" });
  });
  it("starts unauthenticated", () => {
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });
});
