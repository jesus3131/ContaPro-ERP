import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { ToastProvider, useToast } from "@/components/ui/toast";

function TestHarness() {
  const { toast } = useToast();
  return (
    <div>
      <button data-testid="show-toast" onClick={() => toast("Operación exitosa", "success")}>
        Show Toast
      </button>
      <button data-testid="show-error" onClick={() => toast("Error de conexión", "error")}>
        Show Error
      </button>
    </div>
  );
}

describe("toast system", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create and remove success toast", async () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId("show-toast").click();
    });

    expect(screen.getByText("Operación exitosa")).toBeDefined();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Operación exitosa")).toBeNull();
  });

  it("should create error toast", async () => {
    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByTestId("show-error").click();
    });

    expect(screen.getByText("Error de conexión")).toBeDefined();
  });
});
