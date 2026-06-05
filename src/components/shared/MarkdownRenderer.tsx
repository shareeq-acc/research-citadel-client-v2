"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Process text block by block
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeLines: string[] = [];

  let inList = false;
  let listItems: string[] = [];
  let listType: "ul" | "ol" = "ul";

  const flushList = (key: number) => {
    if (listItems.length === 0) return null;
    const items = listItems.map((item, i) => (
      <li key={i} className="mb-1 text-xs sm:text-sm leading-relaxed text-stone-800">
        {parseInline(item)}
      </li>
    ));
    listItems = [];
    inList = false;
    if (listType === "ol") {
      return (
        <ol key={`list-${key}`} className="list-decimal pl-5 mb-4 font-sans space-y-1">
          {items}
        </ol>
      );
    } else {
      return (
        <ul key={`list-${key}`} className="list-disc pl-5 mb-4 font-sans space-y-1">
          {items}
        </ul>
      );
    }
  };

  const flushCodeBlock = (key: number) => {
    if (codeLines.length === 0) return null;
    const codeText = codeLines.join("\n");
    codeLines = [];
    inCodeBlock = false;
    return (
      <div key={`code-${key}`} className="mb-4 rounded border-2 border-neo-dark bg-[#1A1A1A] text-stone-100 p-3 shadow-[1.5px_1.5px_0px_#0A0A0A] overflow-x-auto">
        <div className="flex justify-between items-center border-b border-stone-800 pb-1.5 mb-2 select-none">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
            {codeBlockLanguage || "code block"}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(codeText)}
            className="text-[10px] font-mono text-stone-400 hover:text-white hover:underline cursor-pointer"
          >
            Copy
          </button>
        </div>
        <pre className="text-xs font-mono leading-normal whitespace-pre">
          <code>{codeText}</code>
        </pre>
      </div>
    );
  };

  // Helper to parse inline markdown style syntax
  const parseInline = (text: string): React.ReactNode[] => {
    if (!text) return [];

    const tokenRegex = /(\*\*[\s\S]+?\*\*|__[\s\S]+?__|`[\s\S]+?`|\[[\s\S]+?\]\([\s\S]+?\))/g;
    const splitParts = text.split(tokenRegex);
    
    return splitParts.map((part, matchIdx) => {
      if (!part) return "";
      
      // Bold ** ... **
      if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
        return (
          <strong key={matchIdx} className="font-extrabold text-[#000000]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Inline Code ` ... `
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={matchIdx} className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-neo-dark font-mono text-xs rounded select-all mx-0.5">
            {part.slice(1, -1)}
          </code>
        );
      }
      // Links [anchor](url)
      if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const closingBracketIdx = part.indexOf("]");
        const textLabel = part.slice(1, closingBracketIdx);
        const linkUrl = part.slice(closingBracketIdx + 2, -1);
        return (
          <a
            key={matchIdx}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-bold underline transition-colors"
          >
            {textLabel}
          </a>
        );
      }

      return part;
    });
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    // Check code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        const cb = flushCodeBlock(idx);
        if (cb) blocks.push(cb);
      } else {
        if (inList) {
          const l = flushList(idx);
          if (l) blocks.push(l);
        }
        inCodeBlock = true;
        codeBlockLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    // Check header levels
    if (trimmed.startsWith("# ")) {
      if (inList) { const l = flushList(idx); if (l) blocks.push(l); }
      blocks.push(
        <h1 key={idx} className="text-lg sm:text-xl font-black font-display text-neo-dark mb-3 mt-4 border-b-2 border-neo-dark pb-1.5 uppercase tracking-wide">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (inList) { const l = flushList(idx); if (l) blocks.push(l); }
      blocks.push(
        <h2 key={idx} className="text-base sm:text-lg font-extrabold font-display text-neo-dark mb-2 mt-3.5 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-neo-yellow inline-block rounded-xs border border-neo-dark"></span>
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      if (inList) { const l = flushList(idx); if (l) blocks.push(l); }
      blocks.push(
        <h3 key={idx} className="text-xs sm:text-sm font-bold font-display text-stone-800 mb-1.5 mt-3 tracking-wide">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Check Blockquotes
    if (trimmed.startsWith("> ")) {
      if (inList) { const l = flushList(idx); if (l) blocks.push(l); }
      blocks.push(
        <blockquote key={idx} className="border-l-4 border-neo-yellow bg-stone-50 text-stone-700 italic px-3 py-2 rounded mb-3 text-xs sm:text-sm font-sans">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Check lists (Unordered)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const isNewListType = listType !== "ul";
      if (inList && isNewListType) {
        const l = flushList(idx);
        if (l) blocks.push(l);
      }
      inList = true;
      listType = "ul";
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Check lists (Ordered)
    const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
    if (matchOrdered) {
      const isNewListType = listType !== "ol";
      if (inList && isNewListType) {
        const l = flushList(idx);
        if (l) blocks.push(l);
      }
      inList = true;
      listType = "ol";
      listItems.push(matchOrdered[2]);
      continue;
    }

    // Paragraph breakdown
    if (trimmed === "") {
      if (inList) {
        const l = flushList(idx);
        if (l) blocks.push(l);
      }
      blocks.push(<div key={`spacer-${idx}`} className="h-2" />);
    } else {
      if (inList) {
        const l = flushList(idx);
        if (l) blocks.push(l);
      }
      blocks.push(
        <p key={idx} className="mb-2.5 text-xs sm:text-sm leading-relaxed text-stone-800 font-sans">
          {parseInline(rawLine)}
        </p>
      );
    }
  }

  // Final flush checks
  if (inList) {
    const l = flushList(lines.length);
    if (l) blocks.push(l);
  }
  if (inCodeBlock) {
    const cb = flushCodeBlock(lines.length);
    if (cb) blocks.push(cb);
  }

  return <div className="markdown-parsed">{blocks}</div>;
}
