import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

describe("apiFetch", () => {
  it("should make a GET request with auth headers", async () => {
    localStorage.setItem("access_token", "test-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "ok" }),
    });

    const { apiFetch } = await import("@/lib/api");
    const result = await apiFetch("/test");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
    expect(result).toEqual({ data: "ok" });
  });

  it("should throw on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Unauthorized" }),
    });

    const { apiFetch } = await import("@/lib/api");
    await expect(apiFetch("/test")).rejects.toThrow();
  });

  it("should include company-id header when present", async () => {
    localStorage.setItem("access_token", "tok");
    localStorage.setItem("company_id", "42");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "ok" }),
    });

    const { apiFetch } = await import("@/lib/api");
    await apiFetch("/test");

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["X-Company-ID"]).toBe("42");
  });

  it("should support POST with JSON body", async () => {
    localStorage.setItem("access_token", "tok");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    const { apiFetch } = await import("@/lib/api");
    const body = { name: "Test" };
    await apiFetch("/create", { method: "POST", body });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
  });
});
