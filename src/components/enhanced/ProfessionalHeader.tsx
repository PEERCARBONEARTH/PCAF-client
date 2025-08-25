import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  badges?: Array<{
    text: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
    isPremium?: boolean;
    icon?: ReactNode;
  }>;
  className?: string;
}

export function ProfessionalHeader({ 
  title, 
  subtitle, 
  children, 
  badges = [],
  className 
}: ProfessionalHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-4">
          <div className="relative">
            <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-tight tracking-tight">
              <span className="font-semibold text-foreground">
                {title}
              </span>
            </h1>
            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary to-finance rounded-full" />
          </div>
          
          {subtitle && (
            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
          
          {/* Professional Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant={badge.variant || "outline"}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105",
                    badge.isPremium && "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                  )}
                >
                  {badge.icon && <span className="mr-2">{badge.icon}</span>}
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {children && (
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Professional Button Components
export function ProfessionalButton({ 
  children, 
  variant = "primary",
  ...props 
}: { 
  children: ReactNode; 
  variant?: "primary" | "secondary" | "accent" | "glass";
  [key: string]: any;
}) {
  const variants = {
    primary: cn(
      "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground",
      "hover:from-primary-dark hover:to-primary",
      "shadow-lg hover:shadow-xl hover:shadow-primary/25",
      "border border-primary/20 hover:border-primary/40",
      "hover:scale-105 hover:-translate-y-0.5"
    ),
    secondary: cn(
      "bg-gradient-to-r from-background to-muted text-foreground",
      "hover:from-muted hover:to-accent/20",
      "shadow-md hover:shadow-lg hover:shadow-accent/20",
      "border border-border hover:border-accent/40",
      "hover:scale-105 hover:-translate-y-0.5"
    ),
    accent: cn(
      "bg-gradient-to-r from-finance to-finance-light text-finance-foreground",
      "hover:from-finance-light hover:to-finance",
      "shadow-lg hover:shadow-xl hover:shadow-finance/25",
      "border border-finance/20 hover:border-finance/40",
      "hover:scale-105 hover:-translate-y-0.5"
    ),
    glass: cn(
      "bg-background/80 backdrop-blur-md text-foreground",
      "hover:bg-background/90",
      "shadow-lg hover:shadow-xl hover:shadow-primary/10",
      "border border-border/50 hover:border-primary/30",
      "hover:scale-105 hover:-translate-y-0.5"
    )
  };

  return (
    <Button 
      className={cn(
        "transition-all duration-300 group font-semibold",
        variants[variant]
      )}
      {...props}
    >
      {children}
    </Button>
  );
}