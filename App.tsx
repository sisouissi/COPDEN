// IMPORTANT: This file is TypeScript with JSX (.tsx).
// For it to run correctly in a browser, it MUST be transpiled to standard JavaScript (e.g., via a build process with Vite, Parcel, Webpack, or Next.js).
// The "Invalid or unexpected token" error often occurs if the browser receives TSX/JSX code directly.

import React, { useState, useCallback, useMemo, useTransition, useDeferredValue, useEffect } from 'react';
import { PatientData, ValidationErrors, CATQuestion, StepDefinition as StepDefinitionType, TreatmentRecommendation, CATScoreFields } from './types'; // Renamed StepDefinition to StepDefinitionType to avoid conflict
import { 
    ChevronRight, ChevronDown, AlertTriangle, CheckCircle, Info, Calculator, FileText, Activity, Users, Settings, Printer, User, LucideProps, X, Hospital, Stethoscope, Pill, AirVent, AlertOctagon, Repeat, Home, HelpCircle, GitFork,
    CalendarClock, ClipboardList, Baseline, Bike, HeartPulse, FilePenLine, HandHeart, Scissors, Layers, Slice, Recycle, BookText
} from 'lucide-react';

// Helper to type Lucide icons more strictly if needed, otherwise React.ElementType is fine
type IconComponent = React.FC<LucideProps>;

// Props for ExpandableSection (externalized)
interface ExternalExpandableSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const ExternalExpandableSection: React.FC<ExternalExpandableSectionProps> = React.memo(({
  title,
  icon: Icon,
  children,
  sectionKey,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 shadow-sm">
      <button
        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`section-content-${sectionKey}`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-left text-gray-700">{title}</span>
        </div>
        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
      </button>
      {isExpanded && (
        <div id={`section-content-${sectionKey}`} className="p-4 border-t border-gray-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
});
ExternalExpandableSection.displayName = 'ExternalExpandableSection';


// Props for PatientInfoStep (externalized)
interface PatientInfoStepProps {
  patientData: PatientData;
  handleFieldChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  validationErrors: ValidationErrors;
}

const PatientInfoStep: React.FC<PatientInfoStepProps> = React.memo(({
  patientData,
  handleFieldChange,
  validationErrors
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Patient Information</h3>
        <p className="text-blue-700 text-base">Enter basic patient information to begin the assessment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="patientName" className="block text-base font-medium text-gray-700 mb-1">Patient Full Name *</label>
          <input
            id="patientName"
            type="text"
            value={patientData.patientName}
            onChange={(e) => handleFieldChange('patientName', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.patientName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Firstname Lastname"
            autoComplete="name"
          />
          {validationErrors.patientName && (
            <p className="text-red-600 text-sm mt-1" role="alert">{validationErrors.patientName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="patientAge" className="block text-base font-medium text-gray-700 mb-1">Age *</label>
          <input
            id="patientAge"
            type="number"
            min="18"
            max="120"
            value={patientData.patientAge}
            onChange={(e) => handleFieldChange('patientAge', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.patientAge ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="65"
            autoComplete="age"
          />
          {validationErrors.patientAge && (
            <p className="text-red-600 text-sm mt-1" role="alert">{validationErrors.patientAge}</p>
          )}
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="font-semibold text-green-800">Ready to Start</span>
        </div>
        <p className="text-green-700 text-base">
          Once the information is entered, you can proceed with the diagnostic assessment according to GOLD 2025 criteria.
        </p>
      </div>
    </div>
  );
});
PatientInfoStep.displayName = 'PatientInfoStep';


const initialPatientData: PatientData = {
  patientName: '',
  patientAge: '',
  gender: '',
  
  dyspnea: false,
  chronicCough: false,
  sputumProduction: false,
  recurrentInfections: false,
  
  smokingHistory: false,
  occupationalExposure: false,
  biomassExposure: false,
  airPollution: false,
  
  preBronchodilatorFEV1FVC: '',
  postBronchodilatorFEV1FVC: '',
  fev1Predicted: '',
  
  mmrcScore: '',
  
  catCough: '',
  catPhlegm: '',  
  catChestTightness: '',
  catBreathlessness: '',
  catActivityLimitation: '',
  catConfidenceLeaving: '',
  catSleep: '',
  catEnergy: '',
  
  exacerbationsLastYear: '',
  hospitalizationsLastYear: '',
  
  bloodEosinophils: '',
  
  currentTreatment: [],
  comorbidities: []
};

interface CATScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (catScores: CATScoreFields) => void;
  initialData: CATScoreFields;
  catQuestions: CATQuestion[];
}

const CATScoreModal: React.FC<CATScoreModalProps> = ({ isOpen, onClose, onSubmit, initialData, catQuestions }) => {
  const [localCatScores, setLocalCatScores] = useState<CATScoreFields>(initialData);

  useEffect(() => {
    if (isOpen) {
      setLocalCatScores(initialData);
    }
  }, [initialData, isOpen]);

  const handleScoreChange = (field: keyof CATScoreFields, value: string) => {
    setLocalCatScores(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const allFilled = catQuestions.every(q => {
      const fieldValue = localCatScores[q.field as keyof CATScoreFields];
      return fieldValue !== '' && fieldValue !== undefined && fieldValue !== null;
    });

    if (allFilled) {
      onSubmit(localCatScores);
    } else {
      alert("Please answer all CAT questions to validate.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="cat-modal-title" className="text-xl font-semibold text-gray-800">COPD Assessment Test (CAT)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close CAT Modal">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-base">
              For each item, check the box that best describes your current condition (0 = not at all, 5 = extremely).
            </p>
          </div>
          {catQuestions.map((q, index) => (
            <div key={q.field} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">Question {index + 1}: {q.description}</h5>
              <div className="mb-3 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>0: {q.question}</span>
                  <span>5: {q.opposite}</span>
                </div>
              </div>
              <fieldset className="flex justify-between items-center space-x-1 sm:space-x-2">
                <legend className="sr-only">{q.description}</legend>
                {[0, 1, 2, 3, 4, 5].map(score => (
                  <label key={score} className="flex flex-col items-center space-y-1 cursor-pointer p-1 hover:bg-blue-50 rounded-md">
                    <input
                      type="radio"
                      name={q.field}
                      value={score.toString()}
                      checked={localCatScores[q.field as keyof CATScoreFields] === score.toString()}
                      onChange={(e) => handleScoreChange(q.field as keyof CATScoreFields, e.target.value)}
                      className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-base font-medium text-gray-700">{score}</span>
                  </label>
                ))}
              </fieldset>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Validate and Close
          </button>
        </div>
      </div>
    </div>
  );
};
CATScoreModal.displayName = 'CATScoreModal';

// Common props for all step components
interface StepComponentCommonProps {
  patientData: PatientData;
  handleFieldChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  validationErrors: ValidationErrors;
  expandedSections: Record<string, boolean>;
  onToggleSection: (sectionKey: string) => void;
  // Add other common props if needed by most steps
}

interface AbbreviationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AbbreviationsModal: React.FC<AbbreviationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const abbreviationsList = [
    { abbr: 'ABE', term: 'GOLD Groups A, B, E for patient classification' },
    { abbr: 'BD', term: 'Bronchodilator' },
    { abbr: 'CAT', term: 'COPD Assessment Test' },
    { abbr: 'COPD', term: 'Chronic Obstructive Pulmonary Disease' },
    { abbr: 'DLCO', term: 'Diffusing capacity of the Lungs for Carbon Monoxide' },
    { abbr: 'EBV', term: 'Endobronchial Valves' },
    { abbr: 'ELVR', term: 'Endoscopic Lung Volume Reduction' },
    { abbr: 'FEV1', term: 'Forced Expiratory Volume in 1 second' },
    { abbr: 'FVC', term: 'Forced Vital Capacity' },
    { abbr: 'GOLD', term: 'Global Initiative for Chronic Obstructive Lung Disease' },
    { abbr: 'ICS', term: 'Inhaled Corticosteroid' },
    { abbr: 'IMV', term: 'Invasive Mechanical Ventilation' },
    { abbr: 'LABA', term: 'Long-Acting Beta2-Agonist' },
    { abbr: 'LAMA', term: 'Long-Acting Muscarinic Antagonist' },
    { abbr: 'LTOT', term: 'Long-Term Oxygen Therapy' },
    { abbr: 'LVRS', term: 'Lung Volume Reduction Surgery' },
    { abbr: 'mMRC', term: 'modified Medical Research Council (dyspnea scale)' },
    { abbr: 'NIV', term: 'Non-Invasive Ventilation' },
    { abbr: 'PaO2', term: 'Partial pressure of Oxygen in arterial blood' },
    { abbr: 'SABA', term: 'Short-Acting Beta2-Agonist' },
    { abbr: 'SABD', term: 'Short-Acting Bronchodilator' },
    { abbr: 'SAMA', term: 'Short-Acting Muscarinic Antagonist' },
    { abbr: 'SaO2', term: 'Oxygen Saturation in arterial blood' },
    { abbr: 'SpO2', term: 'Oxygen Saturation measured by pulse oximetry' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="abbreviations-modal-title">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="abbreviations-modal-title" className="text-xl font-semibold text-gray-800">Common Abbreviations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close Abbreviations Modal">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <ul className="space-y-3">
            {abbreviationsList.map(({ abbr, term }) => (
              <li key={abbr} className="flex items-start">
                <strong className="w-20 font-semibold text-blue-700 flex-shrink-0">{abbr}:</strong>
                <span className="text-gray-700">{term}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
AbbreviationsModal.displayName = 'AbbreviationsModal';


export const COPDDecisionSupport: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>('patient-info');
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);
  const [isAbbreviationsModalOpen, setAbbreviationsModalOpen] = useState<boolean>(false);
  
  const [isPending, startTransition] = useTransition();
  
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const deferredPatientData = useDeferredValue(patientData);

  const calculateCATScore = useMemo(() => {
    const catFields: (keyof CATScoreFields)[] = ['catCough', 'catPhlegm', 'catChestTightness', 'catBreathlessness', 
                      'catActivityLimitation', 'catConfidenceLeaving', 'catSleep', 'catEnergy'];
    let total = 0;
    let completedFields = 0;
    catFields.forEach(field => {
      const valueStr = deferredPatientData[field] as string;
      if (valueStr && valueStr.trim() !== '') {
        const value = parseInt(valueStr);
        if (!isNaN(value)) {
          total += value;
        }
        completedFields++;
      }
    });
    return completedFields === catFields.length ? total : null;
  }, [deferredPatientData]);

  const clearValidationError = useCallback((field: keyof ValidationErrors) => {
    setValidationErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleFieldChange = useCallback(<K extends keyof PatientData>(field: K, value: PatientData[K]) => {
    setPatientData(prevData => ({ ...prevData, [field]: value }));
    setValidationErrors(prevErrors => {
        const fieldName = field as keyof ValidationErrors;
        if (prevErrors[fieldName]) {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
        }
        return prevErrors;
    });
  }, []);

  const validateCurrentStep = useCallback(() => {
    const errors: ValidationErrors = {};
    switch(currentStep) {
      case 'patient-info':
        if (!patientData.patientName.trim()) errors.patientName = 'Name required';
        if (!patientData.patientAge.trim()) errors.patientAge = 'Age required';
        else if (isNaN(parseInt(patientData.patientAge)) || parseInt(patientData.patientAge) < 18 || parseInt(patientData.patientAge) > 120) {
          errors.patientAge = 'Age must be between 18 and 120';
        }
        break;
      case 'diagnostic':
        if (!patientData.postBronchodilatorFEV1FVC) {
          errors.postBronchodilatorFEV1FVC = 'Post-bronchodilator FEV1/FVC required for diagnosis';
        } else if (isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) || parseFloat(patientData.postBronchodilatorFEV1FVC) < 0 || parseFloat(patientData.postBronchodilatorFEV1FVC) > 1) {
          errors.postBronchodilatorFEV1FVC = 'FEV1/FVC must be between 0 and 1';
        }
        break;
      case 'assessment':
        if (!patientData.fev1Predicted) errors.fev1Predicted = 'FEV1 % predicted required';
        else if (isNaN(parseInt(patientData.fev1Predicted)) || parseInt(patientData.fev1Predicted) < 0 || parseInt(patientData.fev1Predicted) > 100) {
          errors.fev1Predicted = 'FEV1 % predicted must be between 0 and 100';
        }
        if (!patientData.mmrcScore) errors.mmrcScore = 'mMRC Score required';
        if (calculateCATScore === null) errors.catScore = 'CAT Score incomplete. Please answer all questions in the dedicated window.';
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, patientData, calculateCATScore]);

  const handleToggleSection = useCallback((sectionKey: string) => {
    startTransition(() => {
      setExpandedSections(prev => ({
        ...prev,
        [sectionKey]: !prev[sectionKey]
      }));
    });
  }, [startTransition]); // setExpandedSections is stable


  const DiagnosticStep = React.memo((props: StepComponentCommonProps) => {
    const { patientData, handleFieldChange, validationErrors, expandedSections, onToggleSection } = props;
    return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Clinical Indicators for Considering a COPD Diagnosis</h3>
        <p className="text-blue-700 text-base">Check the items present in your patient:</p>
      </div>

      <ExternalExpandableSection 
        title="Symptoms" 
        icon={Activity as IconComponent} 
        sectionKey="symptoms"
        isExpanded={!!expandedSections["symptoms"]}
        onToggle={() => onToggleSection("symptoms")}
      >
        <div className="space-y-3" role="group" aria-labelledby="symptoms-heading">
          <h4 id="symptoms-heading" className="sr-only">List of symptoms to assess</h4>
          {[
            { field: 'dyspnea', label: 'Progressive dyspnea (worsens over time), typically worse with exercise, persistent' },
            { field: 'chronicCough', label: 'Chronic cough (may be intermittent and may be unproductive)' },
            { field: 'sputumProduction', label: 'Chronic sputum production' },
            { field: 'recurrentInfections', label: 'Recurrent lower respiratory tract infections' }
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={patientData[field as keyof Pick<PatientData, 'dyspnea'|'chronicCough'|'sputumProduction'|'recurrentInfections'>]}
                onChange={(e) => handleFieldChange(field as keyof PatientData, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </ExternalExpandableSection>

      <ExternalExpandableSection 
        title="Risk Factors" 
        icon={AlertTriangle as IconComponent} 
        sectionKey="riskFactors"
        isExpanded={!!expandedSections["riskFactors"]}
        onToggle={() => onToggleSection("riskFactors")}
      >
        <div className="space-y-3" role="group" aria-labelledby="risk-factors-heading">
          <h4 id="risk-factors-heading" className="sr-only">Risk factors to assess</h4>
          {[
            { field: 'smokingHistory', label: 'Tobacco smoke (including popular local preparations)' },
            { field: 'occupationalExposure', label: 'Occupational dusts, vapors, fumes, gases and other chemicals' },
            { field: 'biomassExposure', label: 'Smoke from home cooking and heating fuels' },
            { field: 'airPollution', label: 'Outdoor air pollution' }
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={patientData[field as keyof Pick<PatientData, 'smokingHistory'|'occupationalExposure'|'biomassExposure'|'airPollution'>]}
                onChange={(e) => handleFieldChange(field as keyof PatientData, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </ExternalExpandableSection>

      <ExternalExpandableSection 
        title="Spirometry *" 
        icon={Calculator as IconComponent} 
        sectionKey="spirometry"
        isExpanded={!!expandedSections["spirometry"]}
        onToggle={() => onToggleSection("spirometry")}
      >
        <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200" role="alert">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-yellow-600" aria-hidden="true" />
            <span className="font-semibold text-yellow-800">Important</span>
          </div>
          <p className="text-yellow-700 text-base">
            Post-bronchodilator spirometry showing an FEV1/FVC ratio &lt; 0.7 is required to confirm COPD diagnosis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pre-fev1-fvc" className="block text-base font-medium text-gray-700 mb-1">
              Pre-bronchodilator FEV1/FVC
            </label>
            <input
              id="pre-fev1-fvc"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={patientData.preBronchodilatorFEV1FVC}
              onChange={(e) => handleFieldChange('preBronchodilatorFEV1FVC', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0.65"
            />
          </div>
          
          <div>
            <label htmlFor="post-fev1-fvc" className="block text-base font-medium text-gray-700 mb-1">
              Post-bronchodilator FEV1/FVC *
            </label>
            <input
              id="post-fev1-fvc"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={patientData.postBronchodilatorFEV1FVC}
              onChange={(e) => handleFieldChange('postBronchodilatorFEV1FVC', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.postBronchodilatorFEV1FVC ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.65"
              required
              aria-describedby={validationErrors.postBronchodilatorFEV1FVC ? 'post-fev1-error' : undefined}
            />
            {validationErrors.postBronchodilatorFEV1FVC && (
              <p id="post-fev1-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.postBronchodilatorFEV1FVC}
              </p>
            )}
          </div>
        </div>
        
        {patientData.postBronchodilatorFEV1FVC && !isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) && (
          <div className={`mt-4 p-3 rounded-lg transition-colors text-base ${
            parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`} role="status" aria-live="polite">
            <span className="font-semibold">
              {parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 
                ? '✓ Consistent with COPD diagnosis' 
                : '✗ Not consistent with COPD diagnosis'}
            </span>
             {' '} (Value: {patientData.postBronchodilatorFEV1FVC})
          </div>
        )}
      </ExternalExpandableSection>
    </div>
  )});
  DiagnosticStep.displayName = 'DiagnosticStep';

  const calculateGOLDGroup = useMemo((): 'A' | 'B' | 'E' | 'Unknown' => {
    if (!deferredPatientData.mmrcScore || calculateCATScore === null || !deferredPatientData.exacerbationsLastYear || !deferredPatientData.hospitalizationsLastYear) return 'Unknown';
    const mmrc = parseInt(deferredPatientData.mmrcScore);
    const cat = calculateCATScore;
    const exacerbations = parseInt(deferredPatientData.exacerbationsLastYear);
    const hospitalizations = parseInt(deferredPatientData.hospitalizationsLastYear);
    if (isNaN(mmrc) || cat === null || isNaN(exacerbations) || isNaN(hospitalizations)) return 'Unknown';
    if (exacerbations >= 2 || hospitalizations >= 1) return 'E';
    const highSymptoms = mmrc >= 2 || cat >= 10;
    return highSymptoms ? 'B' : 'A';
  }, [deferredPatientData, calculateCATScore]);

  interface AssessmentStepProps extends StepComponentCommonProps {
    isCATModalOpen: boolean; 
    onOpenCATModal: () => void;
    onCloseCATModal: () => void; 
    onSubmitCATScores: (scores: CATScoreFields) => void; 
    currentCATDataForModal: CATScoreFields; 
    catQuestions: CATQuestion[]; 
    calculateCATScore: number | null; 
  }


  const AssessmentStep = React.memo((props: AssessmentStepProps) => {
    const { 
        patientData, handleFieldChange, validationErrors, expandedSections, onToggleSection,
        onOpenCATModal, calculateCATScore
        // Props like isCATModalOpen, onCloseCATModal, etc., are passed to AssessmentStep
        // but are primarily used for rendering the CATScoreModal at the top level of COPDDecisionSupport.
        // onOpenCATModal is used here to trigger the modal.
    } = props;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Initial Assessment According to GOLD 2025</h3>
          <p className="text-green-700 text-base">Assess airflow limitation severity, symptom impact, and exacerbation risk.</p>
        </div>

        <ExternalExpandableSection 
            title="Severity Classification (GOLD 1-4) *" 
            icon={Calculator as IconComponent} 
            sectionKey="goldGrade"
            isExpanded={!!expandedSections["goldGrade"]}
            onToggle={() => onToggleSection("goldGrade")}
        >
          <div className="mb-4">
            <label htmlFor="fev1-predicted" className="block text-base font-medium text-gray-700 mb-1">
              FEV1 (% predicted) post-bronchodilator *
            </label>
            <input
              id="fev1-predicted"
              type="number"
              min="0"
              max="100"
              value={patientData.fev1Predicted}
              onChange={(e) => handleFieldChange('fev1Predicted', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.fev1Predicted ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="65"
              required
              aria-describedby={validationErrors.fev1Predicted ? 'fev1-error' : undefined}
            />
            {validationErrors.fev1Predicted && (
              <p id="fev1-error" className="text-red-600 text-sm mt-1" role="alert">{validationErrors.fev1Predicted}</p>
            )}
          </div>
          
          {patientData.fev1Predicted && !isNaN(parseInt(patientData.fev1Predicted)) && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <span className="font-semibold text-gray-700">GOLD Classification: </span>
                <span className={`px-2 py-1 rounded text-sm font-medium text-white transition-colors ${
                  parseInt(patientData.fev1Predicted) >= 80 ? 'bg-green-500' :
                  parseInt(patientData.fev1Predicted) >= 50 ? 'bg-yellow-500' :
                  parseInt(patientData.fev1Predicted) >= 30 ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {parseInt(patientData.fev1Predicted) >= 80 ? 'GOLD 1 (Mild)' :
                   parseInt(patientData.fev1Predicted) >= 50 ? 'GOLD 2 (Moderate)' :
                   parseInt(patientData.fev1Predicted) >= 30 ? 'GOLD 3 (Severe)' : 'GOLD 4 (Very Severe)'}
                </span>
              </div>
            </div>
          )}
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Symptom Assessment *" 
            icon={Activity as IconComponent} 
            sectionKey="symptomsEval"
            isExpanded={!!expandedSections["symptomsEval"]}
            onToggle={() => onToggleSection("symptomsEval")}
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">mMRC Scale (dyspnea) *</h4>
              <fieldset className="space-y-2">
                <legend className="sr-only">Select dyspnea level</legend>
                {[
                  { value: '0', label: 'Dyspnea only with strenuous exercise' },
                  { value: '1', label: 'Short of breath when hurrying on the level or walking up a slight hill' },
                  { value: '2', label: 'Walks slower than people of the same age on the level because of breathlessness, or has to stop for breath when walking at own pace on the level' },
                  { value: '3', label: 'Stops for breath after walking about 100 meters or after a few minutes on the level' },
                  { value: '4', label: 'Too breathless to leave the house or breathless when dressing or undressing' }
                ].map(option => (
                  <label key={option.value} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="mmrc"
                      value={option.value}
                      checked={patientData.mmrcScore === option.value}
                      onChange={(e) => handleFieldChange('mmrcScore', e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-base text-gray-700">{option.value}: {option.label}</span>
                  </label>
                ))}
              </fieldset>
              {validationErrors.mmrcScore && (
                <p className="text-red-600 text-sm mt-2" role="alert">{validationErrors.mmrcScore}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">COPD Assessment Test (CAT) *</h4>
               <button
                onClick={onOpenCATModal}
                className="mb-3 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Enter / Edit CAT Score
              </button>
              
              <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total CAT Score:</span>
                  <span className={`text-2xl font-bold transition-colors ${
                    calculateCATScore !== null 
                      ? calculateCATScore < 10 ? 'text-green-600' : 'text-orange-600'
                      : 'text-gray-400'
                  }`}>
                    {calculateCATScore !== null ? `${calculateCATScore}/40` : 'Not entered or incomplete'}
                  </span>
                </div>
                {calculateCATScore !== null && (
                  <div className="mt-2 text-base">
                    <span className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      calculateCATScore < 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {calculateCATScore < 10 ? 'Low Impact' : 'Medium to High Impact'}
                    </span>
                  </div>
                )}
                 {validationErrors.catScore && (
                  <p className="text-red-600 text-sm mt-2" role="alert">{validationErrors.catScore}</p>
                )}
              </div>
            </div>
          </div>
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Exacerbation History & Eosinophils" 
            icon={AlertTriangle as IconComponent} 
            sectionKey="exacerbationsHistory"
            isExpanded={!!expandedSections["exacerbationsHistory"]}
            onToggle={() => onToggleSection("exacerbationsHistory")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exacerbations" className="block text-base font-medium text-gray-700 mb-1">
                Moderate/severe exacerbations (last year)
              </label>
              <input
                id="exacerbations"
                type="number"
                min="0"
                value={patientData.exacerbationsLastYear}
                onChange={(e) => handleFieldChange('exacerbationsLastYear', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
            
            <div>
              <label htmlFor="hospitalizations" className="block text-base font-medium text-gray-700 mb-1">
                COPD hospitalizations (last year)
              </label>
              <input
                id="hospitalizations"
                type="number"
                min="0"
                value={patientData.hospitalizationsLastYear}
                onChange={(e) => handleFieldChange('hospitalizationsLastYear', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="eosinophils" className="block text-base font-medium text-gray-700 mb-1">
              Blood eosinophils (cells/μL)
            </label>
            <input
              id="eosinophils"
              type="number"
              min="0"
              value={patientData.bloodEosinophils}
              onChange={(e) => handleFieldChange('bloodEosinophils', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="150"
            />
          </div>
        </ExternalExpandableSection>
      </div>
    );
  });
  AssessmentStep.displayName = 'AssessmentStep';

  interface TreatmentStepProps extends StepComponentCommonProps {
    goldGroup: 'A' | 'B' | 'E' | 'Unknown';
    calculateCATScore: number | null;
  }

  const TreatmentStep = React.memo((props: TreatmentStepProps) => {
    const { patientData, expandedSections, onToggleSection, goldGroup, calculateCATScore } = props;
    const bloodEos = patientData.bloodEosinophils ? parseInt(patientData.bloodEosinophils) : null;

    const getInitialTreatment = useMemo((): TreatmentRecommendation => {
      switch(goldGroup) {
        case 'A':
          return {
            primary: 'A bronchodilator',
            options: ['SABA (e.g., Salbutamol, Terbutaline) as needed', 'SAMA (e.g., Ipratropium) as needed', 'LABA (e.g., Formoterol, Salmeterol, Indacaterol, Olodaterol)', 'LAMA (e.g., Tiotropium, Glycopyrronium, Umeclidinium, Aclidinium)'],
            note: 'Choice depends on availability and individual response. Maintenance therapy with LABA or LAMA may be considered if symptoms are more persistent despite SABA/SAMA use.'
          };
        case 'B':
          return {
            primary: 'LABA + LAMA combination',
            options: ['Formoterol/Glycopyrronium', 'Indacaterol/Glycopyrronium', 'Vilanterol/Umeclidinium', 'Formoterol/Aclidinium', 'Tiotropium/Olodaterol'],
            note: 'A combination in a single inhaler is generally preferred for adherence. If blood eosinophils ≥ 300 cells/µL, adding an ICS can be discussed for persistent significant symptoms despite LABA+LAMA, though this group is defined by low exacerbation risk.'
          };
        case 'E':
          if (bloodEos !== null && bloodEos >= 300) {
            return {
              primary: 'LABA + LAMA + ICS combination',
              options: ['Formoterol/Glycopyrronium/Budesonide', 'Vilanterol/Umeclidinium/Fluticasone furoate', 'Salmeterol/Fluticasone propionate + Tiotropium (as separate inhalers or triple combination)'],
              note: `Eosinophils (${bloodEos} cells/µL) ≥ 300: Strong support for upfront ICS inclusion with LABA and LAMA to reduce exacerbations.`
            };
          } else if (bloodEos !== null && bloodEos >= 100) {
             return {
              primary: 'LABA + LAMA combination. Consider adding ICS.',
              options: ['LABA + LAMA initially. If exacerbations persist: add ICS (LABA+LAMA+ICS).', 'Examples of LABA+LAMA: Formoterol/Glycopyrronium, Indacaterol/Glycopyrronium, etc.'],
              note: `Eosinophils (${bloodEos} cells/µL) between 100 and 299: Adding ICS to LABA+LAMA should be considered, especially with frequent/severe exacerbations despite LABA+LAMA. Initiating with LABA+LAMA remains a valid option.`
            };
          } else { // Eos < 100 or unknown
             return {
              primary: 'LABA + LAMA combination.',
              options: ['Formoterol/Glycopyrronium', 'Indacaterol/Glycopyrronium', 'Vilanterol/Umeclidinium'],
              note: `Eosinophils ${bloodEos !== null ? `(${bloodEos} cells/µL) < 100` : 'not entered or < 100'}: Less support for ICS. Consider Roflumilast (if FEV1 < 50% and chronic bronchitis) or Azithromycin (in former smokers) if exacerbations persist on LABA+LAMA.`
            };
          }
        default:
          return { primary: 'Incomplete assessment to determine GOLD group.', options: [], note: 'Please complete previous steps.' };
      }
    }, [goldGroup, bloodEos]);

    const postBronchoFEV1FVC = parseFloat(patientData.postBronchodilatorFEV1FVC);

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-xl font-semibold text-purple-800 mb-2">GOLD 2025 Treatment Recommendations</h3>
          <p className="text-purple-700 text-base">
            Based on assessment: Group <span className="font-bold">{goldGroup}</span> | mMRC: {patientData.mmrcScore || 'N/A'} | CAT: {calculateCATScore !== null ? calculateCATScore : 'N/A'} | Eosinophils: {patientData.bloodEosinophils || 'N/R'}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Points to Note / Consistency Checks:</span>
          </h4>
          <div className="space-y-1 text-base text-yellow-700">
            {!isNaN(postBronchoFEV1FVC) && postBronchoFEV1FVC >= 0.7 && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /><span>Post-BD FEV1/FVC ≥ 0.7: COPD diagnosis not confirmed by spirometry. Reconsider diagnosis.</span></p>
            )}
            {goldGroup === 'E' && (parseInt(patientData.exacerbationsLastYear || '0') < 2 && parseInt(patientData.hospitalizationsLastYear || '0') < 1) && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" /><span>Group E but exacerbation history seems low. Check criteria for Group E (≥2 moderate exacerbations or ≥1 hospitalization).</span></p>
            )}
            {calculateCATScore !== null && patientData.mmrcScore && parseInt(patientData.mmrcScore) >= 2 && calculateCATScore < 10 && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /><span>Possible discrepancy between mMRC (≥2, symptomatic) and CAT ({'<'}10, less symptomatic). Prioritize overall clinical assessment.</span></p>
            )}
            {calculateCATScore !== null && patientData.mmrcScore && parseInt(patientData.mmrcScore) < 2 && calculateCATScore >= 10 && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /><span>Possible discrepancy between mMRC ({'<'}2, less symptomatic) and CAT (≥10, symptomatic). Prioritize overall clinical assessment.</span></p>
            )}
             {goldGroup === 'E' && bloodEos === null && (
                <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" /><span>Blood eosinophil count is important for guiding ICS use in Group E patients. If available, please enter it.</span></p>
            )}
          </div>
        </div>

        <ExternalExpandableSection 
            title="Initial Pharmacological Treatment" 
            icon={Pill as IconComponent} 
            sectionKey="pharmacological"
            isExpanded={!!expandedSections["pharmacological"]}
            onToggle={() => onToggleSection("pharmacological")}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Group {goldGroup} - Recommended Treatment:</h4>
              <p className="text-blue-700 font-medium">{getInitialTreatment.primary}</p>
              {getInitialTreatment.note && (
                <p className="text-blue-600 text-sm mt-2 italic">{getInitialTreatment.note}</p>
              )}
            </div>
            
            {getInitialTreatment.options.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Therapeutic Options (non-exhaustive examples):</h5>
                <ul className="space-y-1">
                  {getInitialTreatment.options.map((option, index) => (
                    <li key={index} className="flex items-start space-x-2 p-1">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-base text-gray-700">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Non-Pharmacological Treatment" 
            icon={Activity as IconComponent} 
            sectionKey="nonpharmacological"
            isExpanded={!!expandedSections["nonpharmacological"]}
            onToggle={() => onToggleSection("nonpharmacological")}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h5 className="font-semibold text-gray-700 mb-2">Essential for all patients</h5>
                <ul className="space-y-1 text-base text-gray-600 list-disc list-inside">
                  <li>Smoking cessation (advice and support for quitting).</li>
                  <li>Regular adapted physical activity.</li>
                  <li>Vaccinations (annual influenza, pneumococcus, COVID-19, pertussis).</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h5 className="font-semibold text-gray-700 mb-2">Depending on assessment and severity</h5>
                <ul className="space-y-1 text-base text-gray-600 list-disc list-inside">
                  <li>Pulmonary rehabilitation (for symptomatic patients and/or post-exacerbation, especially Groups B and E).</li>
                  <li>Patient education and self-management (personalized action plan).</li>
                  <li>Nutritional support if necessary.</li>
                  <li>Long-term oxygen therapy (if severe resting hypoxemia PaO2 ≤ 55 mmHg or SaO2 ≤ 88%).</li>
                  <li>Non-invasive ventilation (for selected patients with severe chronic hypercapnia).</li>
                </ul>
              </div>
            </div>
          </div>
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Interventional Treatments and Surgery (for selected cases)" 
            icon={GitFork as IconComponent} 
            sectionKey="interventionalTreatment"
            isExpanded={!!expandedSections["interventionalTreatment"]}
            onToggle={() => onToggleSection("interventionalTreatment")}
        >
          <div className="space-y-4 text-base text-gray-700">
            <p>For selected patients with advanced COPD refractory to optimal medical treatment, interventional or surgical options may be considered after multidisciplinary assessment.</p>
            
            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Scissors className="w-4 h-4 text-blue-600" /><span>Lung Volume Reduction Surgery (LVRS)</span></h5>
                <p className="text-sm ml-6 mb-1"><strong>Principle:</strong> Resection of the most severely emphysematous lung zones.</p>
                <p className="text-sm ml-6"><strong>Main Indications:</strong> Upper-lobe predominant emphysema, low post-rehabilitation exercise capacity, FEV1 &lt; 45% predicted, DLCO &lt; 45% predicted, smoking cessation.</p>
            </div>

            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Layers className="w-4 h-4 text-blue-600" /><span>Endoscopic Lung Volume Reduction (ELVR)</span></h5>
                <p className="text-sm ml-6 mb-1">Less invasive alternative. Techniques include:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 ml-10">
                    <li><strong>Endobronchial Valves (EBV):</strong> Lobar atelectasis. Key criterion: absence of collateral ventilation.</li>
                    <li><strong>Coils:</strong> Compression of emphysematous parenchyma.</li>
                    <li><strong>Vapor Ablation:</strong> Fibrosis and volume reduction.</li>
                </ul>
            </div>
            
            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Slice className="w-4 h-4 text-blue-600" /><span>Bullectomy</span></h5>
                <p className="text-sm ml-6 mb-1"><strong>Principle:</strong> Surgical resection of giant bullae.</p>
                <p className="text-sm ml-6"><strong>Indications:</strong> Compressive bullae causing dyspnea, or complications (pneumothorax, infection).</p>
            </div>

            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Recycle className="w-4 h-4 text-blue-600" /><span>Lung Transplantation</span></h5>
                <p className="text-sm ml-6 mb-1">For very severe, end-stage, refractory COPD.</p>
                <p className="text-sm ml-6"><strong>Referral Criteria (examples):</strong> BODE index ≥ 7-10, FEV1 &lt; 20% predicted, hospitalizations for hypercapnia, severe pulmonary hypertension.</p>
            </div>
             <p className="mt-3 text-sm text-gray-500 italic">These treatments require specialized assessment and are not suitable for all patients.</p>
          </div>
        </ExternalExpandableSection>
      </div>
    );
  });
  TreatmentStep.displayName = 'TreatmentStep';
  
  interface PrintReportProps {
    patientData: PatientData;
    calculateCATScore: number | null;
    goldGroup: 'A' | 'B' | 'E' | 'Unknown';
    onClose: () => void;
  }

const PrintReport = React.memo(({ patientData, calculateCATScore, goldGroup, onClose }: PrintReportProps) => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const getGoldGradeText = useMemo(() => {
      if (!patientData.fev1Predicted || isNaN(parseInt(patientData.fev1Predicted))) return 'Not entered';
      const fev1 = parseInt(patientData.fev1Predicted);
      if (fev1 >= 80) return 'GOLD 1 (Mild)';
      if (fev1 >= 50) return 'GOLD 2 (Moderate)';
      if (fev1 >= 30) return 'GOLD 3 (Severe)';
      return 'GOLD 4 (Very Severe)';
    }, [patientData.fev1Predicted]);

    const bloodEos = patientData.bloodEosinophils ? parseInt(patientData.bloodEosinophils) : null;
    const treatmentRec = useMemo(() => {
        switch(goldGroup) {
            case 'A': return 'A bronchodilator (SABA/SAMA as needed, or LABA or LAMA as maintenance if symptoms are more persistent).';
            case 'B': return `LABA + LAMA combination. ${bloodEos !== null && bloodEos >= 300 ? "Consider ICS if significant symptoms despite LABA+LAMA." : ""}`;
            case 'E':
              if (bloodEos !== null && bloodEos >= 300) return `LABA + LAMA + ICS combination (Eosinophils ${bloodEos} cells/µL: Strong support).`;
              if (bloodEos !== null && bloodEos >= 100) return `LABA + LAMA combination. Discuss ICS (Eosinophils ${bloodEos} cells/µL: Conditional support).`;
              return `LABA + LAMA combination. (Eosinophils ${bloodEos !== null ? bloodEos + ' cells/µL: ' : ''}Less support for ICS). Consider other options if exacerbations persist.`;
            default: return 'Please complete the assessment for specific recommendations.';
        }
    }, [goldGroup, bloodEos]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 print:bg-transparent" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div 
          id="printable-report-modal-content-box" 
          className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl print:shadow-none print:max-w-none print:max-h-none print:h-auto"
        >
          <div className="overflow-y-auto p-6 sm:p-8 print:overflow-visible" id="printable-report">
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
              <h1 id="report-title" className="text-3xl font-bold text-gray-900">COPD ASSESSMENT REPORT</h1>
              <p className="text-gray-600">According to GOLD 2025 Recommendations</p>
              <p className="text-base text-gray-500">Assessment Date: {currentDate}</p>
            </div>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Patient Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div><strong>Name:</strong> {patientData.patientName || 'Not entered'}</div>
                <div><strong>Age:</strong> {patientData.patientAge || 'Not entered'} {patientData.patientAge ? 'years' : ''}</div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Spirometric Diagnosis</h2>
              <div className="space-y-1 text-base">
                <div><strong>Post-bronchodilator FEV1/FVC:</strong> {patientData.postBronchodilatorFEV1FVC || 'Not entered'}</div>
                 {patientData.postBronchodilatorFEV1FVC && !isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) && (
                    <div className={`font-semibold ${parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 ? 'text-green-700' : 'text-red-700'}`}>
                    {parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 ? '✓ Airflow limitation present (consistent with COPD)' : '✗ No airflow limitation by this criterion'}
                    </div>
                 )}
                {patientData.fev1Predicted && (
                  <div><strong>Severity of airflow limitation (FEV1 % predicted):</strong> {getGoldGradeText} ({patientData.fev1Predicted}%)</div>
                )}
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Symptom and Risk Assessment</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div><strong>mMRC Score:</strong> {patientData.mmrcScore || 'Not entered'}</div>
                <div><strong>CAT Score:</strong> {calculateCATScore !== null ? `${calculateCATScore}/40` : 'Not calculated'}</div>
                <div><strong>Symptom Impact (CAT):</strong> 
                  {calculateCATScore !== null ? (calculateCATScore < 10 ? ' Low' : ' Medium to High') : ' Not assessed'}
                </div>
                <div><strong>GOLD Group (ABE):</strong> <span className="font-bold">{goldGroup}</span></div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Exacerbation History & Eosinophils</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div><strong>Moderate/severe exacerbations (last 12 months):</strong> {patientData.exacerbationsLastYear || '0'}</div>
                <div><strong>COPD hospitalizations (last 12 months):</strong> {patientData.hospitalizationsLastYear || '0'}</div>
                <div><strong>Blood eosinophils:</strong> {patientData.bloodEosinophils || 'Not entered'} {patientData.bloodEosinophils ? 'cells/µL': ''}</div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Initial Pharmacological Treatment Recommendations</h2>
              <div className="space-y-3 text-base">
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <strong>Group {goldGroup} - Recommended approach:</strong>
                  <div className="mt-1">{treatmentRec}</div>
                </div>
              </div>
            </section>
             <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Non-Pharmacological Treatment Recommendations</h2>
              <div className="text-base">
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Smoking cessation (if applicable): systematic advice and support.</li>
                    <li>Physical activity: encourage regular and adapted physical activity.</li>
                    <li>Vaccinations: influenza (annual), pneumococcus, COVID-19, pertussis.</li>
                    <li>Pulmonary rehabilitation: consider for patients in Groups B and E, and those with persistent symptoms or functional limitation.</li>
                    <li>Patient education and personalized action plan for exacerbation management.</li>
                  </ul>
              </div>
            </section>

            <div className="text-sm text-gray-500 mt-8 border-t border-gray-200 pt-4">
              <p>This report is a decision support tool generated based on the information provided and GOLD 2025 recommendations. It does not replace clinical judgment.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 print-hide">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    );
  });
PrintReport.displayName = 'PrintReport';

  const ExacerbationStep = React.memo((props: StepComponentCommonProps) => {
    const { expandedSections, onToggleSection } = props;
    const [isExacerbationActive, setIsExacerbationActive] = useState<boolean | null>(null);

    return (
    <div className="space-y-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Management of COPD Exacerbations</h3>
                <p className="text-red-700 text-base">
                    A COPD exacerbation is an acute event characterized by a worsening of the patient's respiratory symptoms beyond normal day-to-day variations, leading to a change in medication.
                </p>
            </div>
            {isExacerbationActive !== null && (
                 <button 
                    onClick={() => setIsExacerbationActive(null)} 
                    className="mt-3 sm:mt-0 sm:ml-4 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Change answer regarding current exacerbation"
                >
                    Change Answer
                </button>
            )}
        </div>

        {isExacerbationActive === null && (
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center space-x-2">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                    <span>Is the patient currently experiencing a COPD exacerbation?</span>
                </h4>
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={() => setIsExacerbationActive(true)}
                        className="px-6 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Yes
                    </button>
                    <button 
                        onClick={() => setIsExacerbationActive(false)}
                        className="px-6 py-2 text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        No
                    </button>
                </div>
            </div>
        )}

        {isExacerbationActive === false && (
            <ExternalExpandableSection 
                title="General Information on Exacerbations" 
                icon={Info as IconComponent} 
                sectionKey="exacGeneralInfo" 
                isExpanded={true} 
                onToggle={() => onToggleSection("exacGeneralInfo")}
            >
                <div className="space-y-3 text-base text-gray-700">
                    <p><strong>Definition:</strong> A COPD exacerbation is an acute event where respiratory symptoms (dyspnea, cough, sputum) worsen beyond normal variations and require a change in treatment.</p>
                    <p><strong>Importance of Prevention:</strong> Frequent exacerbations negatively impact quality of life, accelerate lung function decline, and increase the risk of hospitalization and mortality.</p>
                    <p><strong>Early Recognition:</strong> It is crucial for patients to recognize the early signs of an exacerbation:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Increased breathlessness.</li>
                        <li>Increased cough.</li>
                        <li>Change in sputum amount or color (more yellow/green).</li>
                        <li>Unusual fatigue, fever (less common).</li>
                    </ul>
                    <p><strong>Personalized Action Plan:</strong> Every patient should have a written action plan, agreed with their doctor, detailing:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>How to recognize an exacerbation.</li>
                        <li>When and how to adjust medications (e.g., increase short-acting bronchodilators).</li>
                        <li>When to start oral corticosteroids and/or antibiotics (if prescribed in advance).</li>
                        <li>When to contact a healthcare professional or go to the emergency room.</li>
                    </ul>
                    <p><strong>Reminder:</strong> Even if the patient is not currently experiencing an exacerbation, maintaining background therapy, smoking cessation, vaccination, and physical activity are essential to prevent future exacerbations.</p>
                </div>
            </ExternalExpandableSection>
        )}

        {isExacerbationActive === true && (
            <>
                <ExternalExpandableSection title="Treatment Goals" icon={CheckCircle as IconComponent} sectionKey="exacGoals" isExpanded={!!expandedSections["exacGoals"]} onToggle={() => onToggleSection("exacGoals")}>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
                    <li>Minimize the negative impact of the current exacerbation.</li>
                    <li>Prevent future events (new exacerbations).</li>
                    </ul>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Initial Assessment and Severity Classification" icon={Stethoscope as IconComponent} sectionKey="exacAssessment" isExpanded={!!expandedSections["exacAssessment"]} onToggle={() => onToggleSection("exacAssessment")}>
                    <p className="text-base text-gray-700 mb-2"><strong>Assess:</strong> Medical history, symptoms (dyspnea, cough, sputum), vital signs, arterial blood gases if respiratory failure is suspected.</p>
                    <p className="text-base text-gray-700 mb-2"><strong>Rule out confounders:</strong> Pneumonia, heart failure, pulmonary embolism, pneumothorax.</p>
                    <p className="text-base text-gray-700 mb-2"><strong>Severity classification:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
                        <li><strong>Mild:</strong> Treated only with increased short-acting bronchodilators (SABDs).</li>
                        <li><strong>Moderate:</strong> Treated with SABDs plus antibiotics and/or oral corticosteroids.</li>
                        <li><strong>Severe:</strong> Requires hospitalization or an emergency room visit. May be associated with acute respiratory failure.</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-500">Reference: GOLD 2025 Report, Figure 4.3 (adapted).</p>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Indications for Hospitalization" icon={Hospital as IconComponent} sectionKey="exacHospital" isExpanded={!!expandedSections["exacHospital"]} onToggle={() => onToggleSection("exacHospital")}>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
                    <li>Severe symptoms: sudden worsening of dyspnea at rest, high respiratory rate, low SpO2, confusion, drowsiness.</li>
                    <li>Acute respiratory failure (PaO2 &lt; 60 mmHg and/or SaO2 &lt; 90% with or without PaCO2 &gt; 50 mmHg).</li>
                    <li>Onset of new physical signs (e.g., cyanosis, peripheral edema).</li>
                    <li>Failure to respond to initial exacerbation treatment.</li>
                    <li>Serious comorbidities (e.g., heart failure, new cardiac arrhythmias).</li>
                    <li>Insufficient home support.</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-500">Reference: GOLD 2025 Report, Figure 4.4.</p>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Pharmacological Treatment of Exacerbation" icon={Pill as IconComponent} sectionKey="exacPharma" isExpanded={!!expandedSections["exacPharma"]} onToggle={() => onToggleSection("exacPharma")}>
                    <div className="space-y-4">
                    <div>
                        <h5 className="font-semibold text-gray-700 text-base mb-1">Bronchodilators:</h5>
                        <p className="text-base text-gray-600">Increase dose and/or frequency of SABDs (SABA ± SAMA). Use nebulizers or spacer devices if needed. Consider long-acting bronchodilators once the patient is stable.</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 text-base mb-1">Systemic Corticosteroids:</h5>
                        <p className="text-base text-gray-600">Prednisone 40 mg/day orally for 5 days is recommended for moderate to severe exacerbations. Reduces recovery time and improves lung function (FEV1) and hypoxemia.</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 text-base mb-1">Antibiotics:</h5>
                        <p className="text-base text-gray-600 mb-1">Indicated if all three Anthonisen cardinal symptoms are present (increased dyspnea, increased sputum volume, AND increased sputum purulence) OR if two of three symptoms are present if one is increased sputum purulence.</p>
                        <p className="text-base text-gray-600">Also indicated for patients requiring mechanical ventilation (invasive or non-invasive).</p>
                        <p className="text-base text-gray-600">Recommended duration: 5-7 days.</p>
                    </div>
                    </div>
                </ExternalExpandableSection>
                
                <ExternalExpandableSection title="Oxygen Therapy and Ventilatory Support" icon={AirVent as IconComponent} sectionKey="exacOxygen" isExpanded={!!expandedSections["exacOxygen"]} onToggle={() => onToggleSection("exacOxygen")}>
                    <div className="space-y-4">
                        <div>
                            <h5 className="font-semibold text-gray-700 text-base mb-1">Oxygen Therapy:</h5>
                            <p className="text-base text-gray-600">Administer to achieve a target SpO2 of 88-92%. Monitor for risk of oxygen-induced hypercapnia.</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-700 text-base mb-1">Non-Invasive Ventilation (NIV):</h5>
                            <p className="text-base text-gray-600">Consider if at least one of the following criteria is present: respiratory acidosis (pH ≤ 7.35 and/or PaCO2 ≥ 45 mmHg), severe dyspnea with signs of respiratory muscle fatigue, persistent hypoxemia despite oxygen therapy.</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-700 text-base mb-1">Invasive Mechanical Ventilation (IMV):</h5>
                            <p className="text-base text-gray-600">Indications: failure or contraindication to NIV, respiratory or cardiac arrest, impaired consciousness, massive aspiration, severe hemodynamic instability.</p>
                        </div>
                    </div>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Hospital Discharge and Follow-up" icon={Home as IconComponent} sectionKey="exacDischarge" isExpanded={!!expandedSections["exacDischarge"]} onToggle={() => onToggleSection("exacDischarge")}>
                    <p className="text-base text-gray-700 mb-2"><strong>Discharge criteria (examples):</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
                        <li>Clinical stability (SABD required every 4 hours or less).</li>
                        <li>Ability to use inhalers and understand treatment.</li>
                        <li>Stable blood gases and mental status.</li>
                        <li>Adequate home support.</li>
                    </ul>
                    <p className="text-base text-gray-700 mt-3 mb-2"><strong>Post-Exacerbation Follow-up:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
                        <li>Follow-up visit within 1-4 weeks.</li>
                        <li>Reassess symptoms, lung function (spirometry if stable).</li>
                        <li>Check inhalation technique and adherence.</li>
                        <li>Optimize maintenance therapy to prevent future exacerbations.</li>
                        <li>Consider pulmonary rehabilitation.</li>
                        <li>Update personalized action plan.</li>
                    </ul>
                     <p className="mt-3 text-sm text-gray-500">Reference: GOLD 2025 Report, Figure 4.10.</p>
                </ExternalExpandableSection>
            </>
        )}
    </div>
  )});
  ExacerbationStep.displayName = 'ExacerbationStep';

  const FollowUpStep = React.memo((props: StepComponentCommonProps) => {
    const { expandedSections, onToggleSection } = props;
    return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-800 mb-2">Follow-up and Long-Term Management</h3>
        <p className="text-indigo-700 text-base">
          Regular assessment is crucial to adjust treatment, monitor disease progression, and manage comorbidities.
        </p>
      </div>

      <ExternalExpandableSection title="Frequency and Goals of Follow-up" icon={CalendarClock as IconComponent} sectionKey="followupFreqObj" isExpanded={!!expandedSections["followupFreqObj"]} onToggle={() => onToggleSection("followupFreqObj")}>
        <p className="text-base text-gray-700 mb-2">The frequency of follow-up depends on the severity of COPD and patient stability:</p>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
            <li><strong>Stable patient:</strong> 1 to 2 times per year.</li>
            <li><strong>After an exacerbation:</strong> Within 1-4 weeks (early follow-up) and again around 12 weeks (late follow-up).</li>
            <li><strong>Main goals:</strong> Monitor progression, assess treatment effectiveness, check adherence, adjust treatment, manage comorbidities, prevent exacerbations.</li>
        </ul>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Regular Clinical Assessment" icon={ClipboardList as IconComponent} sectionKey="followupClinicalEval" isExpanded={!!expandedSections["followupClinicalEval"]} onToggle={() => onToggleSection("followupClinicalEval")}>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
            <li><strong>Symptoms:</strong> Use mMRC and CAT scores to quantify dyspnea and impact on quality of life.</li>
            <li><strong>Exacerbation history:</strong> Number, severity, possible causes, treatment received.</li>
            <li><strong>Smoking status:</strong> Systematic encouragement and support for cessation.</li>
            <li><strong>Exposure to risk factors:</strong> Pollution, occupational exposures.</li>
            <li><strong>Clinical examination:</strong> Weight, signs of right heart failure, etc.</li>
        </ul>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Functional and Therapeutic Monitoring" icon={Baseline as IconComponent} sectionKey="followupFunctional" isExpanded={!!expandedSections["followupFunctional"]} onToggle={() => onToggleSection("followupFunctional")}>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
            <li><strong>Spirometry:</strong> At least annually in most patients. More frequently if rapid decline or significant clinical change. Measure post-bronchodilator FEV1.</li>
            <li><strong>Inhalation technique:</strong> Check at each visit. Poor technique is a common cause of treatment ineffectiveness.</li>
            <li><strong>Treatment adherence:</strong> Openly discuss difficulties and seek solutions.</li>
            <li><strong>Oxygen saturation (SpO2):</strong> Measure at rest, and during exertion if relevant.</li>
        </ul>
      </ExternalExpandableSection>
      
      <ExternalExpandableSection title="Ongoing Non-Pharmacological Management" icon={Bike as IconComponent} sectionKey="followupNonPharma" isExpanded={!!expandedSections["followupNonPharma"]} onToggle={() => onToggleSection("followupNonPharma")}>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
            <li><strong>Physical activity:</strong> Encourage and maintain an adapted level of physical activity.</li>
            <li><strong>Pulmonary rehabilitation:</strong> Repeat if new functional deterioration or post-severe exacerbation. Maintenance programs.</li>
            <li><strong>Vaccinations:</strong> Check status and administer recommended vaccines (influenza, pneumococcus, COVID-19, pertussis).</li>
            <li><strong>Nutrition:</strong> Screen for malnutrition or obesity, dietary advice.</li>
            <li><strong>Long-term oxygen therapy (LTOT):</strong> Regularly reassess indications and adherence.</li>
            <li><strong>Home non-invasive ventilation (NIV):</strong> For selected patients, monitor effectiveness and adherence.</li>
        </ul>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Comorbidity Management" icon={HeartPulse as IconComponent} sectionKey="followupComorbidities" isExpanded={!!expandedSections["followupComorbidities"]} onToggle={() => onToggleSection("followupComorbidities")}>
        <p className="text-base text-gray-700 mb-2">Comorbidities are common and impact prognosis. The most common include:</p>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
            <li>Cardiovascular diseases (ischemic heart disease, heart failure, hypertension).</li>
            <li>Osteoporosis.</li>
            <li>Anxiety and depression.</li>
            <li>Diabetes.</li>
            <li>Lung cancer (screening for eligible smokers/ex-smokers).</li>
            <li>Sleep apnea syndrome.</li>
        </ul>
        <p className="text-base text-gray-700 mt-2">Requires coordinated care with other involved specialists.</p>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Personalized Action Plan" icon={FilePenLine as IconComponent} sectionKey="followupActionPlan" isExpanded={!!expandedSections["followupActionPlan"]} onToggle={() => onToggleSection("followupActionPlan")}>
        <p className="text-base text-gray-700">Regularly review and update the action plan for managing exacerbations. Ensure the patient understands when and how to use it.</p>
      </ExternalExpandableSection>
      
      <ExternalExpandableSection title="Palliative Care and Advance Care Planning" icon={HandHeart as IconComponent} sectionKey="followupPalliative" isExpanded={!!expandedSections["followupPalliative"]} onToggle={() => onToggleSection("followupPalliative")}>
        <p className="text-base text-gray-700">For patients with severe and very symptomatic COPD, discuss palliative care and advance care planning (advance directives, healthcare proxy) to improve quality of life and respect patient wishes at end of life.</p>
      </ExternalExpandableSection>
    </div>
  )});
  FollowUpStep.displayName = 'FollowUpStep';

  interface AppStepDefinition<P = StepComponentCommonProps> extends Omit<StepDefinitionType, 'component'> {
    component: React.FC<P>;
  }
  
  const [isCATModalOpen, setCATModalOpen] = useState(false);
  const handleOpenCATModal = useCallback(() => setCATModalOpen(true), []);
  const handleCloseCATModal = useCallback(() => setCATModalOpen(false), []);

  const handleSubmitCATScores = useCallback((submittedScores: CATScoreFields) => {
    startTransition(() => {
      setPatientData(prev => ({ ...prev, ...submittedScores }));
      const allFilled = Object.values(submittedScores).every(val => val !== '' && val !== undefined && val !== null);
      if (allFilled) {
          clearValidationError('catScore');
      }
    });
    handleCloseCATModal();
  }, [clearValidationError, handleCloseCATModal, startTransition]); 


  const catQuestions = useMemo((): CATQuestion[] => [
    { field: 'catCough', question: 'I never cough', opposite: 'I cough all the time', description: 'Cough frequency' },
    { field: 'catPhlegm', question: 'I have no phlegm (mucus) in my chest at all', opposite: 'My chest is completely full of phlegm (mucus)', description: 'Sputum production' },
    { field: 'catChestTightness', question: 'My chest does not feel tight at all', opposite: 'My chest feels very tight', description: 'Chest tightness' },
    { field: 'catBreathlessness', question: 'When I walk up a hill or one flight of stairs I am not breathless', opposite: 'When I walk up a hill or one flight of stairs I am very breathless', description: 'Breathlessness on exertion' },
    { field: 'catActivityLimitation', question: 'I am not limited doing any activities at home', opposite: 'I am very limited doing activities at home', description: 'Limitation of activities at home' },
    { field: 'catConfidenceLeaving', question: 'I am confident leaving my home despite my lung condition', opposite: 'I am not at all confident leaving my home because of my lung condition', description: 'Confidence leaving home' },
    { field: 'catSleep', question: 'I sleep soundly', opposite: 'I don\'t sleep soundly because of my lung condition', description: 'Sleep quality' },
    { field: 'catEnergy', question: 'I have lots of energy', opposite: 'I have no energy at all', description: 'Energy level' }
  ], []);

  const currentCATDataForModal = useMemo((): CATScoreFields => ({
      catCough: patientData.catCough,
      catPhlegm: patientData.catPhlegm,
      catChestTightness: patientData.catChestTightness,
      catBreathlessness: patientData.catBreathlessness,
      catActivityLimitation: patientData.catActivityLimitation,
      catConfidenceLeaving: patientData.catConfidenceLeaving,
      catSleep: patientData.catSleep,
      catEnergy: patientData.catEnergy,
  }), [
      patientData.catCough, patientData.catPhlegm, patientData.catChestTightness, 
      patientData.catBreathlessness, patientData.catActivityLimitation, 
      patientData.catConfidenceLeaving, patientData.catSleep, patientData.catEnergy
  ]);


  const steps = useMemo((): AppStepDefinition<any>[] => [
    { id: 'patient-info', title: 'Patient', icon: User as IconComponent, component: PatientInfoStep as React.FC<PatientInfoStepProps> },
    { id: 'diagnostic', title: 'Diagnosis', icon: Calculator as IconComponent, component: DiagnosticStep as React.FC<StepComponentCommonProps>},
    { id: 'assessment', title: 'Assessment', icon: Activity as IconComponent, component: AssessmentStep as React.FC<AssessmentStepProps> },
    { id: 'treatment', title: 'Treatment', icon: Settings as IconComponent, component: TreatmentStep as React.FC<TreatmentStepProps>},
    { id: 'exacerbation', title: 'Exacerbations', icon: AlertOctagon as IconComponent, component: ExacerbationStep as React.FC<StepComponentCommonProps> },
    { id: 'followup', title: 'Follow-up', icon: Repeat as IconComponent, component: FollowUpStep as React.FC<StepComponentCommonProps> }
  ], []);

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const CurrentStepConfig = steps[currentStepIndex];
  
  const commonStepProps: StepComponentCommonProps = useMemo(() => ({
    patientData,
    handleFieldChange,
    validationErrors,
    expandedSections,
    onToggleSection: handleToggleSection,
  }), [patientData, handleFieldChange, validationErrors, expandedSections, handleToggleSection]);

  const canProceedToNext = useMemo(() => {
    if (currentStep === 'patient-info') {
      return patientData.patientName.trim() !== '' && patientData.patientAge.trim() !== '' && !validationErrors.patientName && !validationErrors.patientAge;
    }
    if (currentStep === 'diagnostic') {
      return patientData.postBronchodilatorFEV1FVC.trim() !== '' && !validationErrors.postBronchodilatorFEV1FVC;
    }
    if (currentStep === 'assessment') {
      return patientData.fev1Predicted.trim() !== '' && patientData.mmrcScore !== '' && calculateCATScore !== null && !validationErrors.fev1Predicted && !validationErrors.mmrcScore && !validationErrors.catScore;
    }
    return currentStepIndex < steps.length -1;
  }, [currentStep, patientData, calculateCATScore, validationErrors, currentStepIndex, steps.length]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) { 
       if (canProceedToNext) { 
            startTransition(() => {
                const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
                setCurrentStep(steps[nextIndex].id);
                window.scrollTo(0, 0);
            });
       }
    }
  }, [validateCurrentStep, canProceedToNext, steps, currentStepIndex, startTransition]);

  const handlePrevious = useCallback(() => {
    startTransition(() => {
      setCurrentStep(steps[Math.max(0, currentStepIndex - 1)].id);
      window.scrollTo(0, 0);
    });
  }, [steps, currentStepIndex, startTransition]);

  const handleOpenAbbreviationsModal = useCallback(() => setAbbreviationsModalOpen(true), []);
  const handleCloseAbbreviationsModal = useCallback(() => setAbbreviationsModalOpen(false), []);

  const handleClosePrintReport = useCallback(() => {
    setShowPrintReport(false);
  }, []); 
  
  if (!CurrentStepConfig || !CurrentStepConfig.component) {
    return <div className="p-8 text-center text-red-500">Error: Step not found. Please refresh the page.</div>;
  }
  const CurrentStepComponent = CurrentStepConfig.component;


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            COPD Decision Support
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-4">
            COPD Management Based on{' '}
            <a 
              href="https://goldcopd.org/2025-gold-report-home/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline hover:no-underline transition-colors duration-200 font-medium"
            >
              GOLD 2025
            </a>
            {' '}Recommendations
          </p>
        </header>

        <nav className="mb-8" aria-label="Assessment Steps">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    startTransition(() => {
                      setCurrentStep(step.id);
                      window.scrollTo(0, 0);
                    });
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${ isActive 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
                    } ${isPending && isActive ? 'opacity-75 cursor-wait' : 'opacity-100'}`}
                  disabled={isPending && isActive}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
          {isPending && (
            <div className="text-center mt-3">
              <span className="text-base text-gray-500 italic">Loading step...</span>
            </div>
          )}
        </nav>

        <main className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
           {CurrentStepConfig.id === 'patient-info' && <CurrentStepComponent {...commonStepProps} />}
           {CurrentStepConfig.id === 'diagnostic' && <CurrentStepComponent {...commonStepProps} />}
           {CurrentStepConfig.id === 'assessment' && 
             <CurrentStepComponent 
                {...commonStepProps}
                isCATModalOpen={isCATModalOpen}
                onOpenCATModal={handleOpenCATModal}
                onCloseCATModal={handleCloseCATModal}
                onSubmitCATScores={handleSubmitCATScores}
                currentCATDataForModal={currentCATDataForModal}
                catQuestions={catQuestions}
                calculateCATScore={calculateCATScore} 
             />}
           {CurrentStepConfig.id === 'treatment' && 
            <CurrentStepComponent 
                {...commonStepProps} 
                goldGroup={calculateGOLDGroup}
                calculateCATScore={calculateCATScore}
            />}
           {(CurrentStepConfig.id === 'exacerbation' || CurrentStepConfig.id === 'followup') && <CurrentStepComponent {...commonStepProps} />}
        </main>

        <nav className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-3 sm:space-y-0" aria-label="Step Navigation">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isPending}
            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Previous
          </button>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {currentStepIndex >= 2 && ( 
              <button
                onClick={() => {
                    if (validateCurrentStep()) { 
                        setShowPrintReport(true);
                    }
                }}
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Generate Report</span>
              </button>
            )}
            
            <button
              onClick={handleOpenAbbreviationsModal}
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center justify-center space-x-2 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
              aria-label="View list of abbreviations"
            >
              <BookText size={18} className="mr-1" />
              <span>Abbreviations</span>
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1 || !canProceedToNext || isPending}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </nav>

        {Object.values(patientData).some(value => (typeof value === 'string' && value.trim() !== '') || (typeof value === 'boolean' && value) || (Array.isArray(value) && value.length > 0) ) && (
          <aside className="mt-10 p-4 bg-gray-50 rounded-lg shadow border border-gray-200" role="complementary">
            <h3 className="font-semibold text-gray-700 mb-2 text-base">Current Patient Summary:</h3>
            <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {patientData.patientName && (<span><strong>Patient:</strong> {patientData.patientName}</span>)}
              {patientData.patientAge && (<span><strong>Age:</strong> {patientData.patientAge} yrs</span>)}
              {patientData.postBronchodilatorFEV1FVC && (<span><strong>FEV1/FVC:</strong> {patientData.postBronchodilatorFEV1FVC}</span>)}
              {patientData.fev1Predicted && (<span><strong>FEV1 %pred:</strong> {patientData.fev1Predicted}%</span>)}
              {patientData.mmrcScore !== '' && (<span><strong>mMRC:</strong> {patientData.mmrcScore}</span>)}
              {calculateCATScore !== null && (<span><strong>CAT:</strong> {calculateCATScore}</span>)}
              {(patientData.mmrcScore !== '' || calculateCATScore !== null) && calculateGOLDGroup !== 'Unknown' && (
                <span className="font-medium text-gray-800"><strong>Group:</strong> {calculateGOLDGroup}</span>
              )}
               {patientData.bloodEosinophils && (<span><strong>Eos:</strong> {patientData.bloodEosinophils} c/µL</span>)}
            </div>
          </aside>
        )}

        {showPrintReport && 
            <PrintReport 
                patientData={patientData} 
                calculateCATScore={calculateCATScore} 
                goldGroup={calculateGOLDGroup} 
                onClose={handleClosePrintReport} 
            />}
        
        {isAbbreviationsModalOpen &&
            <AbbreviationsModal
                isOpen={isAbbreviationsModalOpen}
                onClose={handleCloseAbbreviationsModal}
            />
        }
        
        <footer className="mt-12 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            Application developed by Dr Zouhair Souissi {'©'} 2025
          </p>
          <p className="text-sm text-gray-500">
            Informational tool for healthcare professionals. Does not replace clinical judgment.
          </p>
        </footer>
      </div>
      {isCATModalOpen && ( 
            <CATScoreModal
                isOpen={isCATModalOpen}
                onClose={handleCloseCATModal}
                onSubmit={handleSubmitCATScores}
                initialData={currentCATDataForModal}
                catQuestions={catQuestions}
            />
        )}
    </div>
  );
};
