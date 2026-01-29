"use client";

import { useEffect, useRef } from "react";

type RichTextInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RichTextInput({ value, onChange }: RichTextInputProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value;
      isUpdatingRef.current = false;
    }
  }, [value]);

  const exec = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-2 py-2 text-xs">
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onClick={() => exec("bold")}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onClick={() => exec("italic")}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onClick={() => exec("underline")}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onClick={() => exec("insertUnorderedList")}
        >
          Bullets
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onClick={() => exec("insertOrderedList")}
        >
          Numbered
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[120px] w-full rounded-b-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
      />
    </div>
  );
}
