import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownText({ text }: { text: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-700/75 hover:underline"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </Markdown>
  );
}
