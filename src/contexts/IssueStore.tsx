import React, { createContext, useContext, useState, useCallback } from 'react';

export type LocalIssue = {
  id: string;
  reportedBy: string;
  reportedByName: string;
  vehicleId: string;
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: 'metro_train' | 'water_boat';
  issueDescription: string;
  photoDataUrl?: string;
  photoFileName?: string;
  createdAt: Date;
};

type IssueStoreContextType = {
  issues: LocalIssue[];
  addIssue: (issue: Omit<LocalIssue, 'id' | 'createdAt'>) => void;
};

const IssueStoreContext = createContext<IssueStoreContextType | null>(null);

export const IssueStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<LocalIssue[]>([]);

  const addIssue = useCallback((issue: Omit<LocalIssue, 'id' | 'createdAt'>) => {
    const newIssue: LocalIssue = {
      ...issue,
      id: `issue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date(),
    };
    setIssues(prev => [newIssue, ...prev]);
  }, []);

  return (
    <IssueStoreContext.Provider value={{ issues, addIssue }}>
      {children}
    </IssueStoreContext.Provider>
  );
};

export const useIssueStore = () => {
  const ctx = useContext(IssueStoreContext);
  if (!ctx) throw new Error('useIssueStore must be used within IssueStoreProvider');
  return ctx;
};
