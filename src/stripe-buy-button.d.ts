import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "buy-button-id": string;
        "publishable-key": string;
      };
    }
  }
}

export {};
