# ARCHITECTURE.md - Vendora AI Visual Prototype

## Executive Summary

**🎨 This is a VISUAL PROTOTYPE with dummy data for demonstration purposes only.**

Vendora AI Visual Prototype is a front-end-only React application built to demonstrate the user experience and visual flows of an intelligent vendor discovery platform. The prototype uses mock services and JSON dummy data to simulate all functionality without any backend integration. This architecture is designed for easy handoff to backend developers who will replace mock services with real implementations.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [Prototype Architecture](#prototype-architecture)
5. [Component Architecture](#component-architecture)
6. [Mock Service Architecture](#mock-service-architecture)
7. [Data Architecture](#data-architecture)
8. [Future Integration Points](#future-integration-points)

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React SPA  │  │   shadcn/ui  │  │  Tailwind CSS│          │
│  │  TypeScript  │  │  Components  │  │    Styling   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ├─────── NO BACKEND ───────
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    MOCK SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Mock Auth   │  │ Mock Project │  │   Mock AI    │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ├─────── Reads from ───────
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    DUMMY DATA LAYER (JSON)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  auth.json   │  │projects.json │  │ vendors.json │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │criteria.json │  │comparisons...│                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Frontend Application** - React SPA with TypeScript
2. **Mock Service Layer** - Simulates backend API responses
3. **Dummy Data** - JSON files containing realistic sample data
4. **UI Components** - shadcn/ui + custom components

### What This Prototype IS

✅ **Visual demonstration** of all 21 implemented features
✅ **UX/UI validation** tool for team alignment
✅ **Design prototype** for stakeholder presentations
✅ **Front-end foundation** ready for backend integration
✅ **Lightweight and fast** with no external dependencies

### What This Prototype IS NOT

❌ Not a functional application with real data
❌ Not connected to any backend services
❌ Not using real authentication
❌ Not making real AI API calls
❌ Not persisting any data
❌ Not production-ready

---

## Architecture Principles

### 1. Separation of Mock Services
- Clear boundary between UI and mock services
- Mock services mirror future real API structure
- Easy swap from mock to real services
- Service layer abstraction maintained

### 2. Realistic Simulation
- Dummy data mimics real API response shapes
- Simulated loading delays for realistic UX
- Proper error-free flow demonstrations
- No edge cases or error states (for simplicity)

### 3. Lightweight & Fast
- No backend dependencies
- Minimal bundle size
- Fast load times
- Static hosting friendly

### 4. Backend-Ready Design
- Mock services have same signatures as future real services
- Data structures match future API responses
- Clear integration points documented
- Original functional code archived for reference

### 5. Maintainability
- TypeScript for type safety
- Component-driven development
- Logical file organization
- Well-documented code

---

## Technology Stack

### Frontend Technologies (Kept)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 18.3.1 | UI Framework | ✅ Active |
| TypeScript | 5.5.3 | Type Safety | ✅ Active |
| Vite | 5.4.2 | Build Tool | ✅ Active |
| React Router | 6.26.2 | Routing | ✅ Active |
| TanStack Query | 5.56.2 | (Optional) State | ✅ Active |
| Tailwind CSS | 3.4.13 | Styling | ✅ Active |
| shadcn/ui | Latest | UI Components | ✅ Active |
| React Hook Form | Latest | Form Management | ✅ Active |
| xlsx | Latest | Excel Export | ✅ Active |

### Removed Technologies (Archived)

| Technology | Purpose | Status | Location |
|------------|---------|--------|----------|
| Supabase | Backend/Auth | 🗄️ Archived | `/archived/supabase/` |
| PostgreSQL | Database | 🗄️ Archived | `/archived/supabase/` |
| OpenAI API | AI Services | 🗄️ Archived | `/archived/services/openai.ts` |
| Supabase Auth | Authentication | 🗄️ Archived | `/archived/hooks/useAuth.tsx` |
| Realtime | WebSockets | 🗄️ Archived | `/archived/` |

### Development Tools

| Tool | Purpose | Status |
|------|---------|--------|
| ESLint | Code Quality | ✅ Active |
| Git | Version Control | ✅ Active |
| npm | Package Management | ✅ Active |

---

## Prototype Architecture

### 1. Application Architecture

```
┌──────────────────────────────────────────┐
│           Browser Application             │
│  ┌────────────────────────────────────┐  │
│  │         React Components           │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │    Pages & Workflows         │  │  │
│  │  │  ┌──────────┐ ┌──────────┐  │  │  │
│  │  │  │   Auth   │ │Dashboard │  │  │  │
│  │  │  └──────────┘ └──────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │     Mock Service Layer       │  │  │
│  │  │  ┌──────────┐ ┌──────────┐  │  │  │
│  │  │  │Mock Auth │ │ Mock AI  │  │  │  │
│  │  │  └──────────┘ └──────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │      JSON Data Imports       │  │  │
│  │  │  ┌──────────┐ ┌──────────┐  │  │  │
│  │  │  │  users   │ │ projects │  │  │  │
│  │  │  └──────────┘ └──────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 2. Request Flow (Prototype)

```
User Action (e.g., "Generate Criteria")
     │
     ▼
React Component (CriteriaBuilder.tsx)
     │
     ├─────► State Update (React State)
     │
     ▼
Mock Service Call (aiService.generateCriteria())
     │
     ├─────► Load JSON Data (criteria.json)
     │
     ├─────► Simulate Delay (500-2000ms)
     │
     ▼
Return Dummy Data
     │
     ├─────► Update Component State
     │
     ▼
Component Re-render with Dummy Data
     │
     ▼
User Sees Simulated Result
```

### 3. Data Flow Pattern

```
User Input → Component → Mock Service → JSON File → Component State → UI Update
```

**No backend, no API calls, no persistence.**

---

## Component Architecture

### 1. File Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components (unchanged)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (50+ components)
│   ├── steps/          # Workflow step components
│   │   ├── CriteriaBuilder.tsx
│   │   ├── VendorSelection.tsx
│   │   ├── VendorComparison.tsx
│   │   └── VendorInvite.tsx
│   ├── ProjectDashboard.tsx
│   ├── VendorDiscovery.tsx
│   └── [other components]
├── pages/              # Page components
│   ├── Index.tsx       # Main dashboard page
│   └── Auth.tsx        # Auth page (visual demo only)
├── services/           # Mock service layer
│   └── mock/           # NEW - All mock services
│       ├── authService.ts
│       ├── projectService.ts
│       ├── aiService.ts
│       └── dataService.ts
├── data/               # NEW - Dummy data
│   ├── api/           # API response shapes
│   │   ├── auth.json
│   │   ├── projects.json
│   │   ├── vendors.json
│   │   ├── criteria.json
│   │   └── comparisons.json
│   └── templates/     # Template data
│       ├── email-templates.json
│       └── criteria-templates.json
├── hooks/              # Custom hooks (simplified)
│   ├── useAuth.tsx    # Mock auth hook
│   └── useMobile.tsx
├── lib/                # Utilities
│   └── utils.ts
└── App.tsx             # Root component
```

### 2. Component Hierarchy (Unchanged)

```
App.tsx
├── Routes
├── Pages
│   ├── Auth (visual demo)
│   │   └── LoginForm (always succeeds)
│   └── Index
│       └── ProjectDashboard
│           ├── ProjectCard
│           └── VendorDiscovery
│               ├── StepIndicator
│               └── Steps
│                   ├── TechRequirements
│                   ├── CriteriaBuilder
│                   ├── VendorSelection
│                   ├── VendorComparison
│                   └── VendorInvite
└── UI Components (shadcn/ui)
```

**Note**: Component structure remains largely unchanged. Only service imports are updated.

---

## Mock Service Architecture

### 1. Service Layer Pattern

All mock services follow the same pattern as future real services:

```typescript
// Future Real Service Pattern
export const realService = {
  async getData() {
    const response = await fetch('/api/data');
    return response.json();
  }
};

// Current Mock Service Pattern
export const mockService = {
  async getData() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return dummy data from JSON
    return dummyData;
  }
};
```

### 2. Mock Authentication Service

**Location**: `/src/services/mock/authService.ts`

```typescript
import authData from '@/data/api/auth.json';

export const authService = {
  /**
   * Mock sign in - always succeeds
   * Future: Replace with Supabase auth.signIn()
   */
  async signIn(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      user: authData.demoUser,
      session: {
        access_token: 'demo_token',
        expires_at: Date.now() + 3600000,
      },
    };
  },

  /**
   * Mock sign out
   * Future: Replace with Supabase auth.signOut()
   */
  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },

  /**
   * Get current user
   * Future: Replace with Supabase auth.getUser()
   */
  async getUser() {
    return authData.demoUser;
  },
};
```

### 3. Mock Project Service

**Location**: `/src/services/mock/projectService.ts`

```typescript
import projectsData from '@/data/api/projects.json';

export const projectService = {
  /**
   * Get all projects
   * Future: Replace with Supabase query
   */
  async getProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return projectsData;
  },

  /**
   * Create project (simulated)
   * Future: Replace with Supabase insert
   */
  async createProject(project: CreateProjectDto): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newProject = {
      id: `proj_${Date.now()}`,
      ...project,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newProject;
  },

  /**
   * Update project (simulated)
   * Future: Replace with Supabase update
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const project = projectsData.find(p => p.id === id);
    return { ...project, ...updates };
  },
};
```

### 4. Mock AI Service

**Location**: `/src/services/mock/aiService.ts`

```typescript
import criteriaData from '@/data/api/criteria.json';
import vendorsData from '@/data/api/vendors.json';
import comparisonsData from '@/data/api/comparisons.json';

export const aiService = {
  /**
   * Generate criteria (returns pre-generated data)
   * Future: Replace with OpenAI API call
   */
  async generateCriteria(requirements: TechRequirements): Promise<Criterion[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return criteria based on category
    return criteriaData[requirements.category] || criteriaData.default;
  },

  /**
   * Discover vendors (returns pre-selected vendors)
   * Future: Replace with OpenAI API call
   */
  async discoverVendors(requirements: TechRequirements): Promise<Vendor[]> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return vendors based on category
    return vendorsData[requirements.category] || vendorsData.default;
  },

  /**
   * Compare vendors (returns pre-generated comparison)
   * Future: Replace with OpenAI API call
   */
  async compareVendors(
    vendors: Vendor[],
    criteria: Criterion[]
  ): Promise<Comparison> {
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Return comparison based on first vendor's category
    const category = vendors[0]?.category || 'default';
    return comparisonsData[category] || comparisonsData.default;
  },

  /**
   * Generate email template
   * Future: Replace with OpenAI API call
   */
  async generateEmail(vendor: Vendor, requirements: TechRequirements): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return `
Dear ${vendor.name} Team,

We are evaluating ${requirements.category} solutions...

[Pre-generated template content]

Best regards,
Demo User
    `.trim();
  },
};
```

---

## Data Architecture

### 1. Dummy Data Structure

All dummy data stored in `/src/data/` folder:

```
src/data/
├── api/                    # API response shapes
│   ├── auth.json          # User authentication data
│   ├── projects.json      # Sample projects
│   ├── vendors.json       # Vendor catalog by category
│   ├── criteria.json      # Criteria sets by category
│   └── comparisons.json   # Comparison matrices
└── templates/             # Template data
    ├── email-templates.json
    └── criteria-templates.json
```

### 2. Data Schema Examples

#### auth.json
```json
{
  "demoUser": {
    "id": "user_demo",
    "email": "demo@vendora.ai",
    "full_name": "Demo User",
    "company_name": "Acme Corporation",
    "role": "Admin",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### projects.json
```json
[
  {
    "id": "proj_001",
    "user_id": "user_demo",
    "name": "CRM System Selection 2024",
    "description": "Finding the right CRM for our growing sales team of 50+ people",
    "status": "in_progress",
    "category": "CRM Software",
    "workflow_state": {
      "currentStep": 3,
      "steps": {
        "1": {
          "status": "completed",
          "data": {
            "category": "CRM Software",
            "description": "Need CRM for 50 users",
            "budget": "$10k-50k",
            "urgency": "3 months",
            "companySize": "51-200"
          }
        },
        "2": {
          "status": "completed",
          "data": {
            "criteria": [
              {
                "id": "c1",
                "category": "Technical",
                "name": "API Integration",
                "description": "RESTful API for third-party integrations"
              }
            ]
          }
        },
        "3": {
          "status": "in_progress"
        }
      }
    },
    "created_at": "2024-11-01T10:00:00Z",
    "updated_at": "2024-11-12T14:30:00Z"
  }
]
```

#### vendors.json (by category)
```json
{
  "CRM Software": [
    {
      "id": "vendor_sf",
      "name": "Salesforce",
      "description": "World's #1 CRM platform with comprehensive features",
      "category": "CRM Software",
      "pricing": "$25-300/user/month",
      "website": "https://salesforce.com",
      "employees": "75,000+",
      "founded": "1999",
      "headquarters": "San Francisco, CA",
      "strengths": [
        "Market leader with 20% market share",
        "Extensive ecosystem of integrations",
        "Powerful automation and AI features",
        "Highly customizable platform"
      ],
      "weaknesses": [
        "Expensive for small teams",
        "Complex setup and configuration",
        "Steep learning curve",
        "Can be overwhelming for simple use cases"
      ]
    },
    {
      "id": "vendor_hs",
      "name": "HubSpot",
      "description": "All-in-one marketing, sales, and service platform",
      ...
    }
  ],
  "Marketing Automation": [...],
  "default": [...]
}
```

### 3. Data Flow

```
Component Request
    ↓
Mock Service
    ↓
Import JSON File
    ↓
Simulate Delay (300-2500ms)
    ↓
Return Data
    ↓
Component State Update
    ↓
UI Re-render
```

**No persistence**: All changes are ephemeral and reset on page refresh.

---

## Future Integration Points

### For Backend Developers

This section documents where to integrate real services:

#### 1. Authentication Integration
**File**: `/src/services/mock/authService.ts`
**Replace with**: Supabase Auth integration
**Reference**: `/archived/hooks/useAuth.tsx`

```typescript
// Current Mock
import { authService } from '@/services/mock/authService';

// Future Real Implementation
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Replace authService.signIn() with:
await supabase.auth.signInWithPassword({ email, password });
```

#### 2. Project Service Integration
**File**: `/src/services/mock/projectService.ts`
**Replace with**: Supabase database queries
**Reference**: `/archived/` folder

```typescript
// Current Mock
import { projectService } from '@/services/mock/projectService';

// Future Real Implementation
await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);
```

#### 3. AI Service Integration
**File**: `/src/services/mock/aiService.ts`
**Replace with**: OpenAI API calls
**Reference**: `/archived/services/openai.ts`

```typescript
// Current Mock
import { aiService } from '@/services/mock/aiService';

// Future Real Implementation
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
});
```

### Integration Checklist

When converting from prototype to functional:

- [ ] Set up Supabase project
- [ ] Run database migrations (from `/archived/supabase/migrations/`)
- [ ] Configure environment variables
- [ ] Replace `authService` with real Supabase auth
- [ ] Replace `projectService` with real database queries
- [ ] Replace `aiService` with real OpenAI calls
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add data validation
- [ ] Implement proper security (RLS policies)
- [ ] Add comprehensive tests

---

## Performance Considerations

### Current Prototype Performance

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | <1.5s | ✅ <1s (no backend) |
| Time to Interactive | <3s | ✅ <2s (no backend) |
| Bundle Size | <500KB | ✅ ~350KB |
| Page Load Time | <2s | ✅ <1s |

### Optimizations

- **No API calls** = Instant responses (plus simulated delays)
- **Static JSON data** = No network overhead
- **Code splitting** = Fast initial load
- **Tree shaking** = Minimal bundle size

---

## Deployment

### Deployment Options

This prototype can be deployed to any static hosting:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Any static file server**

### Build Command
```bash
npm run build
```

### Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── [static assets]
```

---

## Archived Code

### Archive Location

All removed functional code is stored in `/archived/` folder:

```
archived/
├── README.md                 # Explains what's archived
├── supabase/                # Supabase integration
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase config
├── services/                # Real services
│   ├── openai.ts           # OpenAI integration
│   └── supabase-client.ts  # Supabase client
├── hooks/                  # Real hooks
│   └── useAuth.tsx         # Real auth hook
└── contexts/               # Real contexts
    └── AuthContext.tsx     # Real auth context
```

### Restoration Process

To restore functional code:
1. Copy files from `/archived/` back to `/src/`
2. Install archived dependencies (`supabase`, `openai`)
3. Update imports in components
4. Configure environment variables
5. Run database migrations

---

## Limitations

### Current Limitations

❌ **No data persistence** - All data resets on refresh
❌ **No real authentication** - Login always succeeds
❌ **No AI processing** - Pre-generated responses only
❌ **No error handling** - No error states demonstrated
❌ **No loading states** - Simple spinners only
❌ **No empty states** - Always shows data
❌ **No form validation** - Basic validation only
❌ **No real-time updates** - No WebSocket connections
❌ **No file upload** - Excel import simulated
❌ **No multi-user** - Single demo user only

### Intentional Simplifications

These are intentional for the prototype:
- No edge cases
- No error scenarios
- Happy path only
- Pre-populated data
- Fast simulated responses

---

## Conclusion

This visual prototype architecture prioritizes:

✅ **Demonstration Value** - Shows complete UX flows
✅ **Team Alignment** - Clear visual communication
✅ **Backend Readiness** - Easy integration path
✅ **Clean Code** - Maintainable and documented
✅ **Fast Performance** - No backend overhead

The architecture is explicitly designed to be **temporary** and **easily convertible** to a functional application by swapping mock services for real implementations.

---

## Next Steps

### For Design/UX Team
- Review visual flows
- Validate user experience
- Identify improvements

### For Backend Team
- Review integration points
- Plan API structure
- Set up infrastructure

### For Product Team
- Demonstrate to stakeholders
- Gather feedback
- Prioritize features

### For Development Team
- Collect technical feedback
- Plan functional implementation
- Begin backend integration

---

*Architecture Status: PROTOTYPE - Visual Demo Only*
*Version: 2.0.0 (Prototype)*
*Last Updated: November 12, 2024*
*Next Review: After stakeholder feedback*

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 2024 | System | Initial functional architecture |
| 2.0 | Nov 2024 | System | Converted to prototype architecture |
