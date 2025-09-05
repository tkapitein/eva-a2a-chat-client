import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-2",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 mb-2",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight mb-2",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight mb-2",
      p: "leading-7 text-base [&:not(:first-child)]:mt-6",
      small: "text-sm leading-none font-medium",
      lead: "text-muted-foreground text-xl",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>;

interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  elementType?: React.ElementType;
}

function Text({ variant = "p", elementType, className, ...props }: TextProps) {
  const defaultTagByVariant: Record<TextVariant, React.ElementType> = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    p: "p",
    small: "small",
    lead: "p",
  };

  const resolvedVariant = (variant ?? "p") as TextVariant;
  const Component: React.ElementType =
    elementType ?? defaultTagByVariant[resolvedVariant];
  const classes = cn(textVariants({ variant: resolvedVariant }), className);

  return <Component className={classes} {...props} />;
}

export { Text, textVariants };
