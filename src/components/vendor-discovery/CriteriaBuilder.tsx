/**
 * 🎨 PROTOTYPE MODE: Criteria Builder Component
 * Uses mock AI service instead of OpenAI
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, MessageSquare, Plus, Trash2, Bot, User, Star, Upload, Settings } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import type { TechRequest, Criteria } from "../VendorDiscovery";
import { useCriteriaGeneration } from "@/hooks/useCriteriaGeneration";
import { useCriteriaChat } from "@/hooks/useCriteriaChat";
import { storageService } from "@/services/storageService";

interface CriteriaBuilderProps {
  techRequest: TechRequest;
  onComplete: (criteria: Criteria[]) => void;
  initialCriteria?: Criteria[];
}

const CriteriaBuilder = ({ techRequest, onComplete, initialCriteria }: CriteriaBuilderProps) => {
  const [criteria, setCriteria] = useState<Criteria[]>(initialCriteria || []);
  const [newCriterion, setNewCriterion] = useState({
    name: '',
    importance: 'medium' as 'low' | 'medium' | 'high',
    type: 'feature' as string
  });
  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    const saved = storageService.getItem<string[]>('custom_criterion_types');
    return saved ?? [];
  });
  const [newCustomType, setNewCustomType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Use custom hooks for business logic
  const {
    isGenerating: isGeneratingCriteria,
    generateInitialCriteria,
    generateFallbackCriteria
  } = useCriteriaGeneration();

  const {
    chatMessages,
    isGenerating: isGeneratingChat,
    userMessage,
    setUserMessage,
    addMessage,
    sendMessage,
    initializeChat
  } = useCriteriaChat();

  // Combined loading state for UI
  const isGenerating = isGeneratingCriteria || isGeneratingChat;

  // Initialize with AI greeting and generate initial criteria
  useEffect(() => {
    const initialMessage = {
      id: '1',
      role: 'assistant' as const,
      content: `Hello! I'm analyzing your request for ${techRequest.category} solutions and generating 20 focused criteria to help evaluate vendors. I'll explain why each criterion is important for your specific needs...`,
      timestamp: new Date()
    };
    initializeChat(initialMessage);

    // Only generate initial criteria if no initial criteria were provided
    if (!initialCriteria || initialCriteria.length === 0) {
      generateInitialCriteria(techRequest).then(({ criteria: generatedCriteria, message }) => {
        setCriteria(generatedCriteria);
        addMessage(message);
      });
    }
  }, [techRequest, initialCriteria]);

  /**
   * Sync local criteria state when initialCriteria changes
   * This handles navigation back to completed steps
   * Ensures saved criteria are displayed when returning to this stage
   */
  useEffect(() => {
    if (initialCriteria && initialCriteria.length > 0) {
      setCriteria(initialCriteria);
    }
  }, [initialCriteria]);

  // Handle chat message send
  const handleSendMessage = async () => {
    await sendMessage(userMessage, {
      category: techRequest.category,
      criteria
    });
  };

  const addCustomType = () => {
    if (!newCustomType.trim()) {
      toast({
        title: "Missing type name",
        description: "Please enter a name for the custom type.",
        variant: "destructive"
      });
      return;
    }

    const allTypes = ['feature', 'technical', 'business', 'compliance', ...customTypes];
    if (allTypes.includes(newCustomType.toLowerCase())) {
      toast({
        title: "Type already exists",
        description: "This criterion type already exists.",
        variant: "destructive"
      });
      return;
    }

    const updatedCustomTypes = [...customTypes, newCustomType];
    setCustomTypes(updatedCustomTypes);
    storageService.setItem('custom_criterion_types', updatedCustomTypes);
    setNewCustomType('');

    toast({
      title: "Custom type created",
      description: `"${newCustomType}" has been added as a custom criterion type.`
    });
  };

  const removeCustomType = (typeToRemove: string) => {
    const updatedCustomTypes = customTypes.filter(type => type !== typeToRemove);
    setCustomTypes(updatedCustomTypes);
    storageService.setItem('custom_criterion_types', updatedCustomTypes);

    // Update any criteria using this type to 'feature'
    setCriteria(prev => prev.map(c => 
      c.type === typeToRemove ? { ...c, type: 'feature' } : c
    ));
    
    toast({
      title: "Custom type removed",
      description: `"${typeToRemove}" has been removed. Criteria using this type have been updated to "feature".`
    });
  };

  const addCriterion = () => {
    if (!newCriterion.name.trim()) {
      toast({
        title: "Missing criterion name",
        description: "Please enter a name for the criterion.",
        variant: "destructive"
      });
      return;
    }

    const criterion: Criteria = {
      id: Date.now().toString(),
      ...newCriterion
    };

    setCriteria(prev => [...prev, criterion]);
    setNewCriterion({ name: '', importance: 'medium', type: 'feature' });
    
    toast({
      title: "Criterion added",
      description: `"${criterion.name}" has been added to your evaluation criteria.`
    });
  };

  const removeCriterion = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<Criteria>) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Parse criteria from Excel
        const uploadedCriteria: Criteria[] = [];
        jsonData.forEach((row: any, index: number) => {
          const name = row['Criterion'] || row['Name'] || row['criterion'] || row['name'];
          const importance = (row['Importance'] || row['importance'] || 'medium').toLowerCase();
          const type = (row['Type'] || row['type'] || 'feature').toLowerCase();

          if (name) {
            uploadedCriteria.push({
              id: `uploaded-${index}`,
              name: String(name),
              importance: ['low', 'medium', 'high'].includes(importance) ? importance as 'low' | 'medium' | 'high' : 'medium',
              type: ['feature', 'technical', 'business', 'compliance'].includes(type) ? type as 'feature' | 'technical' | 'business' | 'compliance' : 'feature'
            });
          }
        });

        if (uploadedCriteria.length > 0) {
          setCriteria(prev => [...prev, ...uploadedCriteria]);
          toast({
            title: "Criteria uploaded",
            description: `Successfully imported ${uploadedCriteria.length} criteria from your Excel file.`
          });
        } else {
          toast({
            title: "No criteria found",
            description: "Please ensure your Excel file has columns named 'Criterion', 'Importance', and 'Type'.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to parse the Excel file. Please check the format.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
        // Reset the input
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleComplete = () => {
    if (criteria.length === 0) {
      toast({
        title: "No criteria defined",
        description: "Please add at least one evaluation criterion.",
        variant: "destructive"
      });
      return;
    }

    onComplete(criteria);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-primary';
      case 'technical': return 'bg-accent';
      case 'business': return 'bg-success';
      case 'compliance': return 'bg-warning';
      default: return customTypes.includes(type) ? 'bg-purple-500 text-white' : 'bg-secondary';
    }
  };

  const getAllTypes = () => {
    return ['feature', 'technical', 'business', 'compliance', ...customTypes];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Chat Assistant */}
      <Card className="h-fit lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Criteria Assistant
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 w-full pr-4">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-primary' : 'bg-accent'}`}>
                      {message.role === 'user' ? (
                        <User className="h-3 w-3 text-primary-foreground" />
                      ) : (
                        <Bot className="h-3 w-3 text-accent-foreground" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-2">
                  <div className="p-2 rounded-full bg-accent">
                    <Bot className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about criteria or request suggestions..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={isGenerating} size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Management */}
      <div className="space-y-6 lg:col-span-2">
        {/* AI-Generated Summary */}
        {techRequest && (
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardContent className="pt-6">
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your description, you need a <span className="font-semibold text-primary">{techRequest.category}</span> solution
                    {techRequest.description && (
                      <> that {techRequest.description.toLowerCase()}</>
                    )}
                    {techRequest.companyInfo && (
                      <>. {techRequest.companyInfo}</>
                    )}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label className="text-base font-semibold">Would you like to add anything?</Label>
                <Textarea
                  placeholder="Any additional context, requirements, or specific challenges..."
                  className="min-h-[80px] resize-none"
                  disabled={isGenerating}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Criteria - Excel-like Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Evaluation Criteria ({criteria.length})
              <Badge variant="secondary">{criteria.filter(c => c.importance === 'high').length} High Priority</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="feature" className="w-full">
              <ScrollArea className="w-full">
                <TabsList className={`grid w-full ${getAllTypes().length <= 4 ? 'grid-cols-4' : 'grid-cols-6'} gap-1`}>
                  <TabsTrigger value="feature" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary text-primary-foreground">Feature</Badge>
                    ({criteria.filter(c => c.type === 'feature').length})
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-accent text-accent-foreground">Technical</Badge>
                    ({criteria.filter(c => c.type === 'technical').length})
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-success text-success-foreground">Business</Badge>
                    ({criteria.filter(c => c.type === 'business').length})
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-warning text-warning-foreground">Compliance</Badge>
                    ({criteria.filter(c => c.type === 'compliance').length})
                  </TabsTrigger>
                  {customTypes.map((type) => (
                    <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-500 text-white">{type}</Badge>
                      ({criteria.filter(c => c.type === type).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {getAllTypes().map((type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="border rounded-lg">
                    {criteria.length > 20 ? (
                      <ScrollArea className="h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Criterion Name</TableHead>
                              <TableHead className="w-[20%]">Importance</TableHead>
                              <TableHead className="w-[20%]">Type</TableHead>
                              <TableHead className="w-[20%]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.filter(c => c.type === type).map((criterion) => (
                              <TableRow key={criterion.id}>
                                <TableCell>
                                   <Textarea
                                     value={criterion.name}
                                     onChange={(e) => {
                                       updateCriterion(criterion.id, { name: e.target.value });
                                       // Auto-resize the textarea
                                       e.target.style.height = 'auto';
                                       e.target.style.height = e.target.scrollHeight + 'px';
                                     }}
                                     className="border-0 bg-transparent p-0 min-h-0 font-medium focus-visible:ring-0 resize-none overflow-hidden"
                                     style={{ height: 'auto' }}
                                     onInput={(e) => {
                                       const target = e.target as HTMLTextAreaElement;
                                       target.style.height = 'auto';
                                       target.style.height = target.scrollHeight + 'px';
                                     }}
                                   />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={criterion.importance}
                                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                                      updateCriterion(criterion.id, { importance: value })
                                    }
                                  >
                                    <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={criterion.type}
                                    onValueChange={(value: string) => 
                                      updateCriterion(criterion.id, { type: value })
                                    }
                                  >
                                    <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0">
                                      <SelectValue>
                                        <Badge variant="outline" className={getTypeColor(criterion.type)}>
                                          {criterion.type}
                                        </Badge>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="feature">Feature</SelectItem>
                                      <SelectItem value="technical">Technical</SelectItem>
                                      <SelectItem value="business">Business</SelectItem>
                                      <SelectItem value="compliance">Compliance</SelectItem>
                                      {customTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCriterion(criterion.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {criteria.filter(c => c.type === type).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                  No {type} criteria defined yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Criterion Name</TableHead>
                            <TableHead className="w-[20%]">Importance</TableHead>
                            <TableHead className="w-[20%]">Type</TableHead>
                            <TableHead className="w-[20%]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {criteria.filter(c => c.type === type).map((criterion) => (
                            <TableRow key={criterion.id}>
                              <TableCell>
                                 <Textarea
                                   value={criterion.name}
                                   onChange={(e) => {
                                     updateCriterion(criterion.id, { name: e.target.value });
                                     // Auto-resize the textarea
                                     e.target.style.height = 'auto';
                                     e.target.style.height = e.target.scrollHeight + 'px';
                                   }}
                                   className="border-0 bg-transparent p-0 min-h-0 font-medium focus-visible:ring-0 resize-none overflow-hidden"
                                   style={{ height: 'auto' }}
                                   onInput={(e) => {
                                     const target = e.target as HTMLTextAreaElement;
                                     target.style.height = 'auto';
                                     target.style.height = target.scrollHeight + 'px';
                                   }}
                                 />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={criterion.importance}
                                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                                    updateCriterion(criterion.id, { importance: value })
                                  }
                                >
                                  <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={criterion.type}
                                  onValueChange={(value: string) => 
                                    updateCriterion(criterion.id, { type: value })
                                  }
                                >
                                  <SelectTrigger className="h-8 border-0 bg-transparent focus:ring-0">
                                    <SelectValue>
                                      <Badge variant="outline" className={getTypeColor(criterion.type)}>
                                        {criterion.type}
                                      </Badge>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="feature">Feature</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                    {customTypes.map((type) => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCriterion(criterion.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {criteria.filter(c => c.type === type).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                No {type} criteria defined yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Upload Excel File */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Criteria from Excel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="excel-upload" className="cursor-pointer">
                  <div className="text-sm font-medium mb-1">
                    Upload Excel Spreadsheet
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expected columns: Criterion, Importance, Type
                  </div>
                </Label>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
              {isUploading && (
                <div className="text-center text-sm text-muted-foreground">
                  Processing Excel file...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manage Custom Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Custom Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Security, Performance, UX"
                value={newCustomType}
                onChange={(e) => setNewCustomType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomType()}
              />
              <Button onClick={addCustomType} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </div>
            {customTypes.length > 0 && (
              <div className="space-y-2">
                <Label>Custom Types</Label>
                <div className="flex flex-wrap gap-2">
                  {customTypes.map((type) => (
                    <div key={type} className="flex items-center gap-1">
                      <Badge className="bg-purple-500 text-white">{type}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomType(type)}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Criterion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Criterion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-criterion">Criterion Name</Label>
              <Input
                id="new-criterion"
                placeholder="e.g., Mobile App Quality, API Documentation"
                value={newCriterion.name}
                onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Importance</Label>
                <Select
                  value={newCriterion.importance}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewCriterion({ ...newCriterion, importance: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newCriterion.type}
                  onValueChange={(value: string) => 
                    setNewCriterion({ ...newCriterion, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    {customTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addCriterion} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleComplete}
            variant="professional"
            size="lg"
            className="gap-2"
            disabled={criteria.length === 0}
          >
            Find Vendors
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CriteriaBuilder;