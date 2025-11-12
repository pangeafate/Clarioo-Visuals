# GL-RDD.md - Documentation Guidelines (Visual Prototype)

## Overview

**🎨 THIS DOCUMENT IS FOR VISUAL PROTOTYPE DOCUMENTATION**

This document outlines documentation requirements and guidelines for the Vendora AI Visual Prototype. Since this is a demonstration prototype with no backend functionality, documentation focuses on clarity for stakeholders and ease of handoff to backend developers.

**Current Phase**: Visual Prototype (Sprint 6)
**Documentation Purpose**: Team alignment and backend integration readiness
**Last Updated**: November 12, 2024

---

## Documentation Philosophy

### Core Principles

1. **Clarity Over Complexity**
   - Simple, straightforward documentation
   - No need for API documentation (no APIs)
   - Focus on visual demonstration guide

2. **Handoff Readiness**
   - Clear integration points for backend developers
   - Well-documented mock services
   - Restoration instructions for archived code

3. **Stakeholder Communication**
   - Document what prototype IS and IS NOT
   - Set clear expectations about functionality
   - Explain prototype to functional conversion plan

4. **Maintainability**
   - Keep documentation synchronized with code
   - Update docs when visual features change
   - Version all major documentation files

---

## Required Documentation

### 1. README.md (Project Root)

**Purpose**: Primary entry point for developers and stakeholders

**Required Sections**:
```markdown
# Vendora AI - Visual Prototype

## 🎨 THIS IS A VISUAL PROTOTYPE

[Brief description of what this prototype is]

## What This IS
- Visual demonstration of 21 features
- Dummy data and mock services
- Responsive UI/UX flows

## What This IS NOT
- No real authentication
- No backend connectivity
- No data persistence
- No AI integration

## Getting Started
[Installation and running instructions]

## Project Structure
[Brief folder structure overview]

## For Backend Developers
[Link to ARCHITECTURE.md and integration points]

## Documentation
- [Architecture](./00_PLAN/ARCHITECTURE.md)
- [Feature List](./00_PLAN/FEATURE_LIST.md)
- [Project Roadmap](./00_IMPLEMENTATION/PROJECT_ROADMAP.md)
- [Sprint Plan](./00_IMPLEMENTATION/SPRINTS/SP_006_MVP_to_Visual_Prototype_Conversion.md)
```

**Tone**: Clear, professional, realistic expectations

### 2. ARCHITECTURE.md

**Purpose**: Explain prototype architecture and integration points

**Required Sections**:
- System overview
- Mock service layer architecture
- Dummy data structure
- Component organization
- Future integration points
- Archived code location

**Status**: ✅ Completed (Version 2.0.0)

### 3. FEATURE_LIST.md

**Purpose**: Document all features with their demo/functional status

**Required Sections**:
- Feature categories
- Implementation status (Demo/Functional/Future)
- Mock service documentation per feature
- Dummy data sources per feature
- Future implementation notes

**Status**: ✅ Completed (Version 2.0.0)

### 4. PROJECT_ROADMAP.md

**Purpose**: Show current prototype phase and future functional phases

**Required Sections**:
- Current Phase 0: Visual Prototype
- Future phases with timelines
- Success metrics per phase
- Conversion plan (prototype → functional)
- Technical roadmap

**Status**: ✅ Completed (Version 2.0.0)

### 5. PROGRESS.md

**Purpose**: Track Sprint 6 conversion progress

**Required Sections**:
- Current sprint status
- Task completion tracking
- Sprint history
- Feature implementation progress
- Technical metrics (prototype-specific)

**Status**: ✅ Completed (Version 2.0.0)

### 6. SP_006 Sprint Plan

**Purpose**: Detailed sprint plan for MVP to prototype conversion

**Required Sections**:
- Sprint goals and objectives
- Technical approach
- Implementation phases
- Mock service architecture
- Dummy data specifications
- Acceptance criteria

**Status**: ✅ Completed

### 7. Mock Service Documentation

**Purpose**: Document how mock services work and how to replace them

**Location**: Inline comments in service files + ARCHITECTURE.md

**Required for Each Mock Service**:
```typescript
/**
 * Mock Authentication Service
 *
 * PURPOSE: Simulates authentication for prototype demonstration
 *
 * BEHAVIOR:
 * - Always succeeds with any credentials
 * - Returns dummy user from auth.json
 * - Simulates 800ms delay for realism
 *
 * FUTURE INTEGRATION:
 * Replace with: @supabase/auth-helpers-react
 *
 * INTEGRATION EXAMPLE:
 * ```typescript
 * // Current (Mock)
 * import { authService } from '@/services/mock/authService';
 *
 * // Future (Real)
 * import { supabase } from '@/lib/supabase';
 * const { data, error } = await supabase.auth.signIn({
 *   email, password
 * });
 * ```
 */
export const authService = {
  // ... implementation
};
```

### 8. Dummy Data Documentation

**Purpose**: Explain dummy data structure and sources

**Location**: Comments in JSON files + ARCHITECTURE.md

**Required for Each Data File**:
```json
// src/data/api/projects.json
/**
 * DUMMY PROJECTS DATA
 *
 * Purpose: Sample projects for prototype demonstration
 *
 * Structure: Mirrors future API response from GET /projects
 *
 * Fields:
 * - id: Project UUID (dummy)
 * - user_id: User UUID (all same for prototype)
 * - name: Project name
 * - description: Project description
 * - status: "draft" | "in_progress" | "completed" | "archived"
 * - workflow_state: JSONB simulation of workflow progress
 * - created_at: ISO timestamp
 * - updated_at: ISO timestamp
 *
 * Categories Covered:
 * - CRM Software
 * - Marketing Automation
 * - Cloud Infrastructure
 *
 * Note: Data resets on page refresh (ephemeral)
 */
```

### 9. Component Documentation

**Purpose**: Document key components and their mock data usage

**Location**: JSDoc comments at component level

**Example**:
```typescript
/**
 * Project Dashboard Component
 *
 * PURPOSE: Displays list of projects in card grid layout
 *
 * DATA SOURCE: Mock project service → projects.json
 *
 * FEATURES (Demo):
 * - Shows 3 sample projects
 * - Status indicators (visual only)
 * - Project creation (simulated)
 * - Project deletion (simulated)
 *
 * FUTURE INTEGRATION:
 * Replace projectService.getProjects() with Supabase query:
 * ```typescript
 * const { data } = await supabase
 *   .from('projects')
 *   .select('*')
 *   .eq('user_id', user.id);
 * ```
 *
 * STATE MANAGEMENT:
 * - Currently: React useState (ephemeral)
 * - Future: Supabase Realtime subscriptions
 */
export function ProjectDashboard() {
  // ... implementation
}
```

### 10. Archived Code Documentation

**Purpose**: Explain what's archived and how to restore it

**Location**: `/archived/README.md`

**Required Sections**:
```markdown
# Archived Functional Code

## What's Archived
- Supabase integration
- OpenAI integration
- Real authentication
- Database migrations
- Original service files

## Why Archived
For Sprint 6 prototype conversion. All code preserved for future restoration.

## Restoration Guide

### Prerequisites
- Supabase project set up
- OpenAI API key obtained
- Database created

### Step-by-Step Restoration
1. Restore Supabase client
2. Run database migrations
3. Configure environment variables
4. Swap mock services with real services
5. Update component imports
6. Test authentication flow
7. Test AI integration

### File Mapping
- `archived/services/supabase-client.ts` → `src/lib/supabase.ts`
- `archived/services/openai.ts` → `src/services/openai.ts`
- etc.

### Estimated Time
12 weeks following PROJECT_ROADMAP.md Phase 1 plan
```

---

## Documentation Standards

### Code Comments

**When to Comment**:
- ✅ All mock services (explain purpose and future replacement)
- ✅ All dummy data files (explain structure)
- ✅ Complex UI logic (if any)
- ✅ Temporary workarounds
- ✅ Integration points

**When NOT to Comment**:
- ❌ Self-explanatory code
- ❌ Standard React patterns
- ❌ Simple UI components
- ❌ Obvious variable names

**Comment Format**:
```typescript
// PROTOTYPE: This always succeeds for demo purposes
// FUTURE: Replace with real Supabase authentication
const result = await mockAuthService.signIn(email, password);
```

### File Headers

**All Mock Service Files**:
```typescript
/**
 * @file Mock [Service Name] Service
 * @purpose Simulates [functionality] for prototype demonstration
 * @prototype This is a mock service with dummy data
 * @future Replace with [actual service/library]
 * @see ARCHITECTURE.md for integration details
 */
```

**All Dummy Data Files**:
```json
/**
 * @file [Data Type] Dummy Data
 * @purpose Sample data for prototype demonstration
 * @structure Mirrors future API response from [endpoint]
 * @categories List of categories covered
 * @note Data resets on page refresh
 */
```

### README Structure

**Prototype README Template**:
```markdown
# [Component/Feature Name]

## 🎨 Prototype Status: [Demo Only / Functional]

## Purpose
[What this component does in the prototype]

## Data Source
- Mock Service: `src/services/mock/[service].ts`
- Dummy Data: `src/data/api/[data].json`

## Features (Demo)
- [Feature 1] - [status]
- [Feature 2] - [status]

## Limitations
- [Limitation 1]
- [Limitation 2]

## Future Integration
[Brief description of how this will connect to real backend]

## Dependencies
- [Dependency 1]
- [Dependency 2]
```

---

## Documentation Workflow

### When Creating New Features (Prototype):

1. **Plan**: Write brief feature description
2. **Document Mock Service**: Add inline comments
3. **Document Dummy Data**: Add structure comments
4. **Update FEATURE_LIST.md**: Add feature status
5. **Update PROGRESS.md**: Track completion

### When Modifying Features:

1. **Update Inline Comments**: Keep comments current
2. **Update FEATURE_LIST.md**: If status changes
3. **Update README.md**: If major changes
4. **Update ARCHITECTURE.md**: If structure changes

### Before Committing:

1. **Check Comments**: All mock services commented
2. **Verify Documentation**: Major docs are up-to-date
3. **Update Version**: If documentation significantly changed
4. **Add Changelog**: In version history section

---

## Documentation Checklist

### Sprint 6 Documentation Complete:

- [x] ARCHITECTURE.md updated for prototype
- [x] FEATURE_LIST.md updated with demo statuses
- [x] PROJECT_ROADMAP.md updated with prototype phase
- [x] PROGRESS.md updated with Sprint 6
- [x] SP_006 Sprint Plan created
- [x] GL-TDD.md created for prototype testing
- [x] GL-RDD.md created for prototype docs
- [ ] GL-ERROR-LOGGING.md updated or archived
- [ ] README.md updated for prototype
- [ ] /archived/README.md created with restoration guide
- [ ] All mock services have inline documentation
- [ ] All dummy data files have structure comments

---

## Documentation for Stakeholder Demo

### Pre-Demo Documentation:

1. **One-Page Summary** (Create before demo)
   - What is this prototype?
   - What can it demonstrate?
   - What is NOT functional?
   - Next steps after feedback

2. **Feature Walkthrough Guide**
   - Step-by-step demo script
   - What to show at each step
   - Expected behavior
   - Known limitations

3. **Feedback Form**
   - What aspects to gather feedback on
   - UX/UI feedback questions
   - Feature priority questions
   - Conversion timeline questions

### Post-Demo Documentation:

1. **Stakeholder Feedback Log**
   - Date and attendees
   - Feedback received
   - Design changes requested
   - Feature priorities validated

2. **Next Steps Document**
   - Approved design changes
   - Timeline for functional implementation
   - Budget approval status
   - Team resource allocation

---

## Documentation Maintenance

### Weekly Review:
- [ ] Documentation reflects current code state
- [ ] No outdated information
- [ ] Version numbers current
- [ ] Links working

### Sprint End Review:
- [ ] All sprint objectives documented
- [ ] PROGRESS.md updated
- [ ] FEATURE_LIST.md updated
- [ ] Changelog entries added

### Phase Transition:
- [ ] Major version bump for all docs
- [ ] Archive old documentation
- [ ] Update all references
- [ ] Notify team of changes

---

## Common Documentation Mistakes to Avoid

### DON'T:
- ❌ Document error handling (not in prototype)
- ❌ Document performance optimization (not needed)
- ❌ Document test coverage (not applicable)
- ❌ Document security measures (no backend)
- ❌ Over-document simple UI code
- ❌ Promise features that aren't built yet
- ❌ Confuse stakeholders about what's functional

### DO:
- ✅ Clearly mark everything as prototype/demo
- ✅ Document integration points for backend devs
- ✅ Explain mock services thoroughly
- ✅ Set realistic expectations
- ✅ Update docs when code changes
- ✅ Keep restoration instructions clear
- ✅ Version all major documentation

---

## Documentation Templates

### New Mock Service Template:

```typescript
/**
 * Mock [Service Name]
 *
 * @prototype Visual demonstration only
 * @purpose [What this service simulates]
 *
 * BEHAVIOR:
 * - [Behavior 1]
 * - [Behavior 2]
 *
 * DATA SOURCE:
 * - src/data/api/[filename].json
 *
 * FUTURE INTEGRATION:
 * Replace with: [Real service/API]
 *
 * @example
 * ```typescript
 * // Prototype usage
 * const data = await mockService.getData();
 *
 * // Future usage
 * const { data } = await supabase.from('table').select('*');
 * ```
 */
export const mockServiceName = {
  async method1() {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return dummy data
    return dummyData;
  }
};
```

### New Dummy Data File Template:

```json
/**
 * [Data Type] Dummy Data
 *
 * PURPOSE: [What this data represents]
 * STRUCTURE: Mirrors API response from [endpoint]
 * CATEGORIES: [List categories if applicable]
 *
 * FIELDS:
 * - field1: [description]
 * - field2: [description]
 *
 * USAGE: Imported by src/services/mock/[service].ts
 *
 * NOTE: Data resets on page refresh (ephemeral)
 */
{
  "items": [
    {
      "id": "uuid_1",
      "field1": "value1",
      "field2": "value2"
    }
  ]
}
```

### Component Integration Note Template:

```typescript
/**
 * INTEGRATION POINT: [Component Name]
 *
 * CURRENT: Mock service → Dummy data
 * FUTURE: Real API → Database
 *
 * STEPS TO INTEGRATE:
 * 1. [Step 1]
 * 2. [Step 2]
 * 3. [Step 3]
 *
 * ESTIMATED TIME: [X hours/days]
 * DEPENDENCIES: [List dependencies]
 */
```

---

## Future Documentation (Functional Phase)

**When Backend Integration Begins**:

1. **API Documentation**
   - OpenAPI/Swagger specs
   - Endpoint documentation
   - Request/response schemas
   - Authentication flows

2. **Database Documentation**
   - Schema documentation
   - ER diagrams
   - Migration guides
   - RLS policies

3. **Deployment Documentation**
   - Environment setup
   - CI/CD pipeline
   - Deployment procedures
   - Rollback procedures

4. **Testing Documentation**
   - Unit test examples
   - Integration test patterns
   - E2E test scenarios
   - Test data setup

5. **Security Documentation**
   - Authentication mechanisms
   - Authorization rules
   - Data encryption
   - Security best practices

**Not Needed Now**: Focus on prototype documentation only

---

## Quick Reference

### Documentation Priority (Prototype):

**P0 - Critical**:
- ARCHITECTURE.md
- FEATURE_LIST.md
- PROJECT_ROADMAP.md
- README.md
- Mock service inline docs

**P1 - Important**:
- PROGRESS.md
- SP_006 Sprint Plan
- Archived code README
- Component integration notes

**P2 - Nice to Have**:
- Detailed dummy data comments
- Demo walkthrough guide
- Stakeholder summary

**P3 - Not Needed**:
- API documentation (no APIs)
- Test documentation (no tests)
- Deployment docs (static site)
- Security docs (no backend)

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | Nov 12, 2024 | Initial prototype documentation guidelines |

---

## Document Status

**Current Version**: 1.0.0
**Project Phase**: 🎨 Visual Prototype
**Documentation Approach**: Clarity and Handoff Readiness
**Last Updated**: November 12, 2024

---

*This document will be significantly expanded when functional implementation begins. For now, focus on clear prototype documentation and backend integration readiness.*
