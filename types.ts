
import { LucideProps } from 'lucide-react';
import React from 'react';

export interface PatientData {
  patientName: string;
  patientAge: string;
  gender: string; // Added for completeness, though not used in provided logic
  
  dyspnea: boolean;
  chronicCough: boolean;
  sputumProduction: boolean;
  recurrentInfections: boolean;
  
  smokingHistory: boolean;
  occupationalExposure: boolean;
  biomassExposure: boolean;
  airPollution: boolean;
  
  preBronchodilatorFEV1FVC: string;
  postBronchodilatorFEV1FVC: string;
  fev1Predicted: string;
  
  mmrcScore: string; // '0'-'4'
  
  // CAT Score Fields
  catCough: string; // '0'-'5'
  catPhlegm: string;
  catChestTightness: string;
  catBreathlessness: string;
  catActivityLimitation: string;
  catConfidenceLeaving: string;
  catSleep: string;
  catEnergy: string;
  
  exacerbationsLastYear: string;
  hospitalizationsLastYear: string;
  
  bloodEosinophils: string;
  
  currentTreatment: string[];
  comorbidities: string[];
}

export type CATScoreFields = Pick<PatientData, 
  'catCough' | 
  'catPhlegm' |  
  'catChestTightness' | 
  'catBreathlessness' | 
  'catActivityLimitation' | 
  'catConfidenceLeaving' | 
  'catSleep' | 
  'catEnergy'
>;

export type ValidationErrors = Partial<Record<keyof PatientData | 'catScore' | 'postBronchodilatorFEV1FVC' | 'fev1Predicted' | 'mmrcScore', string>>;


export interface ExpandableSectionProps { // Original props, ExternalExpandableSectionProps will extend or use these
  title: string;
  icon: React.ElementType; 
  children: React.ReactNode;
  sectionKey: string;
}

export interface CATQuestion {
  field: keyof PatientData; 
  question: string;
  opposite: string;
  description: string;
}

// Changed: component type now accepts props, P defaults to any for flexibility
// but should be constrained by specific step prop types later.
export interface StepDefinition<P = any> {
  id: string;
  title: string;
  icon: React.ElementType; 
  component: React.FC<P>; // Component now accepts props
}

export interface TreatmentRecommendation {
  primary: string;
  options: string[];
  note: string;
}
