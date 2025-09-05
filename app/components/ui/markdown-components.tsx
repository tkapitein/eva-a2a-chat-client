import { Text } from "./text";
import type { Components } from "react-markdown";

export const MarkdownComponents: Components = {
  h1: ({ children }) => <Text variant="h1">{children}</Text>,
  h2: ({ children }) => <Text variant="h2">{children}</Text>,
  h3: ({ children }) => <Text variant="h3">{children}</Text>,
  h4: ({ children }) => <Text variant="h4">{children}</Text>,
  p: ({ children }) => <Text variant="p">{children}</Text>,
  small: ({ children }) => <Text variant="small">{children}</Text>,
  blockquote: ({ children }) => (
    <div className="border-l-4 border-gray-300 pl-4">{children}</div>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => <li className="ml-4">{children}</li>,
  code: ({ children }) => (
    <code className="bg-gray-100 px-1 rounded">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-100 p-2 rounded">{children}</pre>
  ),
  img: ({ src, alt }) => <img src={src} alt={alt} className="w-full" />,
  br: () => <br />,
};
