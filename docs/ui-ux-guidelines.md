## 📋 Table of Contents

1. [Design Philosophy](#-design-philosophy)
2. [Color System](#-color-system)
3. [Typography](#-typography)
4. [Spacing & Layout](#-spacing--layout)
5. [Component Patterns](#-component-patterns)
6. [Cards & Containers](#-cards--containers)
7. [Buttons](#-buttons)
8. [Tabs & Navigation](#-tabs--navigation)
9. [Forms & Inputs](#-forms--inputs)
10. [Animations & Transitions](#-animations--transitions)
11. [Accessibility](#-accessibility)
12. [Responsive Design](#-responsive-design)
13. [Dark Mode Support](#-dark-mode-support)
14. [Code Structure](#-code-structure)

---

## 🎨 Design Philosophy

### Core Principles
- **Consistency**: All components should follow the same visual language
- **Clarity**: Information hierarchy should be immediately apparent
- **Accessibility**: All interactive elements must be keyboard-navigable and screen-reader friendly
- **Performance**: Animations should be smooth but not excessive
- **Responsiveness**: All components must work well on mobile, tablet, and desktop

### Design System Approach
- Use Tailwind CSS utility classes exclusively
- Follow the patterns established in `social-screen.tsx`
- Maintain consistency with existing color tokens and spacing scales
- Prefer composition over custom one-off styles

---

## 🎨 Color System

### Primary Colors
```css
/* Indigo - Primary brand color */
bg-indigo-500      /* Primary actions, active states */
text-indigo-600    /* Primary text on light backgrounds */
dark:text-indigo-400 /* Primary text on dark backgrounds */
shadow-indigo-500/20 /* Subtle indigo shadows */
```

### Semantic Colors
```css
/* Success/Positive */
bg-emerald-50/40 dark:bg-emerald-950/10
text-emerald-600 dark:text-emerald-400
border-emerald-100/30 dark:border-emerald-950/30

/* Warning/Attention */
bg-amber-50/40 dark:bg-amber-950/10
text-amber-600 dark:text-amber-400
border-amber-100/30 dark:border-amber-950/30

/* Error/Negative */
bg-rose-50/40 dark:bg-rose-950/10
text-rose-600 dark:text-rose-400
border-rose-100/30 dark:border-rose-950/30

/* Info */
bg-blue-50/40 dark:bg-blue-950/10
text-blue-600 dark:text-blue-400
border-blue-100/30 dark:border-blue-950/30

/* Neutral */
bg-slate-50/40 dark:bg-slate-950/10
text-slate-600 dark:text-slate-400
border-slate-100/30 dark:border-slate-850/30
```

### Background Colors
```css
/* Light mode backgrounds */
bg-white              /* Primary card backgrounds */
bg-slate-50           /* Secondary surfaces */
bg-slate-100/50       /* Subtle overlays */

/* Dark mode backgrounds */
dark:bg-slate-900     /* Primary card backgrounds */
dark:bg-slate-950     /* Secondary surfaces */
dark:bg-slate-950/40  /* Subtle overlays */
```

### Border Colors
```css
/* Light mode borders */
border-[#E5E7EB]      /* Default borders (slate-200 equivalent) */
border-slate-200/50   /* Subtle borders */

/* Dark mode borders */
dark:border-slate-800 /* Default borders */
dark:border-slate-850 /* Subtle borders */
```

### Text Colors
```css
/* Primary text */
text-slate-800 dark:text-white

/* Secondary text */
text-gray-500 dark:text-gray-400

/* Tertiary text */
text-slate-500 dark:text-slate-400

/* Accent text */
text-indigo-600 dark:text-indigo-400
```

---

## 🔤 Typography

### Font Families
```css
font-heading    /* Used for headings and titles */
font-sans       /* Default body font */
font-mono       /* Used for numbers, codes, and technical text */
```

### Font Weights
```css
font-black      /* 900 - Headings, important labels */
font-extrabold   /* 800 - Subheadings */
font-bold        /* 700 - Bold text */
font-semibold    /* 600 - Semi-bold */
font-medium      /* 500 - Medium emphasis */
font-normal      /* 400 - Regular text */
```

### Font Sizes
```css
text-xs         /* 12px - Captions, labels, small text */
text-sm         /* 14px - Body text, secondary information */
text-base       /* 16px - Primary body text */
text-lg         /* 18px - Subheadings */
text-xl         /* 20px - Headings */
text-2xl        /* 24px - Section titles */
text-3xl        /* 30px - Page titles */
```

### Heading Patterns
```jsx
// Page titles
<h1 className="font-heading font-black text-xl text-slate-800 dark:text-white">
  Page Title
</h1>

// Section titles
<h2 className="font-heading font-black text-base text-slate-800 dark:text-white">
  Section Title
</h2>

// Card titles
<h3 className="font-heading font-black text-sm text-slate-800 dark:text-white truncate">
  Card Title
</h3>

// Subheadings
<h4 className="font-heading font-black text-sm">
  Subheading
</h4>
```

### Text Styles
```jsx
// Uppercase labels (badges, tags)
<span className="text-[9px] font-bold uppercase tracking-wider">
  Label
</span>

// Monospace text (numbers, codes)
<span className="font-mono font-bold">
  1234
</span>

// Truncated text
<span className="truncate">
  Long text that might overflow
</span>

// Line clamping
<p className="line-clamp-2">
  Multi-line text that should be clamped to 2 lines
</p>
```

---

## 📐 Spacing & Layout

### Spacing Scale
```css
/* Micro spacing */
gap-1        /* 4px */
gap-1.5      /* 6px */
gap-2        /* 8px */
gap-2.5      /* 10px */

/* Small spacing */
gap-3        /* 12px */
gap-4        /* 16px */

/* Medium spacing */
gap-5        /* 20px */
gap-6        /* 24px */

/* Large spacing */
gap-8        /* 32px */
```

### Container Patterns
```jsx
// Main page container
<div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col pb-16">
  {/* Content */}
</div>

// Content container with max-width
<div className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col gap-6">
  {/* Content */}
</div>

// Card container
<div className="mx-auto w-full max-w-3xl px-6 pt-6">
  {/* Tabs or headers */}
</div>
```

### Layout Patterns
```jsx
// Flex column with gap
<div className="flex flex-col gap-4">
  <Item />
  <Item />
  <Item />
</div>

// Flex row with gap
<div className="flex flex-row gap-3">
  <Item />
  <Item />
</div>

// Grid layouts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>

// Centered content
<div className="flex items-center justify-center">
  <Content />
</div>
```

---

## 🧩 Component Patterns

### Empty States
```jsx
function EmptyState({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
      <span className="text-4xl md:text-5xl mb-3">{icon}</span>
      <h3 className="font-heading font-black text-base text-slate-800 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
```

### Loading States
```jsx
<div className="flex items-center justify-center min-h-[200px]">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
</div>
```

---

## 🃏 Cards & Containers

### Card Styles
```jsx
// Primary card (most common)
<div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] shadow-sm">
  {/* Content */}
</div>

// Card with hover effect
<div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>

// Gradient card
<div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-indigo-950/40 dark:to-slate-950/60 border border-slate-850 rounded-[2rem] shadow-md">
  {/* Content */}
</div>

// Tier-specific card
<div className={`rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 p-5
  bg-emerald-50/40 dark:bg-emerald-950/10
  border-emerald-100/30 dark:border-emerald-950/30
  hover:shadow-emerald-500/10
`}>
  {/* Content */}
</div>
```

### Card Sizes
```jsx
// Small card (for compact information)
<div className="rounded-2xl border border-[#E5E7EB] dark:border-slate-800 p-4">
  {/* Content */}
</div>

// Medium card (most common)
<div className="rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 p-5">
  {/* Content */}
</div>

// Large card (for detailed content)
<div className="rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 p-6">
  {/* Content */}
</div>
```

### Card Headers
```jsx
// Card with header section
<div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] overflow-hidden">
  <div className="px-5 py-3.5 bg-slate-100/50 dark:bg-gray-800/40 border-b border-slate-100 dark:border-slate-800">
    <h3 className="font-heading font-black text-sm">Header</h3>
  </div>
  <div className="p-5">
    {/* Content */}
  </div>
</div>
```

---

## 🔘 Buttons

### Primary Buttons
```jsx
// Primary action button
<button className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition">
  Action
</button>

// Primary button with icon
<button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition">
  <Icon className="w-4 h-4" />
  Action
</button>
```

### Secondary Buttons
```jsx
// Secondary button
<button className="px-4 py-2 text-xs font-bold rounded-full transition-all border bg-white dark:bg-slate-900 text-slate-550 border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-50">
  Action
</button>

// Active secondary button
<button className="px-4 py-2 text-xs font-bold rounded-full transition-all border bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white">
  Active
</button>
```

### Icon Buttons
```jsx
// Circular icon button
<button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-55 active:scale-95">
  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
</button>

// Square icon button
<button className="p-2 rounded-xl border border-gray-200 bg-white dark:bg-slate-900 hover:bg-gray-50 transition">
  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
</button>
```

### Button States
```jsx
// Disabled state
<button disabled className="opacity-60 cursor-not-allowed">
  Disabled
</button>

// Loading state
<button className="flex items-center gap-2">
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  Loading...
</button>
```

---

## 🏷️ Tabs & Navigation

### Pill Tabs (Primary Pattern)
```jsx
<div className="flex bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-1.5 rounded-[1.75rem] shadow-sm">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-[1.25rem] transition-all
        ${
          activeTab === tab.id
            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        }
      `}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Scope Selector Tabs
```jsx
<div className="flex justify-center gap-2">
  {scopes.map((scope) => (
    <button
      key={scope}
      onClick={() => setScope(scope)}
      className={`px-4 py-2 text-xs font-bold rounded-full transition-all border
        ${
          currentScope === scope
            ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white"
            : "bg-white dark:bg-slate-900 text-slate-550 border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-50"
        }
      `}
    >
      {scope.label}
    </button>
  ))}
</div>
```

### Navigation Buttons
```jsx
// Back button
<button
  onClick={() => router.push("/")}
  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-55 active:scale-95"
  aria-label="Back"
>
  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
</button>
```

---

## 📝 Forms & Inputs

### Text Inputs
```jsx
<input
  type="text"
  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
  placeholder="Enter text..."
/>
```

### Select Dropdowns
```jsx
<select className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

### Checkboxes
```jsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="h-5 w-5 rounded-xl border-gray-300 text-indigo-500 focus:ring-indigo-500"
  />
  <span className="text-sm text-slate-800 dark:text-white">
    Checkbox label
  </span>
</label>
```

### Radio Buttons
```jsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="radio"
    name="group"
    className="h-5 w-5 border-gray-300 text-indigo-500 focus:ring-indigo-500"
  />
  <span className="text-sm text-slate-800 dark:text-white">
    Radio label
  </span>
</label>
```

---

## ✨ Animations & Transitions

### Page Transitions
```jsx
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -15 }}
  transition={{ duration: 0.25, ease: "easeInOut" }}
>
  {/* Content */}
</motion.div>
```

### Staggered Animations
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### Hover Animations
```jsx
// Scale on hover
<div className="transition-all hover:scale-101">
  Content
</div>

// Shadow on hover
<div className="transition-shadow hover:shadow-md">
  Content
</div>

// Color change on hover
<button className="transition-colors hover:bg-indigo-600">
  Button
</button>
```

### Button Animations
```jsx
<motion.button
  whileHover={{ scale: 1.01, y: -2 }}
  whileTap={{ scale: 0.99 }}
  className="transition-all"
>
  Button
</motion.button>
```

### Loading Animations
```jsx
// Spin animation
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>

// Pulse animation
<div className="animate-pulse">
  Loading...
</div>

// Bounce animation
<div className="animate-bounce">
  🔺
</div>
```

### Dynamic Financial Bars
```jsx
// Use rounded-full bars with transition-all duration-1000 for smooth fill
<div className="flex-grow h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
  <div
    className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## 💰 Financial & Transaction UIs

### Transaction Logs
For transaction history or ledger displays:
- Use circular emoji/icon badges with a subtle glowing background (e.g. `bg-green-100 dark:bg-green-900/40`) to quickly denote earn/spend.
- Ensure the transaction amount is strictly right-aligned and bold/black `text-[15px]`.
- Add an interactive hover state on the row `hover:bg-slate-50 dark:hover:bg-slate-900/20` to signify clickability if needed.

```jsx
<div className="flex items-center justify-between p-3 rounded-xl border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10">
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
      <span className="text-lg">💰</span>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-slate-200">Race Prize</p>
      <p className="text-xs font-medium text-slate-500">Day 45</p>
    </div>
  </div>
  <span className="font-black tracking-tight text-[15px] text-green-600 dark:text-green-400">
    +$500
  </span>
</div>
```

### Stat Cards (Dashboards)
For high-level statistics like "Total Earned":
- Use `rounded-2xl` and a subtle `hover:scale-[1.02]` pop.
- Labels should be small, bold, and uppercase with `tracking-wider` spacing.
- Values should use `font-heading font-black`.

```jsx
<div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/30 p-4 transition-transform hover:scale-[1.02] shadow-sm">
  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Total Earned</div>
  <div className="text-xl font-black font-heading text-green-600 dark:text-green-400">$2,400</div>
</div>
```

---

## ♿ Accessibility

### ARIA Attributes
```jsx
// Tabs
<div role="tablist">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls={`tab-${id}`}
  >
    Tab Label
  </button>
</div>

// Tab panels
<div
  role="tabpanel"
  id={`tab-${id}`}
  aria-labelledby={`tab-button-${id}`}
>
  Content
</div>

// Buttons
<button
  aria-label="Descriptive label for screen readers"
  aria-disabled={isDisabled}
>
  Button
</button>

// Inputs
<input
  aria-label="Input label"
  aria-describedby="input-help"
/>
<div id="input-help">Help text</div>
```

### Keyboard Navigation
```jsx
// Focus states
<button className="focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
  Button
</button>

// Skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Screen Reader Only
```css
/* Add to global CSS */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Usage
<span className="sr-only">Hidden text for screen readers</span>
```

### Color Contrast
- Ensure text has at least 4.5:1 contrast ratio against background
- Use `text-slate-800` on white, `text-white` on dark backgrounds
- Avoid using color alone to convey information

---

## 📱 Responsive Design

### Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Responsive Patterns
```jsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop content
</div>

// Show on mobile, hide on desktop
<div className="md:hidden">
  Mobile content
</div>

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl">
  Responsive heading
</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Responsive grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

### Touch Targets
- Minimum touch target size: 44x44px
- Add padding to ensure adequate touch area
- Use `min-w-[44px] min-h-[44px]` for small interactive elements

### Mobile Optimizations
```jsx
// Scrollable tabs
<div className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/20">
  {tabs.map((tab) => (
    <button key={tab.id} className="shrink-0">
      {tab.label}
    </button>
  ))}
</div>

// Truncated text on mobile
<p className="truncate md:whitespace-normal">
  Long text that should truncate on mobile
</p>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <Item />
  <Item />
</div>
```

---

## 🌙 Dark Mode Support

### Color Mode Pattern
```jsx
// Background
<div className="bg-white dark:bg-slate-900">
  Content
</div>

// Text
<p className="text-slate-800 dark:text-white">
  Text
</p>

// Border
<div className="border border-[#E5E7EB] dark:border-slate-800">
  Content
</div>
```

### Dark Mode Variants
```jsx
// For tier-specific styling
const tierConfig = {
  local: {
    bg: "bg-emerald-50/40 dark:bg-emerald-950/10",
    border: "border-emerald-100/30 dark:border-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400"
  },
  // ... other tiers
};
```

### Dark Mode Testing
- Test all components in both light and dark modes
- Ensure proper contrast in both modes
- Check that all interactive elements are visible in both modes
  
---

## 💻 Code Structure

### Component Organization
```
components/
├── features/          # Feature-specific components
│   └── social/
│       └── social-screen.tsx
├── shared/           # Shared/reusable components
│   ├── buttons/
│   ├── cards/
│   └── forms/
└── layout/           # Layout components
    ├── headers/
    └── footers/
```

### File Structure
```jsx 
// Component file structure
"use client";

import { motion } from "framer-motion";
import { Icon } from "lucide-react";
import { useState } from "react";

// Constants and types
type ComponentProps = {
  // props
};

// Helper functions
function helperFunction() { /* ... */ }

// Sub-components
function SubComponent() { /* ... */ }

// Main component
export function MainComponent({ /* props */ }: ComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => { /* ... */ }, []);
  
  // Handlers
  const handleAction = () => { /* ... */ };
  
  // Render
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### Naming Conventions
- **Components**: PascalCase (`SocialScreen`, `RaceCard`)
- **Functions**: camelCase (`handleTabChange`, `formatCurrency`)
- **Variables**: camelCase (`activeTab`, `currentDayIndex`)
- **Constants**: UPPER_SNAKE_CASE (`TAB_CONFIG`, `DEFAULT_SETTINGS`)
- **CSS classes**: kebab-case (`font-heading`, `rounded-[2rem]`)

### Props
- Use TypeScript interfaces for component props
- Provide default values where appropriate
- Document required vs optional props

### Imports
- Group imports by source (React, external, internal)
- Use absolute imports with `@/` alias
- Order: React, external libraries, internal components, types, utilities

---

## 📚 Best Practices

### Do's
✅ Use the established color system and typography patterns  
✅ Maintain consistency with existing components  
✅ Add proper accessibility attributes  
✅ Test responsive behavior on multiple screen sizes  
✅ Use meaningful component and variable names  
✅ Add TypeScript types for all props and state  
✅ Use motion for animations and transitions  
✅ Follow the dark mode pattern for all components  

### Don'ts
❌ Don't create one-off styles - use the design system  
❌ Don't hardcode colors - use the established color tokens  
❌ Don't forget dark mode support  
❌ Don't skip accessibility attributes  
❌ Don't use arbitrary values without documentation  
❌ Don't create components that are too specific  
❌ Don't forget to test on mobile devices  

---

## 🔍 Quality Checklist

Before merging any UI changes, ensure:

- [ ] All components follow the established design patterns
- [ ] Dark mode works correctly for all new components
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] All interactive elements have proper accessibility attributes
- [ ] Color contrast meets WCAG standards (4.5:1 minimum)
- [ ] All text is readable and properly sized
- [ ] Animations are smooth and not excessive
- [ ] Touch targets are at least 44x44px
- [ ] Component names and props are properly typed
- [ ] Code follows the established structure and patterns

---

## 📖 Examples

### Complete Component Example

```jsx
"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";

type TabType = "today" | "upcoming";

const TAB_CONFIG = [
  { id: "today" as const, label: "Today", icon: "🏁" },
  { id: "upcoming" as const, label: "Upcoming", icon: "🔮" },
] as const;

export function RaceCalendar({ races, onRaceClick }) {
  const [activeTab, setActiveTab] = useState<TabType>("today");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full max-w-3xl mx-auto flex flex-col"
    >
      {/* Tabs */}
      <div className="w-full px-6 pt-6">
        <div className="flex bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-1.5 rounded-[1.75rem] shadow-sm">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-[1.25rem] transition-all
                ${activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <span className="mr-1">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="w-full max-w-3xl mx-auto px-6 py-6 flex-1 flex flex-col gap-4">
        {activeTab === "today" && (
          <div className="flex flex-col gap-3">
            {races.map((race) => (
              <motion.div
                key={race.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-5"
              >
                <h3 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                  {race.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {race.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
```

---

## 🔗 Related Files

- [`social-screen.tsx`](./src/features/social/social-screen.tsx) - Reference implementation
- [`race-calendar.tsx`](./src/components/scheduling/race-calendar.tsx) - Example following guidelines
- [`tailwind.config.js`](./tailwind.config.js) - Tailwind configuration
- [`globals.css`](./src/app/globals.css) - Global styles

---

## 📝 Changelog

### v1.1 (2026-07-18)
- Added guidelines for Financial UIs (Transaction Logs, Stat Cards)
- Added documentation for dynamic financial bars and smooth width transitions
- Established `font-heading font-black tracking-tight` for massive balance numbers

### v1.0 (2026-07-18)
- Initial guidelines based on social-screen.tsx patterns
- Added comprehensive component patterns
- Included accessibility and responsive design guidelines
- Added examples and best practices

---

*This document serves as the single source of truth for UI/UX decisions in Run-Quest. Always refer to this guide when creating new components or updating existing ones.*
