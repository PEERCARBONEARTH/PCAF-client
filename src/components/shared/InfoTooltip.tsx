import * as React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoTooltipProps {
  content: string;
  href?: string;
  ariaLabel?: string;
}

export function InfoTooltip({ content, href, ariaLabel = "More info" }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        <div className="space-y-2">
          <p className="leading-snug">{content}</p>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="underline text-primary"
            >
              Learn more
            </a>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
