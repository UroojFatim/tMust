"use client";

import { useEffect, useRef } from "react";

type RichTextInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RichTextInput({ value, onChange }: RichTextInputProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isUpdatingRef = useRef(false);
  const selectionRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value;
      isUpdatingRef.current = false;
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && selectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  };

  const ensureSelectionInEditor = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      selectionRef.current = range;
      return;
    }

    const currentRange = selection.getRangeAt(0);
    if (!editorRef.current.contains(currentRange.commonAncestorContainer)) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      selectionRef.current = range;
    }
  };

  const exec = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      ensureSelectionInEditor();
    }
    document.execCommand(command, false, undefined);
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
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("bold")}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("italic")}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-slate-600 hover:bg-white"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => exec("underline")}
        >
          <u>U</u>
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[120px] w-full rounded-b-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  );
}
