import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface PeercarbonLogoProps {
  className?: string;
  size?: number;
}

export function PeercarbonLogo({ className, size = 24 }: PeercarbonLogoProps) {
  const { theme } = useTheme();
  
  // Determine if we should show light mode logo
  const isLightMode = theme === "light" || (theme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <img
      src={isLightMode ? "/lovable-uploads/7f626378-5cb5-4274-8663-a808e655f39b.png" : "/lovable-uploads/168cc88d-ee8f-450f-b5ca-62824390b7df.png"}
      alt="PeerCarbon"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}