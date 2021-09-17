import { render, screen } from "@testing-library/react";
import PreviewPost, {
  getStaticProps,
  getStaticPaths,
} from "../../pages/posts/preview/[slug]";
import { mocked } from "ts-jest/utils";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "my-fake-post",
  title: "My Fake Post",
  content: "Post excerpt",
  updatedAt: "10 de Abril",
};

jest.mock("next-auth/client");
jest.mock("next/router");
jest.mock("../../services/prismic");

describe("PreviewPost page", () => {
  it("renders correctly", async () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<PreviewPost post={post} />);

    const response = await getStaticPaths({});

    expect(response).toEqual(
      expect.objectContaining({
        paths: [],
        fallback: "blocking",
      })
    );

    expect(screen.getByText("My Fake Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirect user to post page if is authenticated", () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);

    const pushMocked = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: "fake-active-subscription",
      },
      false,
    ]);

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    render(<PreviewPost post={post} />);

    expect(pushMocked).toBeCalledWith("/posts/my-fake-post");
  });

  it("return initial data correctly", async () => {
    const prismicMocked = mocked(getPrismicClient);

    prismicMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My Fake Post" }],
          content: [{ type: "paragraph", text: "Post excerpt" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any);

    const response = await getStaticProps({ params: { slug: "my-fake-post" } });

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-fake-post",
            title: "My Fake Post",
            content: "<p>Post excerpt</p>",
            updatedAt: "01 de abril de 2021",
          },
        },
      })
    );
  });
});
