import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Search, MessageSquare, Table, CheckCircle, LogOut, User, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TechInput from "./vendor-discovery/TechInput";
import CriteriaBuilder from "./vendor-discovery/CriteriaBuilder";
import VendorSelection from "./vendor-discovery/VendorSelection";
import VendorTable from "./vendor-discovery/VendorTable";
import VendorInvite from "./vendor-discovery/VendorInvite";

export type Step = 'tech-input' | 'criteria' | 'vendor-selection' | 'vendor-comparison' | 'invite-pitch';

export interface TechRequest {
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  budget: string;
  companyInfo?: string;
}

export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  website: string;
  pricing: string;
  rating: number;
  criteriaScores: Record<string, number>;
  criteriaAnswers: Record<string, { yesNo: 'yes' | 'no' | 'partial'; comment: string; }>;
  features: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface VendorDiscoveryProps {
  project: Project;
  onBackToProjects: () => void;
}

const VendorDiscovery = ({ project, onBackToProjects }: VendorDiscoveryProps) => {
  const { user, signOut } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('tech-input');
  const [techRequest, setTechRequest] = useState<TechRequest | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🎨 PROTOTYPE MODE: No state persistence
  // In production, this would load project state from database
  useEffect(() => {
    setIsLoading(false);
  }, [project.id]);

  // 🎨 PROTOTYPE MODE: No database persistence
  // In production, this would save project state to database
  const saveProjectState = async (step: Step, stepData: any) => {
    console.log('Project state saved (prototype mode):', {
      projectId: project.id,
      step,
      hasVendors: stepData.selectedVendors?.length || 0,
      hasCriteria: stepData.criteria?.length || 0
    });
  };

  const steps = [
    { id: 'tech-input', title: 'Technology Exploration', icon: Search, description: 'Define what technology you need' },
    { id: 'criteria', title: 'Criteria Building', icon: MessageSquare, description: 'AI helps build evaluation criteria' },
    { id: 'vendor-selection', title: 'Vendor Discovery', icon: Search, description: 'Find relevant vendors' },
    { id: 'vendor-comparison', title: 'Vendor Comparison', icon: Table, description: 'Compare vendors in detail' },
    { id: 'invite-pitch', title: 'Invite to Pitch', icon: Mail, description: 'Invite vendors to present their solutions' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Show loading while state is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  const handleTechSubmit = async (request: TechRequest) => {
    setTechRequest(request);
    setCurrentStep('criteria');
    await saveProjectState('criteria', { 
      techRequest: request, 
      criteria, 
      selectedVendors 
    });
  };

  const handleCriteriaComplete = async (newCriteria: Criteria[]) => {
    setCriteria(newCriteria);
    setCurrentStep('vendor-selection');
    await saveProjectState('vendor-selection', { 
      techRequest, 
      criteria: newCriteria, 
      selectedVendors 
    });
  };

  const handleVendorSelectionComplete = async (vendors: Vendor[]) => {
    setSelectedVendors(vendors);
    setCurrentStep('vendor-comparison');
    await saveProjectState('vendor-comparison', { 
      techRequest, 
      criteria, 
      selectedVendors: vendors 
    });
  };

  const handleComparisonComplete = async () => {
    setCurrentStep('invite-pitch');
    await saveProjectState('invite-pitch', { 
      techRequest, 
      criteria, 
      selectedVendors 
    });
  };

  const handleVendorsGenerated = async (newVendors: Vendor[]) => {
    setSelectedVendors(newVendors);
    await saveProjectState(currentStep, { 
      techRequest, 
      criteria, 
      selectedVendors: newVendors 
    });
  };

  const handleStepClick = async (stepId: Step) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId);
      await saveProjectState(stepId, { 
        techRequest, 
        criteria, 
        selectedVendors 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToProjects}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isAccessible = index <= currentStepIndex;

            return (
              <Card 
                key={step.id}
                className={`cursor-pointer transition-all hover:shadow-medium ${
                  isActive ? 'ring-2 ring-primary shadow-medium' : ''
                } ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isAccessible && handleStepClick(step.id as Step)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-success text-success-foreground' : 'bg-muted'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="mt-2">
                      Current Step
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge className="mt-2 bg-success">
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="shadow-large">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStepIndex].icon, { className: "h-6 w-6" })}
              {steps[currentStepIndex].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStepIndex].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'tech-input' && (
              <TechInput onSubmit={handleTechSubmit} initialData={techRequest} projectId={project.id} />
            )}
            {currentStep === 'criteria' && techRequest && (
              <CriteriaBuilder 
                techRequest={techRequest} 
                onComplete={handleCriteriaComplete}
                initialCriteria={criteria}
              />
            )}
            {currentStep === 'vendor-selection' && criteria.length > 0 && (
              <VendorSelection 
                criteria={criteria}
                techRequest={techRequest!}
                onComplete={handleVendorSelectionComplete}
              />
            )}
            {currentStep === 'vendor-comparison' && selectedVendors.length > 0 && (
              <VendorTable 
                vendors={selectedVendors}
                criteria={criteria}
                techRequest={techRequest!}
                onVendorsGenerated={handleVendorsGenerated}
                onComplete={handleComparisonComplete}
              />
            )}
            {currentStep === 'invite-pitch' && selectedVendors.length > 0 && (
              <VendorInvite 
                vendors={selectedVendors}
                criteria={criteria}
                techRequest={techRequest!}
                projectName={project.name}
              />
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {techRequest && (
          <Card className="mt-8 bg-gradient-secondary border-0">
            <CardHeader>
              <CardTitle className="text-lg">Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-semibold">{techRequest.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="font-semibold">{techRequest.budget}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                  <Badge variant={techRequest.urgency === 'high' ? 'destructive' : 
                              techRequest.urgency === 'medium' ? 'default' : 'secondary'}>
                    {techRequest.urgency}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criteria</p>
                  <p className="font-semibold">{criteria.length} defined</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendors</p>
                  <p className="font-semibold">{selectedVendors.length} selected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorDiscovery;