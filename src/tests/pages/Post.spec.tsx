import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/client";
import { mocked } from "ts-jest/utils";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
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
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("My Fake Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it("redirect user to home page if is not subscribed", async () => {
    const getSessionMocked = mocked(getSession);
    getSessionMocked.mockReturnValueOnce(null);

    const response = await getServerSideProps({
      req: {
        cookies: {},
      },
      params: {
        slug: "my-fake-post",
      },
    } as any);

    render(<Post post={post} />);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: "/",
          permanent: false,
        },
      })
    );
  });

  it("return initial data correctly", async () => {
    const prismicMocked = mocked(getPrismicClient);
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    prismicMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My Fake Post" }],
          content: [{ type: "paragraph", text: "Post excerpt" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any);

    const response = await getServerSideProps({
      req: {
        cookies: {},
      },
      params: {
        slug: "my-fake-post",
      },
    } as any);

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
