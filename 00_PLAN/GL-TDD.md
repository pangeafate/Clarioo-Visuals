# GL-TDD.md - Testing Guidelines (Visual Prototype)

## Overview

**🎨 THIS DOCUMENT IS FOR VISUAL PROTOTYPE TESTING**

This document outlines the testing approach for the Vendora AI Visual Prototype. Since this is a demonstration prototype with dummy data and no backend functionality, testing requirements are significantly simplified compared to a functional application.

**Current Phase**: Visual Prototype (Sprint 6)
**Testing Focus**: Visual verification and UI rendering
**Test Coverage Target**: Not applicable for prototype
**Last Updated**: November 12, 2024

---

## Testing Philosophy for Visual Prototype

### What We Test:
1. ✅ **Visual Elements Render Correctly** - All UI components display as expected
2. ✅ **UI Flows Complete** - Users can navigate through all 5 workflow steps
3. ✅ **Responsive Design Works** - Layout adapts to different screen sizes
4. ✅ **Dummy Data Displays** - Mock data populates components correctly
5. ✅ **Excel Export Functions** - Export feature works with dummy data
6. ✅ **No Console Errors** - Application runs without JavaScript errors

### What We DON'T Test:
- ❌ **Unit Tests** - No backend logic to test
- ❌ **Integration Tests** - No API integrations
- ❌ **E2E Tests** - No real data persistence
- ❌ **Performance Tests** - Static site loads instantly
- ❌ **Security Tests** - No authentication or sensitive data
- ❌ **API Tests** - No APIs to test
- ❌ **Database Tests** - No database connections

---

## Testing Approach

### 1. Manual Visual Verification

**Purpose**: Ensure all UI elements render and display correctly

**Checklist**:
- [ ] Login page displays correctly
- [ ] Dashboard shows dummy projects
- [ ] New project dialog opens and closes
- [ ] All 5 workflow steps are accessible
- [ ] Step 1: Tech input form renders
- [ ] Step 2: Criteria builder shows 20 criteria
- [ ] Step 3: Vendor selection shows 8-10 vendors
- [ ] Step 4: Comparison table displays correctly
- [ ] Step 5: Email templates generate
- [ ] Responsive design works on mobile (375px)
- [ ] Responsive design works on tablet (768px)
- [ ] Responsive design works on desktop (1024px+)
- [ ] No broken images or missing icons
- [ ] All buttons clickable and styled correctly

**How to Test**:
```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:5173

# Manually click through all features
# Verify visual appearance and layout
```

### 2. Build Verification

**Purpose**: Ensure the application builds without errors

**Test Commands**:
```bash
# Build the application
npm run build

# Expected output:
# ✓ Build successful
# dist/ folder created
# No TypeScript errors
# No build warnings (ideally)
```

**Success Criteria**:
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ No critical warnings
- ✅ Bundle size < 500KB
- ✅ dist/ folder contains static files

### 3. Browser Console Check

**Purpose**: Ensure no JavaScript runtime errors

**How to Test**:
```bash
# 1. Open browser DevTools (F12)
# 2. Go to Console tab
# 3. Click through all features
# 4. Verify no errors appear
```

**Success Criteria**:
- ✅ No red errors in console
- ✅ No 404 network errors
- ⚠️ Warnings acceptable if minor

### 4. Responsive Design Verification

**Purpose**: Ensure UI adapts to different screen sizes

**Test Viewports**:
- **Mobile**: 375px x 667px (iPhone SE)
- **Tablet**: 768px x 1024px (iPad)
- **Desktop**: 1920px x 1080px (Full HD)

**How to Test**:
```bash
# Use browser DevTools
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M)
# 3. Test each viewport size
# 4. Verify layout doesn't break
```

**Checklist**:
- [ ] Mobile: Navigation collapses to hamburger menu
- [ ] Mobile: Project cards stack vertically
- [ ] Mobile: Tables scroll horizontally if needed
- [ ] Tablet: Sidebar appears
- [ ] Tablet: 2-column project grid
- [ ] Desktop: Full sidebar visible
- [ ] Desktop: 3-column project grid

### 5. Dummy Data Verification

**Purpose**: Ensure mock services return expected data

**Test Cases**:
1. **Authentication**: Login with any credentials → Success
2. **Projects**: Dashboard shows 3 sample projects
3. **Step 2**: Criteria builder shows 20 criteria
4. **Step 3**: Vendor selection shows 8-10 vendors
5. **Step 4**: Comparison shows vendor matrix
6. **Step 5**: Email templates generate

**How to Verify**:
- Click through each feature
- Verify data appears in UI
- Check that data looks realistic (not just placeholders)
- Ensure category-based data selection works

### 6. Excel Export Test

**Purpose**: Verify Excel export functionality works

**How to Test**:
```bash
# 1. Navigate to Step 4 (Vendor Comparison)
# 2. Click "Export to Excel" button
# 3. Verify download starts
# 4. Open downloaded file
# 5. Verify data is formatted correctly
```

**Success Criteria**:
- ✅ File downloads successfully
- ✅ File opens in Excel/Sheets
- ✅ Data is properly formatted
- ✅ Columns have headers
- ✅ Vendor names and scores visible

---

## Testing for Future Functional Implementation

**Note**: This section is for reference when converting back to functional MVP

### Unit Testing (Vitest)

**When to Implement**: After backend integration

**Example Test Structure**:
```typescript
// tests/services/authService.test.ts
import { describe, it, expect } from 'vitest';
import { authService } from '@/services/authService';

describe('AuthService', () => {
  it('should authenticate valid user', async () => {
    const result = await authService.signIn('test@example.com', 'password');
    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    await expect(
      authService.signIn('invalid@example.com', 'wrong')
    ).rejects.toThrow();
  });
});
```

**Coverage Targets (Future)**:
- Services: 80%+
- Hooks: 70%+
- Utils: 90%+
- Components: 60%+

### Integration Testing (Vitest + React Testing Library)

**When to Implement**: After core features functional

**Example Test Structure**:
```typescript
// tests/integration/workflow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { VendorDiscovery } from '@/components/VendorDiscovery';

describe('Vendor Discovery Workflow', () => {
  it('should complete 5-step workflow', async () => {
    render(<VendorDiscovery />);

    // Step 1: Input requirements
    // ... test step 1 ...

    // Step 2: Generate criteria
    // ... test step 2 ...

    // Verify all steps complete
  });
});
```

### E2E Testing (Playwright)

**When to Implement**: Before production launch

**Example Test Structure**:
```typescript
// e2e/vendor-discovery.spec.ts
import { test, expect } from '@playwright/test';

test('complete vendor discovery flow', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Create project
  await page.click('text=New Project');
  // ... complete workflow ...

  // Verify success
  await expect(page.locator('text=Completed')).toBeVisible();
});
```

---

## Testing Workflow (Prototype Phase)

### Before Each Commit:
1. Run `npm run build` - Verify build succeeds
2. Check console - No errors during demo flow
3. Test responsive design - Verify on mobile/desktop
4. Visual spot-check - Ensure nothing broke

### Before Sprint 6 Completion:
1. Complete all manual verification checklists
2. Build succeeds with 0 errors
3. No console errors during full demo
4. All 21 features visually working
5. Excel export working
6. Responsive design verified

### Before Stakeholder Demo:
1. Full manual test of all 21 features
2. Test on multiple browsers (Chrome, Safari, Firefox)
3. Test on real mobile device
4. Verify all dummy data displays correctly
5. Practice demo flow end-to-end
6. Have backup plan if build fails

---

## Test Automation (Not for Prototype)

**Status**: ❌ Not implemented in prototype

**Reason**:
- No backend logic to test
- No API integrations
- No data persistence
- Focus on visual demonstration

**Future Implementation**:
When converting to functional MVP:
1. Set up Vitest for unit/integration tests
2. Set up Playwright for E2E tests
3. Configure CI/CD pipeline with test runs
4. Achieve 80%+ test coverage
5. Implement test-driven development workflow

---

## Definition of "Testing Complete" (Prototype)

### Prototype Testing Complete Criteria:
- [x] All 21 features manually verified
- [x] Application builds without errors (`npm run build`)
- [x] No console errors during demo flow
- [x] Responsive design works (mobile, tablet, desktop)
- [x] Excel export functional
- [x] Dummy data displays correctly
- [x] No broken images or 404s
- [x] Load time < 2 seconds

### Future Functional Testing Criteria:
- [ ] Unit test coverage > 80%
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Performance tests pass
- [ ] Security audit complete
- [ ] Accessibility audit complete

---

## Known Testing Limitations (Prototype)

### What Can't Be Tested:
1. **Authentication**: Always succeeds (mock)
2. **Data Persistence**: No backend to test
3. **AI Responses**: Pre-generated, not real
4. **Error Handling**: Not implemented (happy path only)
5. **Performance Under Load**: Static site, no load
6. **Security**: No authentication or APIs to secure

### Acceptable "Bugs" in Prototype:
- ✅ Login always succeeds regardless of credentials
- ✅ Data doesn't persist after page refresh
- ✅ No error messages for invalid input
- ✅ No loading states (instant responses)
- ✅ AI responses identical each time (pre-generated)
- ✅ Projects can't actually be deleted (visual only)

**Why Acceptable**: These are intentional simplifications for the prototype phase. Will be addressed in functional implementation.

---

## Testing Tools (Future)

### For Functional Implementation:

**Unit/Integration Testing**:
- Vitest - Fast unit test runner
- React Testing Library - Component testing
- MSW - API mocking for tests

**E2E Testing**:
- Playwright - Browser automation
- Playwright Test - E2E test framework

**Code Quality**:
- TypeScript - Type checking
- ESLint - Code linting
- Prettier - Code formatting

**CI/CD**:
- GitHub Actions - Automated test runs
- Codecov - Coverage reporting

---

## Quick Testing Reference

### Daily Development Testing:
```bash
# 1. Build check
npm run build

# 2. Visual verification
npm run dev
# Click through changed features

# 3. Console check
# Open DevTools, verify no errors
```

### Before Committing:
```bash
# Verify build
npm run build

# Type check
npm run type-check  # (if configured)

# Quick smoke test
npm run dev
# Verify main features work
```

### Before Demo:
```bash
# Full build
npm run build

# Preview production build
npm run preview

# Full manual test
# Test all 21 features
# Test on multiple browsers
# Test responsive design
```

---

## Testing Checklist Template

Use this checklist for manual testing sessions:

```markdown
## Testing Session: [Date]

### Build Status
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Bundle size < 500KB

### Core Features
- [ ] Login page renders
- [ ] Dashboard shows projects
- [ ] New project creates successfully
- [ ] Step 1: Tech input works
- [ ] Step 2: Criteria builder works
- [ ] Step 3: Vendor selection works
- [ ] Step 4: Comparison table works
- [ ] Step 5: Email generation works

### UI/UX
- [ ] Navigation works
- [ ] All buttons clickable
- [ ] No broken images
- [ ] Styling looks correct
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive

### Functional
- [ ] Excel export works
- [ ] Copy to clipboard works
- [ ] Mock data displays

### Browser Console
- [ ] No errors in console
- [ ] No 404 network errors

### Notes
[Any issues or observations]

**Status**: ✅ Pass / ❌ Fail
```

---

## Appendix: Testing When to Resume TDD

**Resume Full TDD When**:
1. Backend integration begins (Phase 1)
2. Real database connected
3. Real API calls implemented
4. Authentication implemented
5. Budget approved for functional development

**TDD Workflow (Future)**:
1. Write failing test
2. Write minimal code to pass test
3. Refactor code
4. Repeat

**Until Then (Prototype)**:
- Manual visual verification only
- Build verification
- Console error checks
- Focus on visual quality over test coverage

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | Nov 12, 2024 | Initial prototype testing guidelines |

---

## Document Status

**Current Version**: 1.0.0
**Project Phase**: 🎨 Visual Prototype
**Testing Approach**: Manual Visual Verification
**Test Coverage**: 0% (Not Applicable)
**Last Updated**: November 12, 2024

---

*This document will be significantly expanded when functional implementation begins. For now, focus on visual verification and ensuring the prototype demonstrates all 21 features correctly.*
