import { createContext, useContext, useState, ReactNode } from 'react';

interface TrialRequestContextType {
  isDialogOpen: boolean;
  selectedCourse: string | undefined;
  openDialog: (course?: string) => void;
  closeDialog: () => void;
}

const TrialRequestContext = createContext<TrialRequestContextType | null>(null);

export function TrialRequestProvider({ children }: { children: ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();

  const openDialog = (course?: string) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCourse(undefined);
  };

  return (
    <TrialRequestContext.Provider value={{ isDialogOpen, selectedCourse, openDialog, closeDialog }}>
      {children}
    </TrialRequestContext.Provider>
  );
}

export function useTrialRequest() {
  const context = useContext(TrialRequestContext);
  if (!context) {
    throw new Error('useTrialRequest must be used within TrialRequestProvider');
  }
  return context;
}
