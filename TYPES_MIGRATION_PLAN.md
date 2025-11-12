# Type Definitions Migration Plan

## Current State Diagram

```
CURRENT (Scattered & Duplicated):

src/components/
├── ProjectDashboard.tsx ──┐ defines Project (local)
├── VendorDiscovery.tsx ────├─ defines Project (export)
│                           ├─ defines Vendor (export)
│                           ├─ defines Criteria (export)
│                           └─ defines TechRequest (export)
└── vendor-discovery/
    ├── VendorTable.tsx ────┐ imports Vendor from VendorDiscovery
    ├── VendorSelection.tsx ├─ imports Criteria from VendorDiscovery
    ├── VendorInvite.tsx ───┤ imports TechRequest from VendorDiscovery
    └── ExecutiveSummary.tsx└─ imports from aiService

src/services/mock/
├── authService.ts ────────┐ defines User, Session
├── projectService.ts ──────├─ defines Project (different!)
├── aiService.ts ───────────├─ defines Vendor (different!)
│                            ├─ defines Criterion (not Criteria!)
│                            └─ defines VendorComparison
└── dataService.ts ────────┬─ defines EmailTemplate
                           └─ defines EmailVariables

src/hooks/
└── useAuth.tsx ────────────┐ defines AuthContextType
                            └─ imports User, Session from authService

PROBLEM: Same types defined in multiple places with different shapes!
```

---

## Target State Diagram

```
TARGET (Centralized & Unified):

src/types/
├── index.ts ──────────────────────────────┐
│   export * from './domain'               │
│   export * from './components'           │
│   export * from './services'             │
│   export * from './errors'               │
│   export * from './forms' (optional)     │
└──────────────────────────────────────────┘
       ▲
       │
       ├─ domain.ts ──────────┐ Single source of truth
       │  ├─ User             │ for all business entities
       │  ├─ Project          │
       │  ├─ Vendor           │
       │  ├─ Criterion        │
       │  ├─ VendorComparison │
       │  ├─ TechRequest      │
       │  ├─ Session          │
       │  ├─ ChatMessage      │
       │  ├─ WorkflowState    │
       │  └─ WorkflowStepData │
       │
       ├─ components.ts ──────┐ All component prop types
       │  ├─ VendorDiscoveryProps
       │  ├─ ProjectDashboardProps
       │  ├─ VendorTableProps
       │  ├─ VendorSelectionProps
       │  ├─ VendorInviteProps
       │  ├─ VendorWithScores (extended)
       │  └─ ExecutiveSummaryProps
       │
       ├─ services.ts ────────┐ Service response shapes
       │  ├─ ServiceResponse<T> (generic)
       │  ├─ AuthResponse
       │  ├─ ProjectListResponse
       │  ├─ VendorResponse
       │  ├─ EmailTemplate
       │  ├─ EmailVariables
       │  └─ ExportOptions
       │
       ├─ errors.ts ──────────┐ Unified error handling
       │  └─ ServiceError
       │
       └─ forms.ts (optional) ─ Form state types


USAGE (All files import from @/types):

src/components/
├── ProjectDashboard.tsx ─┐
├── VendorDiscovery.tsx ──├── import type { Project, Vendor, ... } from '@/types'
├── vendor-discovery/ ────┤
│   ├── VendorTable.tsx ──┤
│   ├── VendorSelection.tsx
│   ├── VendorInvite.tsx ─┤
│   └── ExecutiveSummary.tsx
│
src/services/mock/
├── authService.ts ───────┐
├── projectService.ts ────├── import type { User, Project, ... } from '@/types'
├── aiService.ts ─────────┤   (re-export from /types)
└── dataService.ts ───────┘

src/hooks/
└── useAuth.tsx ─────────── import type { User, ... } from '@/types'
```

---

## Migration Steps

### Step 1: Create Directory Structure

```bash
mkdir -p src/types
cd src/types
touch index.ts domain.ts components.ts services.ts errors.ts forms.ts
```

### Step 2: Define Core Types (domain.ts)

**Input:** Current scattered types
**Output:** Single authoritative file with all domain models

```typescript
// Map from:
- ProjectDashboard.tsx (local Project)
- VendorDiscovery.tsx (Project, Vendor, Criteria, TechRequest)
- projectService.ts (Project with workflow)
- aiService.ts (Vendor, Criterion)
- authService.ts (User, Session)
- Other services (etc.)

// To: domain.ts
✓ User
✓ Project (unified, includes workflow)
✓ Vendor (unified base + optional component fields)
✓ Criterion (singular, fixed schema)
✓ VendorComparison
✓ TechRequest
✓ Session
✓ ChatMessage
✓ WorkflowState
✓ WorkflowStepData
```

### Step 3: Extract Component Props (components.ts)

**Input:** Props interfaces scattered in components
**Output:** Centralized prop type definitions

```typescript
Map from:
- VendorDiscovery.tsx → VendorDiscoveryProps
- ProjectDashboard.tsx → ProjectDashboardProps
- VendorTable.tsx → VendorTableProps
- VendorSelection.tsx → VendorSelectionProps
- VendorInvite.tsx → VendorInviteProps
- ProtectedRoute.tsx → ProtectedRouteProps
- ExecutiveSummary.tsx → ExecutiveSummaryProps

Create extended types:
+ VendorWithScores extends Vendor
```

### Step 4: Standardize Service Types (services.ts)

**Input:** Inconsistent service response patterns
**Output:** Unified response structure

```typescript
Create generic wrapper:
- ServiceResponse<T> with data and error

Specific responses:
- AuthResponse
- ProjectListResponse
- ProjectResponse
- CriteriaResponse
- VendorResponse
- ComparisonResponse
- ChatResponse
- EmailTemplate
- EmailVariables
- ExportOptions
```

### Step 5: Unify Error Handling (errors.ts)

**Input:** Three separate error interfaces
**Output:** Single error interface

```typescript
Replace:
- AuthError (message, status?)
- ProjectError (message, code?)
- AIError (message, code?)

With:
- ServiceError (message, code?, status?)
```

### Step 6: Create Central Export (index.ts)

```typescript
export * from './domain';
export * from './components';
export * from './services';
export * from './errors';
export * from './forms';
```

---

## File-by-File Update Plan

### Phase 1: Create Types (No Breaking Changes)

1. Create `/src/types/` directory and all .ts files
2. Define all types (don't delete originals yet)
3. Commit: "feat: create centralized types directory"

### Phase 2: Update Imports (Backwards Compatible)

**Order matters to avoid circular dependencies:**

1. Update `/src/services/mock/projectService.ts`
   - Import Project from @/types instead of defining
   
2. Update `/src/services/mock/authService.ts`
   - Import User, Session from @/types
   
3. Update `/src/services/mock/aiService.ts`
   - Import Vendor, Criterion from @/types
   
4. Update `/src/services/mock/dataService.ts`
   - Import types from @/types
   
5. Update `/src/hooks/useAuth.tsx`
   - Import from @/types
   
6. Update components (bottom-up):
   - /src/components/vendor-discovery/*.tsx
   - /src/components/VendorDiscovery.tsx
   - /src/components/ProjectDashboard.tsx

### Phase 3: Clean Up (Remove Duplicates)

1. Remove duplicate type definitions from:
   - ProjectDashboard.tsx
   - VendorDiscovery.tsx
   - projectService.ts (keep only export statements)
   - aiService.ts (keep only export statements)

2. Commit: "refactor: consolidate types to centralized directory"

### Phase 4: Verify & Test

```bash
npm run build           # Check for TypeScript errors
npm run lint            # Check for import issues
npm test                # Run test suite
npm run dev             # Manual smoke test
```

---

## Risk Mitigation

### Circular Dependencies
**Risk:** domain.ts imports from components.ts and vice versa
**Solution:** domain.ts has NO imports of components.ts
- domain.ts: pure domain models
- components.ts: imports from domain.ts (one-way)
- services.ts: imports from domain.ts

### Type Conflicts
**Risk:** Same type name in different files causes confusion
**Solution:** Single source of truth
- Only define once in domain.ts
- All files import from @/types

### Breaking Changes
**Risk:** Updating imports breaks the build
**Solution:** Do it incrementally
- Step 1: Create new types
- Step 2: Update imports (all files can compile both ways)
- Step 3: Remove old types

---

## Rollback Plan

If something breaks:

```bash
# Keep old types temporarily
git revert <commit>

# Or manually restore:
1. Copy type definitions back to components
2. Update imports back to component paths
3. Update services to define types locally again
```

---

## Success Criteria

### Before
- 82 type definitions across 20+ files
- 3 duplicate Project interfaces
- 2 duplicate Vendor interfaces
- 5+ different import patterns
- Types in components, services, hooks

### After
- 40-50 type definitions in 5 files
- 0 duplicate types
- 1 import pattern: `import type { ... } from '@/types'`
- 100% imports use @/types
- Clear separation of concerns

### Quality Gates
- TypeScript compilation: 0 errors
- ESLint: 0 errors for imports
- Unit tests: 100% pass
- E2E tests: All workflows pass
- Code coverage: no regression

---

## Timeline Estimate

| Phase | Task | Estimate | Dependencies |
|-------|------|----------|--------------|
| 1 | Create types directory | 1 hour | None |
| 1 | Define domain.ts | 2 hours | None |
| 1 | Define components.ts | 1 hour | domain.ts |
| 1 | Define services.ts | 1 hour | domain.ts |
| 1 | Define errors.ts | 30 min | domain.ts |
| 2 | Update service imports | 2 hours | Phase 1 |
| 2 | Update hook imports | 30 min | Phase 1 |
| 2 | Update component imports | 2 hours | Phase 1, Phase 2 |
| 3 | Remove duplicate types | 1 hour | Phase 2 complete |
| 4 | Test & verify | 2 hours | Phase 3 complete |
| **Total** | | **13.5 hours** | |

---

## Dependencies & Blockers

- ✓ No external dependencies added
- ✓ No database migrations needed
- ✓ No API changes required
- ✓ Can be done incrementally
- ✓ No feature branch required (can be done on main with caution)

---

## References

See related documents:
- `TYPE_DEFINITIONS_REVIEW.md` - Detailed analysis and code examples
- `TYPES_SUMMARY.md` - Quick reference of current state

