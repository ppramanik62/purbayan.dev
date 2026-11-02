import { useState, useMemo } from "react"
import { Copy, Check } from "lucide-react"
import {
  tokenizeC,
  tokenizeRust,
  tokenizeToml,
  tokenizeJavaScript,
  tokenizeTypeScript,
} from "@/lib/syntax-highlighter"

export function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const tokens = useMemo(() => {
    if (language === "c" || language === "h") return tokenizeC(code)
    if (language === "rust" || language === "rs") return tokenizeRust(code)
    if (language === "toml") return tokenizeToml(code)
    if (language === "javascript" || language === "js" || language === "jsx")
      return tokenizeJavaScript(code)
    if (language === "typescript" || language === "ts" || language === "tsx")
      return tokenizeTypeScript(code)
    return null
  }, [code, language])

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative rounded-sm border border-rule bg-code text-code-ink">
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <span className="rounded-xs px-2 py-0.5 font-code text-xs text-code-ink/60">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xs p-1 text-code-ink/60 transition-colors duration-150 hover:text-code-ink"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5 text-tokyo-green" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="font-code text-[13.5px] leading-relaxed">
          {tokens ? (
            tokens.map((t, i) => (
              <span key={i} className={t.className || undefined}>
                {t.text}
              </span>
            ))
          ) : (
            <span>{code}</span>
          )}
        </code>
      </pre>
    </div>
  )
}
