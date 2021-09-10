import { render, screen } from "@testing-library/react";
import Home, { getStaticProps } from "../../pages";
import { mocked } from "ts-jest/utils";
import { stripe } from "../../services/stripe";

jest.mock("next/router");
jest.mock("next-auth/client", () => {
  return {
    useSession() {
      return [null, false];
    },
  };
});
jest.mock("../../services/stripe");

describe("Home page", () => {
  it("renders correctly", () => {
    const product = {
      priceId: "fake-price-id",
      amount: "$10,00",
    };

    render(<Home product={product} />);

    expect(screen.getByText("for $10,00 month")).toBeInTheDocument();
  });

  it("load initial data", async () => {
    const retrieveStripePricesMocked = mocked(stripe.prices.retrieve);

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: "fake-price-id",
            amount: "$10.00",
          },
        },
      })
    );
  });
});
