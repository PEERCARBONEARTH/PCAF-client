import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfessionalButtonGroupProps {
  options: {
    id: string;
    label: string;
    icon?: ReactNode;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "default" | "outline" | "glass";
}

export function ProfessionalButtonGroup({
  options,
  value,
  onChange,
  className,
  variant = "default"
}: ProfessionalButtonGroupProps) {
  const variantStyles = {
    default: {
      container: "p-1.5 bg-muted/50 rounded-lg border border-border/60",
      button: {
        active: "bg-card text-primary shadow-sm border-primary/30",
        inactive: "bg-transparent text-muted-foreground hover:text-foreground border-transparent"
      }
    },
    outline: {
      container: "rounded-lg border border-border/60",
      button: {
        active: "bg-primary/10 text-primary border-primary/30",
        inactive: "bg-transparent text-muted-foreground hover:text-foreground border-transparent"
      }
    },
    glass: {
      container: "p-1 bg-background/80 backdrop-blur-md rounded-lg border border-border/40 shadow-lg",
      button: {
        active: "bg-primary text-primary-foreground border-primary/50 shadow-md",
        inactive: "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground border-transparent"
      }
    }
  };

  return (
    <div className={cn(
      "flex items-center",
      variantStyles[variant].container,
      className
    )}>
      {options.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant="ghost"
          className={cn(
            "flex items-center gap-2 border transition-all duration-300",
            "flex-1 rounded-md font-medium text-sm py-2 px-3 m-0.5",
            option.id === value 
              ? variantStyles[variant].button.active 
              : variantStyles[variant].button.inactive,
            option.id === value && "hover:shadow-md hover:scale-[1.02]"
          )}
          onClick={() => onChange(option.id)}
        >
          {option.icon && <span className="shrink-0">{option.icon}</span>}
          {option.label}
        </Button>
      ))}
    </div>
  );
}