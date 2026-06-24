import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/utils";
import { testUsers } from "../test/fixtures";
import UsersPage from "./UsersPage";
import { api } from "../lib/api";

vi.mock("../lib/api", () => ({
  api: { getUsers: vi.fn(), getUser: vi.fn(), getPosts: vi.fn(), getPost: vi.fn() },
}));

describe("UsersPage", () => {
  it("renders the list of authors", async () => {
    vi.mocked(api.getUsers).mockResolvedValue(testUsers);

    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("Leanne Graham")).toBeInTheDocument();
    expect(screen.getByText("Ervin Howell")).toBeInTheDocument();
    expect(screen.getByText("2 authors")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    vi.mocked(api.getUsers).mockRejectedValue(new Error("Upstream is down"));

    renderWithProviders(<UsersPage />);

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText("Upstream is down")).toBeInTheDocument();
  });
});
