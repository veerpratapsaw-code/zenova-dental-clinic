export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  treatmentType: string;
  preferredDate: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  priorityLevel?: 'standard' | 'priority' | 'emergency';
  assignedTime?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface DentalService {
  id: string;
  title: string;
  description: string;
  iconName: string;
  details: string[];
  duration: string;
  avgCost: string;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  experience: string;
  imageURL: string;
  specialty: string;
  education: string;
  bio: string;
  daysAvailable: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
