import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { AssumptionsDrawer } from "@/components/assumptions/AssumptionsDrawer";
import { useAssumptions } from "@/contexts/AssumptionsContext";

const NUDGE_STORAGE_KEY = "pcaf-assumptions-nudge-dismissed";

export function AssumptionsNudge() {
  const { isComplete } = useAssumptions();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(NUDGE_STORAGE_KEY) === "1");
  }, []);

  if (isComplete || dismissed) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4 flex items-start gap-4">
        <div className="mt-1 text-primary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-medium">Add revenue assumptions to unlock economic intensity metrics</div>
          <p className="text-sm text-muted-foreground mt-1">
            Metrics like WACI and Economic Intensity use revenue as a denominator. Provide portfolio-wide revenue (with evidence) for better accuracy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AssumptionsDrawer>
            <Button size="sm" variant="default">Add assumptions</Button>
          </AssumptionsDrawer>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.setItem(NUDGE_STORAGE_KEY, "1");
              setDismissed(true);
            }}
          >
            Maybe later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
