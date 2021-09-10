import { render, screen, fireEvent } from "@testing-library/react";
import { useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";
import { mocked } from "ts-jest/utils";
import { SubscribeButton } from ".";

jest.mock("next-auth/client");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  it("redirect user to sign in when not authenticated", () => {
    const useSessionMocked = mocked(useSession);
    const signInMocked = mocked(signIn);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");

    fireEvent.click(subscribeButton);
    expect(signInMocked).toHaveBeenCalled();
  });

  it("redirect user to page of posts", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMocked = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: "fake-active-subscription",
        user: { name: "John Doe", email: "john.doe@example.com" },
        expires: "fake-expires",
      },
      false,
    ]);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");

    fireEvent.click(subscribeButton);

    expect(pushMocked).toHaveBeenCalled();
  });
});
