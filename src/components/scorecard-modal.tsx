"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ScorecardView, ScorecardData } from "@/components/scorecard-view";

interface ScorecardModalProps {
  scorecard?: ScorecardData | null;
  trackName?: string;
  seniority?: string;
  concludedAt?: string | Date | null;
  trigger?: React.ReactNode;
}

export function ScorecardModal({
  scorecard,
  trackName,
  seniority,
  concludedAt,
  trigger,
}: ScorecardModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
            <FileText className="size-3.5 text-primary" />
            Ver Scorecard
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Scorecard de Evaluación</DialogTitle>
        </DialogHeader>
        <ScorecardView
          scorecard={scorecard}
          trackName={trackName}
          seniority={seniority}
          concludedAt={concludedAt}
        />
      </DialogContent>
    </Dialog>
  );
}
