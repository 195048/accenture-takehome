import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { testPosts, testUsers } from "../test/fixtures";
import FeedPage from "./FeedPage";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: { getUsers: vi.fn(), getUser: vi.fn(), getPosts: vi.fn(), getPost: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(api.getUsers).mockResolvedValue(testUsers);
  vi.mocked(api.getPosts).mockResolvedValue({
    data: testPosts,
    page: 1,
    pageSize: 100,
    total: testPosts.length,
    totalPages: 1,
  });
});

describe("FeedPage", () => {
  it("lists posts with their author", async () => {
    renderWithProviders(<FeedPage />);

    expect(await screen.findByText("alpha post")).toBeInTheDocument();
    expect(screen.getByText("gamma article")).toBeInTheDocument();
    expect(screen.getAllByText(/by Leanne Graham/).length).toBeGreaterThan(0);
  });

  it("filters posts by title search", async () => {
    const user = userEvent.setup();
    renderWithProviders(<FeedPage />);

    await screen.findByText("alpha post");
    await user.type(screen.getByPlaceholderText("Search by title…"), "gamma");

    expect(screen.getByText("gamma article")).toBeInTheDocument();
    expect(screen.queryByText("alpha post")).not.toBeInTheDocument();
  });
});
