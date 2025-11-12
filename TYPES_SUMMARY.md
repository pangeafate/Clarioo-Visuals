# Type Definitions - Quick Reference Summary

## Current State: 82 Type Definitions Across 20+ Files

```
PROBLEM AREAS (High Priority):
├── Duplicate Definitions
│   ├── Project Interface (3 locations)
│   ├── Vendor Interface (2 locations)
│   └── Criterion/Criteria (naming + definition mismatch)
├── No Central Types Directory
│   └── Types scattered: components, services, hooks, ui
├── Inconsistent Naming
│   ├── Status values: 'in-progress' vs 'in_progress'
│   ├── Names: Criteria vs Criterion
│   └── Fields: rating vs match_score, features vs pros/cons
├── Dependency Tangling
│   └── Components import types from other components
└── Service Response Inconsistency
    └── Mixed patterns: AuthResponse vs inline objects
```

---

## Type Distribution

```
Component Props (31)
├── VendorDiscoveryProps
├── ProjectDashboardProps
├── VendorTableProps
├── VendorSelectionProps
├── VendorInviteProps
├── ProtectedRouteProps
└── UI component props (24+)

Domain Models (18)
├── User
├── Project (3 versions)
├── Vendor (2 versions)
├── Criterion/Criteria
├── VendorComparison
├── TechRequest
├── Step
├── Session
├── ChatMessage
├── WorkflowState
└── WorkflowStepData

Services (10)
├── AuthResponse
├── AuthError
├── ProjectError
├── AIError
├── EmailTemplate
├── EmailVariables
├── ExportOptions
└── Service-specific response types

Utilities (23)
└── Various UI component types
```

---

## DUPLICATE TYPES - CRITICAL

### 1. Project Interface - 3 LOCATIONS

| File | Fields | Status Values |
|------|--------|---------------|
| ProjectDashboard.tsx | 6 basic fields | 'in-progress' |
| VendorDiscovery.tsx | 6 basic fields | 'in-progress' |
| projectService.ts | 10 fields (includes workflow) | 'in_progress' |

**Root Cause:** No centralized types → duplicated definitions

---

### 2. Vendor Interface - 2 LOCATIONS

| Field | Component Version | Service Version |
|-------|-------------------|-----------------|
| Core Fields | name, description, website, pricing | name, description, website, pricing |
| Scoring | rating, criteriaScores, criteriaAnswers | match_score |
| Details | features | pros[], cons[], logo_url, category |

**Root Cause:** Different requirements (UI vs business logic)

---

### 3. Criterion/Criteria - NAMING + DEFINITION

| Aspect | Component | Service |
|--------|-----------|---------|
| Name | Criteria (plural) | Criterion (singular) |
| Type Field | string | 'feature' \| 'technical' \| 'business' \| 'compliance' |
| Importance | 'low' \| 'medium' \| 'high' | 'high' \| 'medium' \| 'low' |

**Root Cause:** Developed independently without schema agreement

---

## CURRENT IMPORT PATTERNS

### Pattern 1: Component Self-Import
```typescript
// VendorTable.tsx imports from VendorDiscovery.tsx
import type { TechRequest, Criteria, Vendor } from "../VendorDiscovery";
```
Issue: Types defined in components instead of service layer

---

### Pattern 2: Service Import (Correct)
```typescript
// useAuth.tsx correctly imports from service
import type { User, Session } from '@/services/mock/authService';
```
Best practice but inconsistent across codebase

---

### Pattern 3: Mixed Sources
```typescript
// Different files import same Vendor type from different places
File A: import type { Vendor } from '../VendorDiscovery';
File B: import type { Vendor } from '@/services/mock/aiService';
```
Same type name, different structures = confusion and bugs

---

## RECOMMENDED STRUCTURE

```
/src/types/
├── index.ts              (Central export)
├── domain.ts             (User, Project, Vendor, Criterion, Session...)
├── components.ts         (Component Props interfaces)
├── services.ts           (Service Response types)
├── errors.ts             (Unified error handling)
├── forms.ts              (Optional: Form state types)
└── constants.ts          (Type union exports)
```

---

## RISK ANALYSIS

### High Risk Issues
1. **Three Project interfaces** - Easy to pass wrong shape between layers
2. **Two Vendor interfaces** - Type confusion in vendor comparison logic
3. **Status inconsistency** - 'in-progress' vs 'in_progress' causes mapping bugs
4. **No single source of truth** - Refactoring breaks multiple copies

### Medium Risk Issues
1. Component-to-component imports of types
2. Inconsistent error handling across services
3. Missing type validation on service responses

### Low Risk Issues
1. UI component types are well-isolated
2. Type-only imports properly used
3. No circular dependency issues currently

---

## AFFECTED COMPONENTS

### High Impact (Use Multiple Type Versions)
- VendorTable.tsx - Uses Vendor, Criteria, TechRequest
- VendorDiscovery.tsx - Defines and uses Project, Vendor, Criteria
- ProjectDashboard.tsx - Uses Project from service and defines locally

### Medium Impact (Use Duplicated Types)
- ProjectDashboard.tsx
- VendorSelection.tsx
- ExecutiveSummary.tsx

### Integration Points (Most Vulnerable)
- Between services and components
- ProjectDashboard → VendorDiscovery → VendorTable chain
- Auth flow: hooks → services → components

---

## IMMEDIATE ACTIONS

```
PHASE 1 (Today)
✓ Create /src/types/ directory structure
✓ Define domain.ts with canonical types
✓ Define services.ts with response types
✓ Define components.ts with all prop types

PHASE 2 (Next Sprint)
- Update imports in all 20+ files
- Remove duplicate definitions
- Run type checking: npm run build
- Test all workflows

PHASE 3 (Following Sprint)
- Update tests for new structure
- Document type usage patterns
- Create contributor guidelines
```

---

## Key Files to Update

### Must Update (Duplicated Types)
1. `/src/components/ProjectDashboard.tsx` - Remove Project definition
2. `/src/components/VendorDiscovery.tsx` - Remove Project, Vendor, Criteria
3. `/src/services/mock/projectService.ts` - Export from /types
4. `/src/services/mock/aiService.ts` - Align Vendor definition

### Should Update (Component Props)
1. `/src/components/vendor-discovery/VendorTable.tsx`
2. `/src/components/vendor-discovery/VendorSelection.tsx`
3. `/src/components/vendor-discovery/VendorInvite.tsx`
4. `/src/components/ProjectDashboard.tsx`
5. `/src/components/VendorDiscovery.tsx`

### Export Updates Needed
1. `/src/services/mock/authService.ts`
2. `/src/services/mock/projectService.ts`
3. `/src/services/mock/aiService.ts`
4. `/src/services/mock/dataService.ts`

---

## Success Metrics

Before consolidation:
- 82 type definitions across 20+ files
- 3 duplicate Project types
- 2 duplicate Vendor types
- 5+ different import patterns

After consolidation:
- ~40 type definitions in 5 files
- 0 duplicate types
- 100% imports from @/types
- 1 consistent import pattern

---

## References

See `TYPE_DEFINITIONS_REVIEW.md` for:
- Complete inventory of all 82 types
- Detailed code examples
- Full file paths and line numbers
- Recommended implementations
- Testing checklist

