# Detailed Component Issues with Code Examples

## 1. CriteriaBuilder.tsx (872 lines) - CRITICAL

### Issue 1: Duplicate Table Rendering Logic (Lines 509-699)

The component renders the same table twice with nearly identical code:
- Scrollable table (lines 509-605): with `<ScrollArea>`
- Non-scrollable table (lines 605-699): without `<ScrollArea>`

**Code Duplication:**
```typescript
// Lines 509-604 - Scrollable version
{criteria.length > 20 ? (
  <ScrollArea className="h-96">
    <Table>
      <TableHeader>
        <TableRow>
          {/* identical column headers */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {criteria.filter(c => c.type === type).map((criterion) => (
          <TableRow key={criterion.id}>
            {/* identical row rendering - 70+ lines */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </ScrollArea>
) : (
  // Lines 605-699 - Non-scrollable version - EXACT DUPLICATE minus ScrollArea wrapper
  <Table>
    <TableHeader>
      <TableRow>
        {/* SAME column headers */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {criteria.filter(c => c.type === type).map((criterion) => (
        <TableRow key={criterion.id}>
          {/* SAME row rendering - 70+ lines */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}
```

**Fix:** Extract to `CriteriaTable.tsx` component that handles both cases internally.

---

### Issue 2: Multiple Unrelated State Objects

```typescript
// Lines 37-52
const [criteria, setCriteria] = useState<Criteria[]>(initialCriteria || []);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
const [userMessage, setUserMessage] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
const [newCriterion, setNewCriterion] = useState({
  name: '',
  importance: 'medium' as 'low' | 'medium' | 'high',
  type: 'feature' as string
});
const [customTypes, setCustomTypes] = useState<string[]>(() => {
  const saved = localStorage.getItem('custom_criterion_types');
  return saved ? JSON.parse(saved) : [];
});
const [newCustomType, setNewCustomType] = useState('');
const [isUploading, setIsUploading] = useState(false);
```

**Problems:**
- 9 separate useState calls for different concerns
- Mixing chat state with criteria state
- localStorage sync logic in useState callback
- Form input state mixed with domain state

**Fix:** Create `useCriteriaState.ts` hook:
```typescript
// useCriteriaState.ts
export function useCriteriaState(initialCriteria?: Criteria[]) {
  // All criteria-related state
  const [criteria, setCriteria] = useState<Criteria[]>(initialCriteria || []);
  const [newCriterion, setNewCriterion] = useState({...});
  const [customTypes, setCustomTypes] = useState(() => {
    const saved = localStorage.getItem('custom_criterion_types');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Return object with organized state
  return {
    criteria,
    newCriterion,
    customTypes,
    // methods
  };
}
```

---

### Issue 3: Business Logic in Component (Excel Processing)

**Lines 295-363:** File upload and Excel parsing mixed in component:

```typescript
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
      // ... rest of logic
    }
  };

  reader.readAsArrayBuffer(file);
};
```

**Should be:** Service in `/src/services/excel/criteriaImporter.ts`:
```typescript
// services/excel/criteriaImporter.ts
export async function importCriteriaFromExcel(file: File): Promise<{
  criteria: Criteria[];
  error?: string;
}> {
  try {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return { criteria: [], error: 'Invalid file format' };
    }

    const data = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(data, { type: 'array' });
    // ... parsing logic
    
    return { criteria: uploadedCriteria };
  } catch (error) {
    return { criteria: [], error: 'Failed to parse Excel file' };
  }
}
```

Then in component:
```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setIsUploading(true);
  const { criteria, error } = await importCriteriaFromExcel(file);
  
  if (error) {
    toast({ title: "Upload failed", description: error, variant: "destructive" });
  } else {
    setCriteria(prev => [...prev, ...criteria]);
  }
  
  setIsUploading(false);
};
```

---

### Issue 4: Color Utility Functions Defined in Component

**Lines 378-395:** Styling logic in component body:

```typescript
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
```

**Should be:** `/src/utils/criteriaUtils.ts`:
```typescript
export const IMPORTANCE_COLORS = {
  high: 'bg-destructive',
  medium: 'bg-warning',
  low: 'bg-secondary'
} as const;

export const TYPE_COLORS = {
  feature: 'bg-primary',
  technical: 'bg-accent',
  business: 'bg-success',
  compliance: 'bg-warning'
} as const;

export function getImportanceColor(importance: 'low' | 'medium' | 'high'): string {
  return IMPORTANCE_COLORS[importance] || IMPORTANCE_COLORS.low;
}

export function getTypeColor(type: string, customTypes: string[] = []): string {
  return TYPE_COLORS[type as keyof typeof TYPE_COLORS] || 
    (customTypes.includes(type) ? 'bg-purple-500 text-white' : TYPE_COLORS.feature);
}
```

---

## 2. VendorTable.tsx (785 lines) - CRITICAL

### Issue 1: Duplicate Scoring Logic

This exact calculation appears in VendorTable.tsx and VendorInvite.tsx:

**VendorTable.tsx - Lines 184-192:**
```typescript
const calculateOverallScore = (vendor: Vendor) => {
  const scores = Object.entries(vendor.criteriaScores).map(([criterionId, score]) => {
    const criterion = criteria.find(c => c.id === criterionId);
    const weight = criterion?.importance === 'high' ? 3 : criterion?.importance === 'medium' ? 2 : 1;
    return score * weight;
  });
  const totalWeight = criteria.reduce((sum, c) => sum + (c.importance === 'high' ? 3 : c.importance === 'medium' ? 2 : 1), 0);
  return scores.reduce((sum, score) => sum + score, 0) / totalWeight;
};
```

**VendorInvite.tsx - Lines 64-77:** (Nearly identical)
```typescript
const calculateOverallScore = (vendor: Vendor): number => {
  const totalWeight = criteria.reduce((sum, criterion) => {
    const weight = criterion.importance === 'high' ? 3 : criterion.importance === 'medium' ? 2 : 1;
    return sum + weight;
  }, 0);

  const weightedSum = criteria.reduce((sum, criterion) => {
    const score = vendor.criteriaScores[criterion.id] || 0;
    const weight = criterion.importance === 'high' ? 3 : criterion.importance === 'medium' ? 2 : 1;
    return sum + (score * weight);
  }, 0);

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};
```

**Fix:** Create `/src/services/calculation/vendorScorer.ts`:
```typescript
export function calculateVendorScore(
  vendor: Vendor,
  criteria: Criteria[]
): number {
  const weights = getWeights(criteria);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  const weightedSum = criteria.reduce((sum, criterion, idx) => {
    const score = vendor.criteriaScores[criterion.id] || 0;
    return sum + (score * weights[idx]);
  }, 0);

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function getWeights(criteria: Criteria[]): number[] {
  return criteria.map(c => 
    c.importance === 'high' ? 3 : 
    c.importance === 'medium' ? 2 : 1
  );
}
```

---

### Issue 2: Mixed Export Logic

**Lines 235-335:** Excel AND CSV export in same function:

```typescript
const exportToExcel = () => {
  // Create main comparison data
  const comparisonData = filteredAndSortedVendors.map(vendor => {
    const row: any = {
      'Vendor Name': vendor.name,
      'Description': vendor.description,
      'Website': vendor.website,
      'Pricing': vendor.pricing,
      'Rating': vendor.rating,
      'Overall Score': calculateOverallScore(vendor).toFixed(2)
    };

    criteria.forEach(criterion => {
      row[criterion.name] = vendor.criteriaScores[criterion.id]?.toFixed(1) || 'N/A';
    });
    return row;
  });

  // Create detailed criteria sheet
  const criteriaData = criteria.map(criterion => ({...}));

  // Create vendor features sheet
  const featuresData = [];
  // ... feature extraction

  // Create detailed assessment sheet
  const assessmentData = [];
  // ... assessment extraction

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add comparison sheet
  const comparisonSheet = XLSX.utils.json_to_sheet(comparisonData);
  XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Vendor Comparison');

  // Add criteria sheet
  const criteriaSheet = XLSX.utils.json_to_sheet(criteriaData);
  XLSX.utils.book_append_sheet(workbook, criteriaSheet, 'Evaluation Criteria');

  // Add features sheet
  if (featuresData.length > 0) {
    const featuresSheet = XLSX.utils.json_to_sheet(featuresData);
    XLSX.utils.book_append_sheet(workbook, featuresSheet, 'Vendor Features');
  }

  // Add detailed assessment sheet
  if (assessmentData.length > 0) {
    const assessmentSheet = XLSX.utils.json_to_sheet(assessmentData);
    XLSX.utils.book_append_sheet(workbook, assessmentSheet, 'Detailed Assessment');
  }

  const filename = `vendor-comparison-${techRequest.category.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
  toast({...});
};

const exportResults = () => {
  const csvContent = [['Vendor', 'Rating', 'Overall Score', 'Pricing', 'Website', ...criteria.map(c => c.name)], 
    ...filteredAndSortedVendors.map(vendor => [
      vendor.name, 
      vendor.rating.toString(), 
      calculateOverallScore(vendor).toFixed(1), 
      vendor.pricing, 
      vendor.website, 
      ...criteria.map(c => vendor.criteriaScores[c.id]?.toFixed(1) || 'N/A')
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vendor-comparison-${techRequest.category.replace(/\s+/g, '-').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast({...});
};
```

**Should be:** `/src/services/export/vendorExporter.ts`:
```typescript
export async function exportVendorsToExcel(
  vendors: Vendor[],
  criteria: Criteria[],
  techRequest: TechRequest
): Promise<void> {
  // Excel-specific logic only
  const workbook = XLSX.utils.book_new();
  // ... sheets creation
  XLSX.writeFile(workbook, filename);
}

export async function exportVendorsToCSV(
  vendors: Vendor[],
  criteria: Criteria[],
  techRequest: TechRequest
): Promise<void> {
  // CSV-specific logic only
  const csvContent = buildCSVContent(vendors, criteria);
  downloadFile(csvContent, 'text/csv', filename);
}
```

---

### Issue 3: Complex Filter/Sort Logic Mixed with UI

**Lines 193-208:** Filtering and sorting in component body:

```typescript
const filteredAndSortedVendors = vendors.filter(vendor => {
  const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesRating = filterRating === 'all' || vendor.rating >= parseFloat(filterRating);
  return matchesSearch && matchesRating;
}).sort((a, b) => {
  switch (sortBy) {
    case 'rating':
      return b.rating - a.rating;
    case 'name':
      return a.name.localeCompare(b.name);
    case 'overall':
      return calculateOverallScore(b) - calculateOverallScore(a);
    default:
      return 0;
  }
});
```

**Should be:** `/src/hooks/useVendorFiltering.ts`:
```typescript
export function useVendorFiltering(
  vendors: Vendor[],
  criteria: Criteria[],
  searchTerm: string,
  filterRating: string,
  sortBy: 'rating' | 'name' | 'overall'
) {
  return useMemo(() => {
    return vendors
      .filter(v => matchesFilters(v, searchTerm, filterRating))
      .sort((a, b) => compareVendors(a, b, sortBy, criteria));
  }, [vendors, criteria, searchTerm, filterRating, sortBy]);
}
```

---

## 3. ProjectDashboard.tsx (341 lines) - MEDIUM

### Issue: Tightly Coupled CRUD + UI

**Lines 52-182:** CRUD operations mixed with UI logic:

```typescript
const fetchProjects = async () => {
  try {
    const { data, error } = await projectService.getProjects(user?.id);
    if (error) throw new Error(error.message);
    
    const mappedProjects: Project[] = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));

    mappedProjects.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    setProjects(mappedProjects);
  } catch (error) {
    toast({
      title: "Error fetching projects",
      description: "Could not load your projects. Please try again.",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};

const createProject = async () => {
  if (!newProject.name.trim()) return;
  try {
    const { data, error } = await projectService.createProject({
      user_id: user?.id || 'user_demo_12345',
      name: newProject.name,
      description: newProject.description || '',
      category: 'General',
      status: 'draft',
      workflow_state: {
        current_step: 1,
        completed_steps: []
      }
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No data returned');

    const newProjectData: Project = {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    setProjects([newProjectData, ...projects]);
    setNewProject({ name: '', description: '' });
    setShowCreateDialog(false);
    onSelectProject(newProjectData);

    toast({
      title: "Project created",
      description: "Your project has been created successfully."
    });
  } catch (error) {
    toast({
      title: "Error creating project",
      description: "Could not create the project. Please try again.",
      variant: "destructive"
    });
  }
};

const updateProject = async () => {
  if (!editingProject || !editedProject.name.trim()) return;
  try {
    const { data, error } = await projectService.updateProject(
      editingProject.id,
      {
        name: editedProject.name,
        description: editedProject.description || ''
      }
    );
    // ... similar pattern
  }
};
```

**Should be:** `/src/hooks/useProjectManager.ts`:
```typescript
export function useProjectManager(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await projectService.getProjects(userId);
      if (error) throw error;
      
      const mapped = mapProjects(data || []);
      setProjects(sorted(mapped));
    } catch (error) {
      throw error; // Let component handle toast
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createProject = useCallback(async (input: ProjectInput) => {
    const { data, error } = await projectService.createProject({
      user_id: userId || 'user_demo_12345',
      ...input,
      status: 'draft',
      workflow_state: { current_step: 1, completed_steps: [] }
    });
    
    if (error) throw error;
    const newProject = mapProject(data);
    setProjects(p => [newProject, ...p]);
    return newProject;
  }, [userId]);

  const updateProject = useCallback(async (id: string, input: Partial<ProjectInput>) => {
    const { data, error } = await projectService.updateProject(id, input);
    if (error) throw error;
    const updated = mapProject(data);
    setProjects(p => p.map(proj => proj.id === id ? updated : proj));
    return updated;
  }, []);

  return { projects, loading, fetchProjects, createProject, updateProject };
}
```

Then component becomes:
```typescript
const ProjectDashboard = ({ onSelectProject }: ProjectDashboardProps) => {
  const { user } = useAuth();
  const { projects, loading, fetchProjects, createProject, updateProject } = useProjectManager(user?.id);
  const { toast } = useToast();
  // ... only UI concerns

  const handleCreateProject = async () => {
    try {
      const newProject = await createProject(newProjectInput);
      onSelectProject(newProject);
      toast({ title: "Project created", description: "..." });
    } catch (error) {
      toast({ title: "Error", description: "...", variant: "destructive" });
    }
  };
};
```

---

## Summary of Refactoring Opportunities

| Component | Issues | Refactor Effort |
|-----------|--------|-----------------|
| CriteriaBuilder | Duplicate rendering, 9 state objects, business logic in component | High |
| VendorTable | Duplicate scoring, mixed export logic, complex filtering | High |
| VendorSelection | Mixed AI + UI, custom vendor logic | Medium |
| VendorInvite | Duplicate scoring, mixed concerns | Medium |
| ProjectDashboard | CRUD mixed with UI | Medium |
| VendorDiscovery | Good structure but could use better state management | Low |

**Total Refactoring Impact:**
- Estimated lines to extract: 1,800+
- New utility/service files needed: 15-20
- New component files needed: 10-15
- New custom hooks needed: 8-10
