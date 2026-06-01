import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
}

interface PatientAuthContextType {
  patient: Patient | null;
  token: string | null;
  loginPatient: (token: string, patientData: Patient) => void;
  logoutPatient: () => void;
  isLoading: boolean;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('zenova-patient-token');
      if (storedToken) {
        try {
          const res = await fetch('/api/patient/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          const data = await res.json();
          
          if (data.success) {
            setToken(storedToken);
            setPatient(data.patient);
          } else {
            localStorage.removeItem('zenova-patient-token');
          }
        } catch (error) {
          console.error('Failed to validate patient token:', error);
          localStorage.removeItem('zenova-patient-token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginPatient = (newToken: string, patientData: Patient) => {
    localStorage.setItem('zenova-patient-token', newToken);
    setToken(newToken);
    setPatient(patientData);
  };

  const logoutPatient = () => {
    localStorage.removeItem('zenova-patient-token');
    setToken(null);
    setPatient(null);
  };

  return (
    <PatientAuthContext.Provider value={{ patient, token, loginPatient, logoutPatient, isLoading }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
}
