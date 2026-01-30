export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'admin';

export interface User {
  id: string | number;
  name?: string;
  full_name?: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isUrgent?: boolean;
}

export interface PatientProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  isPregnant: boolean;
  allergies: string[];
  conditions: string[];
  currentMedicines: string[];
}

export interface HealthAssessment {
  age: number;
  gender: 'male' | 'female' | 'other';
  isPregnant: boolean;
  allergies: string[];
  conditions: string[];
  currentMedicines: string[];
  takenBefore: boolean;
  hadSideEffects: boolean;
}

export interface PatientCase {
  id: string;
  patientName: string;
  medicineName: string;
  allergies: string[];
  imageUrl?: string;
  status: 'pending' | 'reviewed' | 'escalated';
  query: string;
  timestamp: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  region?: string;
  isPregnant?: boolean;
  source?: 'web' | 'whatsapp';
}

export interface MedicineQuery {
  id: string;
  medicineName: string;
  question: string;
  patientInfo?: string;
  status: 'open' | 'answered';
  timestamp: Date;
  queryType?: 'dosage' | 'interaction' | 'alternative';
}

export interface DashboardStats {
  totalPatients: number;
  activeQueries: number;
  totalDoctors: number;
  totalPharmacists: number;
  urgentCasesToday?: number;
  highRiskMedicines?: number;
  regionsWithAlerts?: number;
  mostQueriedMedicines?: string[];
}
