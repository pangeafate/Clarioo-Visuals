# Type Definitions and Interfaces Review

## Summary
The codebase contains **82 type/interface definitions** across multiple files. There are significant opportunities for consolidation and centralization to improve maintainability and reduce duplication.

---

## Key Findings

### 1. CRITICAL: Duplicate Type Definitions

#### Problem: `Project` Interface Defined in Multiple Locations

**File 1: `/src/components/ProjectDashboard.tsx` (Lines 14-21)**
```typescript
interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}
```

**File 2: `/src/components/VendorDiscovery.tsx` (Lines 43-50)**
```typescript
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}
```

**File 3: `/src/services/mock/projectService.ts` (Lines 28-38)**
```typescript
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  workflow_state: WorkflowState;
  created_at: string;
  updated_at: string;
}
```

**Issues:**
- Three separate `Project` interfaces with slightly different shapes
- Status values inconsistent: `'in-progress'` vs `'in_progress'`
- `null` handling differs in description field
- Service has extra fields (`user_id`, `category`, `workflow_state`)
- Components need to map between different Project shapes

---

#### Problem: `Vendor` Interface Defined in Two Locations

**File 1: `/src/components/VendorDiscovery.tsx` (Lines 31-41)**
```typescript
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
```

**File 2: `/src/services/mock/aiService.ts` (Lines 26-37)**
```typescript
export interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  logo_url: string;
  match_score: number;
  pricing: string;
  pros: string[];
  cons: string[];
}
```

**Issues:**
- Different field names: `rating` vs `match_score`
- Different fields: `criteriaScores`/`criteriaAnswers` vs `logo_url`
- `features` vs `pros`/`cons`
- Component and service have mismatched schemas

---

#### Problem: `Criterion` Interface Misalignment

**File 1: `/src/components/VendorDiscovery.tsx` (Lines 24-29)**
```typescript
export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}
```

**File 2: `/src/services/mock/aiService.ts` (Lines 19-24)**
```typescript
export interface Criterion {
  id: string;
  name: string;
  importance: 'high' | 'medium' | 'low';
  type: 'feature' | 'technical' | 'business' | 'compliance';
}
```

**Issues:**
- Naming inconsistency: `Criteria` (plural) vs `Criterion` (singular)
- Different type constraints: string vs union type
- Order of importance values differs

---

### 2. Missing Central Types Directory

**Current Status:** No `/src/types/` directory exists

**Impact:**
- No single source of truth for domain models
- Types scattered across services, components, and pages
- Difficult to maintain consistency across the codebase
- Makes refactoring error-prone

---

### 3. Inconsistent Typing Patterns

#### Pattern 1: Component Props Scattered
Types are defined inline in components:
- `/src/components/VendorDiscovery.tsx`: `VendorDiscoveryProps`
- `/src/components/ProjectDashboard.tsx`: `ProjectDashboardProps`
- `/src/components/vendor-discovery/VendorTable.tsx`: `VendorTableProps`
- `/src/components/vendor-discovery/VendorSelection.tsx`: `VendorSelectionProps`
- `/src/components/vendor-discovery/VendorInvite.tsx`: `VendorInviteProps`

**Current Approach:** Defined in components using `interface ComponentProps`

**Better Approach:** Extract to `src/types/props.ts` or `src/types/components.ts`

---

#### Pattern 2: Service Response Types
Inconsistent naming for service return types:

**`authService.ts`:**
```typescript
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}
```

**`projectService.ts`:**
```typescript
// Uses separate return objects per function
export const getProjects = async (userId: string): Promise<{ 
  data: Project[] | null; 
  error: ProjectError | null 
}> => {}
```

**`aiService.ts`:**
```typescript
export const generateCriteria = async (...): Promise<{ 
  data: Criterion[] | null; 
  error: AIError | null 
}> => {}
```

**Issues:**
- Inconsistent naming: `AuthResponse` vs inline object pattern
- Mix of named types and inline response shapes
- Makes it harder to standardize error handling

---

#### Pattern 3: Error Types
Error types defined per service:
- `/src/services/mock/authService.ts`: `AuthError`
- `/src/services/mock/projectService.ts`: `ProjectError`
- `/src/services/mock/aiService.ts`: `AIError`

**Issues:**
- Same structure repeated 3 times
- No shared error interface
- Makes error handling inconsistent across services

---

### 4. Imported Type Inconsistencies

**File: `/src/components/vendor-discovery/VendorTable.tsx` (Line 20)**
```typescript
import type { TechRequest, Criteria, Vendor } from "../VendorDiscovery";
```

**File: `/src/components/vendor-discovery/DataService.tsx` (Line 15)**
```typescript
import type { Vendor, Criterion, VendorComparison } from './aiService';
```

**Issues:**
- Types imported from components instead of service layer
- Same type (`Vendor`) imported from different sources depending on file
- Creates tangled dependency graph

---

### 5. Type-Only Imports

**Status:** Properly using `import type` for type-only imports throughout the codebase ✓

Good examples:
- `src/hooks/useAuth.tsx` (Line 8): `import type { User, Session } from '@/services/mock/authService';`
- `src/components/vendor-discovery/VendorTable.tsx` (Line 20): `import type { TechRequest, Criteria, Vendor } from "../VendorDiscovery";`

---

## Detailed Inventory of All Types

### Component Types (31 definitions)
- `VendorDiscoveryProps` - /src/components/VendorDiscovery.tsx
- `ProjectDashboardProps` - /src/components/ProjectDashboard.tsx
- `VendorTableProps` - /src/components/vendor-discovery/VendorTable.tsx
- `VendorSelectionProps` - /src/components/vendor-discovery/VendorSelection.tsx
- `VendorInviteProps` - /src/components/vendor-discovery/VendorInvite.tsx
- `BadgeProps` - /src/components/ui/badge.tsx
- `ButtonProps` - /src/components/ui/button.tsx
- `TextareaProps` - /src/components/ui/textarea.tsx
- `ChartConfig` - /src/components/ui/chart.tsx
- `CalendarProps` - /src/components/ui/calendar.tsx
- (Plus 21 more UI component prop types)

### Domain Model Types (18 definitions)
**Vendor Models:**
- `Vendor` (Component version) - /src/components/VendorDiscovery.tsx
- `Vendor` (Service version) - /src/services/mock/aiService.ts

**Project Models:**
- `Project` (Component version) - /src/components/ProjectDashboard.tsx
- `Project` (Component version 2) - /src/components/VendorDiscovery.tsx
- `Project` (Service version) - /src/services/mock/projectService.ts

**Criteria Models:**
- `Criteria` - /src/components/VendorDiscovery.tsx
- `Criterion` - /src/services/mock/aiService.ts

**Other Domain Types:**
- `TechRequest` - /src/components/VendorDiscovery.tsx
- `Step` (union type) - /src/components/VendorDiscovery.tsx
- `User` - /src/services/mock/authService.ts
- `Session` - /src/services/mock/authService.ts
- `VendorComparison` - /src/services/mock/aiService.ts
- `ChatMessage` - /src/services/mock/aiService.ts
- `WorkflowState` - /src/services/mock/projectService.ts
- `WorkflowStepData` - /src/services/mock/projectService.ts

### Error Types (3 definitions)
- `AuthError` - /src/services/mock/authService.ts
- `ProjectError` - /src/services/mock/projectService.ts
- `AIError` - /src/services/mock/aiService.ts

### Data Service Types (3 definitions)
- `EmailTemplate` - /src/services/mock/dataService.ts
- `EmailVariables` - /src/services/mock/dataService.ts
- `ExportOptions` - /src/services/mock/dataService.ts

### Context/Hook Types (1 definition)
- `AuthContextType` - /src/hooks/useAuth.tsx

---

## Recommendations

### Priority 1: Create `/src/types/` Directory Structure

Create the following files:

#### `/src/types/index.ts` (Main exports)
```typescript
export * from './domain';
export * from './components';
export * from './services';
export * from './errors';
```

#### `/src/types/domain.ts` (Domain models)
```typescript
// Core domain models
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  workflow_state: WorkflowState;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  logo_url: string;
  match_score: number;
  pricing: string;
  pros: string[];
  cons: string[];
  // Component-specific fields (consider separating)
  rating?: number;
  criteriaScores?: Record<string, number>;
  criteriaAnswers?: Record<string, { yesNo: 'yes' | 'no' | 'partial'; comment: string; }>;
  features?: string[];
}

export interface Criterion {
  id: string;
  name: string;
  importance: 'high' | 'medium' | 'low';
  type: 'feature' | 'technical' | 'business' | 'compliance';
}

export interface VendorComparison {
  vendor_id: string;
  vendor_name: string;
  strengths: string[];
  weaknesses: string[];
  overall_score: number;
  recommendation: string;
}

export interface WorkflowState {
  current_step: number;
  completed_steps: number[];
  [key: string]: any;
}

export interface WorkflowStepData {
  [key: string]: any;
}

export interface TechRequest {
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  budget: string;
  companyInfo?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

#### `/src/types/services.ts` (Service types)
```typescript
import type { User, Project, Vendor, Criterion, VendorComparison } from './domain';
import type { ServiceError } from './errors';

// Generic service response wrapper
export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
}

// Auth service
export interface AuthResponse extends ServiceResponse<{ user: User; session: Session }> {}

// Project service - specific responses
export interface ProjectListResponse extends ServiceResponse<Project[]> {}
export interface ProjectResponse extends ServiceResponse<Project> {}

// AI service - specific responses
export interface CriteriaResponse extends ServiceResponse<Criterion[]> {}
export interface VendorResponse extends ServiceResponse<Vendor[]> {}
export interface ComparisonResponse extends ServiceResponse<VendorComparison[]> {}
export interface ChatResponse extends ServiceResponse<string> {}

// Data service
export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailVariables {
  [key: string]: string | number | string[];
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
}
```

#### `/src/types/components.ts` (Component props)
```typescript
import type { Project, Vendor, Criterion, TechRequest } from './domain';

export interface VendorDiscoveryProps {
  project: Project;
  onBackToProjects: () => void;
}

export interface ProjectDashboardProps {
  onSelectProject: (project: Project) => void;
}

export interface VendorTableProps {
  vendors: Vendor[];
  criteria: Criterion[];
  techRequest: TechRequest;
  onVendorsGenerated: (vendors: Vendor[]) => void;
  onComplete?: () => void;
}

export interface VendorSelectionProps {
  criteria: Criterion[];
  techRequest: TechRequest;
  onComplete: (vendors: Vendor[]) => void;
}

export interface VendorInviteProps {
  vendors: Vendor[];
  criteria: Criterion[];
  techRequest: TechRequest;
  projectName: string;
}
```

#### `/src/types/errors.ts` (Error types)
```typescript
export interface ServiceError {
  message: string;
  code?: string;
  status?: number;
}
```

---

### Priority 2: Update Imports Across Codebase

**Before:**
```typescript
// In components/ProjectDashboard.tsx
interface Project {
  id: string;
  name: string;
  // ...
}
```

**After:**
```typescript
// In components/ProjectDashboard.tsx
import type { Project, ProjectDashboardProps } from '@/types';
```

---

### Priority 3: Standardize Component Internal State Types

Some components use inline types for internal state. Consider:

**Option A: Keep inline for simple component-specific state**
```typescript
const [newVendor, setNewVendor] = useState({
  name: '',
  description: '',
  website: '',
  pricing: '',
  rating: 4.0
});
```

**Option B: Extract to types file if reused**
```typescript
// /src/types/forms.ts
export interface NewVendorForm {
  name: string;
  description: string;
  website: string;
  pricing: string;
  rating: number;
}
```

---

### Priority 4: Fix Inconsistent Status Values

**Current inconsistency:**
- Components use: `'draft' | 'in-progress' | 'completed' | 'archived'`
- Service uses: `'draft' | 'in_progress' | 'completed' | 'archived'`

**Standardize to snake_case** (matches database convention):
```typescript
type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
```

---

### Priority 5: Separate Component-Specific Extensions

The `Vendor` interface has different fields depending on context. Consider:

```typescript
// /src/types/domain.ts
export interface Vendor {
  // Core fields
  id: string;
  name: string;
  description: string;
  category: string;
  website: string;
  logo_url: string;
  match_score: number;
  pricing: string;
  pros: string[];
  cons: string[];
}

// /src/types/components.ts
export interface VendorWithScores extends Vendor {
  // Component-specific fields
  rating: number;
  criteriaScores: Record<string, number>;
  criteriaAnswers: Record<string, { yesNo: 'yes' | 'no' | 'partial'; comment: string; }>;
  features: string[];
}
```

---

## Testing Checklist

- [ ] Create `/src/types/` directory with all recommended files
- [ ] Update all imports to use `@/types`
- [ ] Run TypeScript compiler to verify no type errors: `npm run build`
- [ ] Test component rendering with new types
- [ ] Verify service responses match type definitions
- [ ] Update all components to import from `@/types`
- [ ] Remove duplicate type definitions from components
- [ ] Test authentication flow
- [ ] Test project creation/loading
- [ ] Test vendor discovery workflow

---

## File Locations Summary

**Type Definitions Spread Across:**
- `/src/components/` (10+ files)
- `/src/services/mock/` (4 files)
- `/src/hooks/` (1 file)
- `/src/components/ui/` (multiple files)

**Recommended Consolidation:**
- `/src/types/index.ts` - Central export
- `/src/types/domain.ts` - Business models
- `/src/types/components.ts` - Component props
- `/src/types/services.ts` - Service response types
- `/src/types/errors.ts` - Error types
- `/src/types/forms.ts` - Form/input types (optional)

---

## Conclusion

The codebase has **good TypeScript fundamentals** with proper use of `import type`, but suffers from:
1. Duplicate type definitions (3 `Project` interfaces, 2 `Vendor` interfaces)
2. Missing centralized types directory
3. Inconsistent naming patterns (Criteria vs Criterion)
4. Scattered component prop types
5. Inconsistent service response patterns

Implementing these recommendations will significantly improve code maintainability and reduce the risk of type-related bugs during refactoring.

