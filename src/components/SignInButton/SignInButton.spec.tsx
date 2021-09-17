import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSession, signIn } from "next-auth/client";
import { mocked } from "ts-jest/utils";
import { SignInButton } from ".";

jest.mock("next-auth/client");

describe("SignInButton component", () => {
  it("renders correctly when user is not authenticated", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    expect(screen.getByText("Sign In with GitHub")).toBeInTheDocument();
  });

  it("renders correctly when user is authenticated", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: "John Doe", email: "john.doe@example.com" },
        expires: "fake-expires",
      },
      false,
    ]);

    render(<SignInButton />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("user logged with success", async () => {
    const useSessionMocked = mocked(useSession);

    const signInMocked = mocked(signIn);

    useSessionMocked.mockReturnValueOnce([null, false]);
    render(<SignInButton />);

    const buttonClicked = screen.getByRole("button", {
      name: /sign in with github/i,
    });

    expect(screen.getByText("Sign In with GitHub")).toBeInTheDocument();
    fireEvent.click(buttonClicked);

    expect(signInMocked).toBeCalledWith("github");

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: "John Doe", email: "john.doe@example.com" },
        expires: "fake-expires",
      },
      false,
    ]);

    render(<SignInButton />);

    await waitFor(() =>
      expect(screen.queryByText("John Doe")).toBeInTheDocument()
    );
  });
});
