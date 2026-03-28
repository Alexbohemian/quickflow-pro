"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenTool, Check } from "lucide-react";

interface SignatureBlockProps {
  label: string;
  signed?: {
    name: string;
    signedAt: string;
    ipAddress?: string;
  };
  onSign?: (name: string) => void;
  readOnly?: boolean;
}

const signatureFonts = [
  "font-serif italic",
  "font-mono",
];

export function SignatureBlock({
  label,
  signed,
  onSign,
  readOnly = false,
}: SignatureBlockProps) {
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(false);

  function handleSign() {
    if (name.trim() && onSign) {
      onSign(name.trim());
      setShowInput(false);
    }
  }

  if (signed) {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
        <div className="mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {label} — Signed
          </span>
        </div>
        <p className={`text-2xl ${signatureFonts[0]}`}>{signed.name}</p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Signed on {new Date(signed.signedAt).toLocaleString()}
          {signed.ipAddress && ` from ${signed.ipAddress}`}
        </p>
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="rounded-lg border-2 border-dashed border-[var(--border)] p-6 text-center">
        <PenTool className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Awaiting signature
        </p>
      </div>
    );
  }

  if (!showInput) {
    return (
      <div className="rounded-lg border-2 border-dashed border-[var(--border)] p-6 text-center">
        <PenTool className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
        <p className="mb-3 font-medium">{label}</p>
        <Button size="sm" onClick={() => setShowInput(true)}>
          Sign Now
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-[var(--primary)] p-6">
      <p className="mb-3 font-medium">{label}</p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type your full name"
        className="mb-2"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSign();
        }}
      />
      {name && (
        <div className="mb-3 rounded-lg bg-[var(--muted)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">Preview:</p>
          <p className={`text-3xl ${signatureFonts[0]}`}>{name}</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleSign} disabled={!name.trim()}>
          Confirm Signature
        </Button>
        <Button variant="outline" onClick={() => setShowInput(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
