import * as React from "react";
import { cn } from "@/lib/utils";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md px-3 py-1 text-base shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder-opacity-60",
          className
        )}
        style={{
          backgroundColor: "transparent",
          border: `1px solid ${P[200]}`,
          color: P[700],
          "--placeholder-color": P[400],
        } as React.CSSProperties}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = P[500];
          e.currentTarget.style.boxShadow = `0 0 0 2px ${P[100]}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = P[200];
          e.currentTarget.style.boxShadow = "none";
        }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
