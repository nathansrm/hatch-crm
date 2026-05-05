import { describe, expect, it } from "vitest";

import { resolveStartPageState } from "./startPageState";

describe("resolveStartPageState", () => {
  it("keeps explicit login on the login screen before first-user setup", () => {
    expect(
      resolveStartPageState({
        isPending: false,
        hasError: false,
        isExplicitLoginRoute: true,
        isInitialized: false,
        disableEmailPasswordAuthentication: false,
      }),
    ).toBe("login");
  });

  it("routes non-initialized default auth entry to first-user signup", () => {
    expect(
      resolveStartPageState({
        isPending: false,
        hasError: false,
        isExplicitLoginRoute: false,
        isInitialized: false,
        disableEmailPasswordAuthentication: false,
      }),
    ).toBe("signup");
  });

  it("shows login after the app has been initialized", () => {
    expect(
      resolveStartPageState({
        isPending: false,
        hasError: false,
        isExplicitLoginRoute: false,
        isInitialized: true,
        disableEmailPasswordAuthentication: false,
      }),
    ).toBe("login");
  });
});
