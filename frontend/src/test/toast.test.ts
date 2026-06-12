import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  document.body.innerHTML = '<div id="toast-container"></div>';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toast system", () => {
  it("should render toast container on page", () => {
    const container = document.getElementById("toast-container");
    expect(container).toBeTruthy();
  });

  it("should create and remove success toast", async () => {
    const { showToast } = await import("@/components/ui/toast");
    const id = showToast("Operación exitosa", "success");

    const toast = document.querySelector('[data-toast-id]');
    expect(toast).toBeTruthy();
    expect(toast?.textContent).toContain("Operación exitosa");

    // Should auto-remove after 4 seconds
    await vi.advanceTimersByTimeAsync(4000);
    const removed = document.querySelector('[data-toast-id]');
    expect(removed).toBeFalsy();
  });

  it("should create error toast", async () => {
    const { showToast } = await import("@/components/ui/toast");
    showToast("Error de conexión", "error");

    const toast = document.querySelector('[data-toast-id]');
    expect(toast?.textContent).toContain("Error de conexión");
  });
});
