import { render, screen } from "@testing-library/react";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";
import { mocked } from "ts-jest/utils";

const posts = [
  {
    slug: "my-fake-post",
    title: "My Fake Post",
    excerpt: "Post excerpt",
    updatedAt: "10 de Abril",
  },
];

jest.mock("../../services/prismic");

describe("Posts page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("My Fake Post")).toBeInTheDocument();
  });

  it("return data correctly", async () => {
    const prismicMocked = mocked(getPrismicClient);

    prismicMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-fake-post",
            data: {
              title: [{ type: "heading", text: "My Fake Post" }],
              content: [{ type: "paragraph", text: "Post excerpt" }],
            },
            last_publication_date: "04-01-2021",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-fake-post",
              title: "My Fake Post",
              excerpt: "Post excerpt",
              updatedAt: "01 de abril de 2021",
            },
          ],
        },
      })
    );
  });
});
