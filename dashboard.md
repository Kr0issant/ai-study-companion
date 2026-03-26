# High-Fidelity Layout & Dashboard Implementation

Based on your feedback, we'll shift from a rapid structural build to a meticulous, high-fidelity implementation. We will build one piece at a time, ensuring every component meets the "premium, wowed-at-first-glance" standard outlined in the design system, with smooth micro-animations and perfect typography. 

## Phase 1 Focus: The Container & Dashboard

### 1. Global Setup (`src/index.css` & `src/App.css`)
- **Action**: Completely re-implement the CSS foundation.
- **Details**:
  - Implement precisely customized HSL/Hex color variables that look inherently rich (no generic blues/greens).
  - Add smooth global transitions (e.g., all interactive elements have a `0.3s cubic-bezier` transition).
  - Set up a custom `webkit-scrollbar` that is elegant, thin, and uses glassmorphism principles.
  - Establish CSS utility classes for glass panels with multiple layered shadows (`box-shadow` + `drop-shadow`) to create authentic depth without dirty borders.
  - *No TailwindCSS*—we will write highly structured Vanila CSS.

### 2. The Persistent Layout (`src/layouts/DashboardLayout.jsx`)
- **Sidebar**:
  - Will use `surface-container-low` with a subtle right-side inner shadow or radial gradient to separate it from the main content without using a 1px solid line.
  - Navigation links will feature hover micro-animations (e.g., icons slightly translating right `X: 4px` on hover, accompanied by a soft background color fade).
  - Active links will use a prominent gradient indicator and bold typography.
- **Main Area Layout**:
  - Will feature a max-width wrapper so on very large screens the UI stays centered and readable.
  - Adding a very subtle ambient background gradient at the top of the screen to give the application a "glowing" effect.

### 3. The Dashboard View (`src/pages/Dashboard.jsx`)
- **Welcome Header**:
  - `Manrope` display font with a subtle color gradient applied directly to the text (e.g., `background-clip: text`) for the greeting.
- **KPI Cards (Metrics)**:
  - Complex CSS grid layout.
  - Each card will have a hover-lift effect (`transform: translateY(-4px)`) and a dynamic shadow expansion.
  - Custom iconography wrapper with soft, colored glows behind the icons.
- **Active Tasks Zone**:
  - **Toolbar Controls**:
    - A custom, sleek Search Bar.
    - Advanced filtering dropdowns (by Subject, Topic, and Priority) housed in a glassmorphic menu.
  - **"New Task" Button**: A prominent, gradient-filled CTA that opens a creation modal.
  - **Task Creation Modal**: A floating surface that allows the user to input the task title, link it to a specific Subject and Topic, and assign a Priority level (Low/Medium/High).
  - **List Visualization**:
    - List items wrapped in `framer-motion` so they slide in gently upon mounting.
    - Custom styled checkboxes with a satisfying "pop" animation when clicked.
    - Beautifully styled tag/pill indicators displaying the associated subject/topic and priority color.
- **Revision Planner (Calendar View)**:
  - A custom, beautifully styled mini-calendar taking up the revision panel.
  - The **current date** will be distinctly highlighted (e.g., with a primary gradient circle).
  - Dates with existing revision plans will have subtle dot indicators beneath the number.
  - **Interactivity**: Clicking any date on the calendar will open a sleek, glassmorphic modal or inline form allowing the user to create a new revision plan for that specific date.

## User Review Required

> [!IMPORTANT]
> The plan is fully updated to include the comprehensive filtering, searching, and advanced task creation modal for the Tasks zone, alongside the Calendar for the Revision block. 
> 
> Once you confirm this addition, I will begin writing the global CSS and building the Dashboard step by step!
