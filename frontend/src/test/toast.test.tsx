import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/ui/toast";

function TestHarness() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast("Mensaje de prueba", "success")}>
        Show Toast
      </button>
    </div>
  );
}

describe("ToastProvider", () => {
  it("should show and auto-dismiss toast", async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <TestHarness />
      </ToastProvider>
    );

    const button = screen.getByText("Show Toast");
    await act(async () => {
      button.click();
    });

    expect(screen.getByText("Mensaje de prueba")).toBeDefined();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Mensaje de prueba")).toBeNull();

    vi.useRealTimers();
  });

  it("should render different toast types", async () => {
    function MultiToastHarness() {
      const { toast } = useToast();
      return (
        <div>
          <button onClick={() => toast("Éxito", "success")}>Success</button>
          <button onClick={() => toast("Error", "error")}>Error</button>
          <button onClick={() => toast("Info", "info")}>Info</button>
          <button onClick={() => toast("Advertencia", "warning")}>Warning</button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <MultiToastHarness />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText("Success").click();
      screen.getByText("Error").click();
      screen.getByText("Info").click();
      screen.getByText("Warning").click();
    });

    expect(screen.getByText("Éxito")).toBeDefined();
    expect(screen.getByText("Error")).toBeDefined();
    expect(screen.getByText("Info")).toBeDefined();
    expect(screen.getByText("Advertencia")).toBeDefined();
  });
});
