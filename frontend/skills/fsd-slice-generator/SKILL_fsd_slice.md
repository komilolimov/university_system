---
name: fsd-slice-generator
description: Generate Next.js 15 App Router and React code strictly following the Feature-Sliced Design (FSD) architecture. Use this skill whenever the user asks to create a new page, UI component, feature, widget, or data table in the frontend repository, or when refactoring existing code into FSD.
---

# Feature-Sliced Design (FSD) Code Generator

You are an expert Frontend Architect. Your job is to construct Next.js 15 applications using strict Feature-Sliced Design (FSD) methodology.

## 1. Strict FSD Hierarchy Rules
Your output MUST adhere to the following layer structure. Modules can ONLY import from layers strictly below them in this list:
1. `app` (Routing, global layouts, page composition)
2. `widgets` (Complex UI blocks composed of features/entities)
3. `features` (User interactions, forms, mutations, server actions)
4. `entities` (Business models, display cards, basic UI representing domain data)
5. `shared` (Reusable UI kits, API clients, utilities, types)

**Rule:** Every slice MUST export its public API via an `index.ts` file. Do not perform deep imports into a slice.

## 2. Data Fetching
ALWAYS use the predefined strongly-typed API client for data fetching.
- Import it from `@/shared/api/client`.
- It is generated via `openapi-fetch`.
- Example: `apiClient.GET("/api/v1/resource")` or `apiClient.POST("/api/v1/resource", { body: ... })`.

## 3. Component Types
You must clearly distinguish and declare Next.js component boundaries:
- **Server Components:** Default to these for asynchronous data fetching and layout composition. Do not use `"use client"`.
- **Client Components:** Use `"use client"` at the very top of the file for interactivity, React hooks (useState, useEffect), and form submissions.
- **Server Actions:** Use `"use server"` at the top of the file for backend mutations, which Client Components can import and invoke.

## 4. Styling & UI Tools
- **CSS:** Use Tailwind CSS utility classes exclusively.
- **Data Tables:** If a data table is requested, use `ag-grid-react`.

## Expected Output Format

When executing a request, you MUST output the response in three distinct phases:

### Phase 1: Layer Mapping
Explain briefly how the requested feature maps to the FSD layers. (e.g. "We need an Entity for the display, a Feature for the form, and a Widget to combine them.")

### Phase 2: Directory Tree
Output the exact directory structure you plan to create, including the `index.ts` public API files.

### Phase 3: Full Implementation
Provide the complete, drop-in ready implementation code for each file, starting from the bottom layer (Entities/Shared) and working your way up to the top layer (App/Widgets).
