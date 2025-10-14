"use client";

import { AuthProvider } from "@/src/contexts/auth-context";
import { TrialRequestProvider, useTrialRequest } from "@/src/contexts/trial-request-context";
import { TrialRequestDialog } from "@/src/components/TrialRequestDialog";

function TrialRequestDialogWrapper() {
  const { isDialogOpen, selectedCourse, closeDialog } = useTrialRequest();

  return (
    <TrialRequestDialog
      open={isDialogOpen}
      onOpenChange={closeDialog}
      selectedCourse={selectedCourse}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TrialRequestProvider>
        {children}
        <TrialRequestDialogWrapper />
      </TrialRequestProvider>
    </AuthProvider>
  );
}
