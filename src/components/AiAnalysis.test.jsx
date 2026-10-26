import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiAnalysis } from "./AiAnalysis";

describe("AiAnalysis", () => {
  afterEach(() => vi.useRealTimers());

  it("shows the loading indicator", () => {
    render(<AiAnalysis loading text="" />);
    expect(screen.getByText("AI is thinking...")).toBeInTheDocument();
  });

  it("types out the text and renders **bold** as <strong>", () => {
    vi.useFakeTimers();
    render(<AiAnalysis loading={false} text="Hello **bold**" />);

    act(() => {
      vi.advanceTimersByTime(15 * 20);
    });

    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });
});
