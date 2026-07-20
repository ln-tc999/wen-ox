import { create } from "zustand";

export type SwapToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUSD?: string;
  balance?: string;
  isConfidential: boolean;
};

export type SwapQuote = {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  minimumReceived: string;
  route: string[];
  isLoading: boolean;
  error?: string;
};

type SwapState = {
  // Token selection
  tokenIn: SwapToken | null;
  tokenOut: SwapToken | null;

  // Amounts
  amountIn: string;
  amountOut: string;

  // Quote
  quote: SwapQuote | null;
  isLoadingQuote: boolean;

  // Settings
  slippage: number; // in bps (100 = 1%)
  deadline: number; // in minutes

  // Swap execution
  isSwapping: boolean;
  swapError: string | null;

  // Actions
  setTokenIn: (token: SwapToken | null) => void;
  setTokenOut: (token: SwapToken | null) => void;
  setAmountIn: (amount: string) => void;
  setAmountOut: (amount: string) => void;
  swapTokens: () => void;
  setSlippage: (slippage: number) => void;
  setDeadline: (deadline: number) => void;
  setQuote: (quote: SwapQuote | null) => void;
  setIsLoadingQuote: (loading: boolean) => void;
  setIsSwapping: (swapping: boolean) => void;
  setSwapError: (error: string | null) => void;
  reset: () => void;
};

const DEFAULT_SLIPPAGE = 50; // 0.5%
const DEFAULT_DEADLINE = 20; // 20 minutes

export const useSwapStore = create<SwapState>((set, get) => ({
  // Initial state
  tokenIn: null,
  tokenOut: null,
  amountIn: "",
  amountOut: "",
  quote: null,
  isLoadingQuote: false,
  slippage: DEFAULT_SLIPPAGE,
  deadline: DEFAULT_DEADLINE,
  isSwapping: false,
  swapError: null,

  // Actions
  setTokenIn: (token) => set({ tokenIn: token }),

  setTokenOut: (token) => set({ tokenOut: token }),

  setAmountIn: (amount) => set({ amountIn: amount }),

  setAmountOut: (amount) => set({ amountOut: amount }),

  swapTokens: () => {
    const { tokenIn, tokenOut, amountIn, amountOut } = get();
    set({
      tokenIn: tokenOut,
      tokenOut: tokenIn,
      amountIn: amountOut,
      amountOut: amountIn,
    });
  },

  setSlippage: (slippage) => set({ slippage }),

  setDeadline: (deadline) => set({ deadline }),

  setQuote: (quote) => set({ quote }),

  setIsLoadingQuote: (loading) => set({ isLoadingQuote: loading }),

  setIsSwapping: (swapping) => set({ isSwapping: swapping }),

  setSwapError: (error) => set({ swapError: error }),

  reset: () =>
    set({
      amountIn: "",
      amountOut: "",
      quote: null,
      isLoadingQuote: false,
      isSwapping: false,
      swapError: null,
    }),
}));
