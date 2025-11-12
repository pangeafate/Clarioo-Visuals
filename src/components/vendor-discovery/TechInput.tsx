import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { TechRequest } from "../VendorDiscovery";
import { useToast } from "@/hooks/use-toast";

interface TechInputProps {
  onSubmit: (request: TechRequest) => void;
  initialData?: TechRequest | null;
  projectId: string;
}

const TechInput = ({ onSubmit, initialData, projectId }: TechInputProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<TechRequest>(
    initialData || {
      category: '',
      description: '',
      urgency: 'medium',
      budget: '',
      companyInfo: ''
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const techCategories = [
    'CRM Software',
    'Project Management',
    'Analytics & BI',
    'Communication Tools',
    'Security Solutions',
    'DevOps & Infrastructure',
    'HR & Talent Management',
    'Marketing Automation',
    'E-commerce Platforms',
    'Data Management',
    'AI & Machine Learning',
    'Other'
  ];

  const budgetRanges = [
    'Under $1,000/month',
    '$1,000 - $5,000/month',
    '$5,000 - $15,000/month',
    '$15,000 - $50,000/month',
    '$50,000+/month',
    'One-time purchase',
    'To be determined'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Please select a technology category';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe what you\'re looking for';
    }
    if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }
    if (!formData.budget) {
      newErrors.budget = 'Please select a budget range';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveTechRequest = async (requestData: TechRequest) => {
    // 🎨 PROTOTYPE MODE: No database persistence
    // In production, this would save to database for analytics
    console.log('Tech request saved (prototype mode):', {
      category: requestData.category,
      description: requestData.description,
      budget: requestData.budget,
      urgency: requestData.urgency
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Save to database for analytics
      await saveTechRequest(formData);
      
      // Continue with the normal flow
      onSubmit(formData);
      setIsSubmitting(false);
    }
  };

  const suggestions = [
    "CRM that integrates with our existing email system",
    "Project management tool for remote teams",
    "Security monitoring for cloud infrastructure",
    "Analytics platform for customer behavior tracking"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          Tell us what technology you're exploring and we'll help you find the perfect vendors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="space-y-2">
          <Label htmlFor="companyInfo">Tell me more about your company</Label>
          <Textarea
            id="companyInfo"
            placeholder="Company size, industry, current tech stack, specific challenges, etc."
            value={formData.companyInfo || ''}
            onChange={(e) => setFormData({ ...formData, companyInfo: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        {/* Technology Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Technology Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a technology category" />
            </SelectTrigger>
            <SelectContent>
              {techCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Detailed Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe what you're looking for, specific features you need, current challenges, team size, etc."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formData.description.length} characters</span>
            <span>Minimum 20 characters</span>
          </div>
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-3">
          <Label>Need inspiration? Try these examples:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-soft transition-all"
                onClick={() => setFormData({ ...formData, description: suggestion })}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range *</Label>
            <Select 
              value={formData.budget} 
              onValueChange={(value) => setFormData({ ...formData, budget: value })}
            >
              <SelectTrigger className={errors.budget ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budget && (
              <p className="text-sm text-destructive">{errors.budget}</p>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select 
              value={formData.urgency} 
              onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, urgency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Nice to have</SelectItem>
                <SelectItem value="medium">Medium - Important</SelectItem>
                <SelectItem value="high">High - Urgent need</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            variant="professional" 
            size="lg"
            className="gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue to Criteria Building"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TechInput;