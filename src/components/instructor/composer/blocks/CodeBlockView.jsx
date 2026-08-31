"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

export default function CodeBlockView({ block }) {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted;
      hljs.highlightElement(codeRef.current);
    }
  }, [block.code, block.language]);

  if (!block.code) {
    return <p className="text-muted-foreground text-sm">No code set</p>;
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-border">
      {block.language && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-black/40 text-[10px] uppercase font-bold text-muted-foreground tracking-widest backdrop-blur-sm rounded-bl-lg z-10">
          {block.language}
        </div>
      )}
      <pre className="px-4 py-4 overflow-auto text-[13px] bg-[#1E1E1E] m-0">
        <code ref={codeRef} className={`language-${block.language || 'plaintext'} !bg-transparent !p-0`}>
          {block.code}
        </code>
      </pre>
    </div>
  );
}
