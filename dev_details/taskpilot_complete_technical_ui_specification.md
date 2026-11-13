# TaskPilot — Complete Technical & UI Specification

> **Version:** Local Mock Checkpoint (`App.jsx`)  
> **Scope:** Complete architectural, data-model, service-layer, screen-level, and atomic UI specification, plus local Vite + React + Tailwind setup guide.

---

## 1. Tech Stack & Local Runtime Dependencies

The self-contained `App.jsx` checkpoint runs with **zero external backend or database dependencies**, persisting all state in browser `localStorage`:

* **Framework:** React 18+ / 19+ (Single-File SPA in `src/App.jsx`)
* **Build Tool:** Vite (`@vitejs/plugin-react`)
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + custom `:root` CSS variables & Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`)
* **Icons:** `lucide-react`
* **Persistence Keys:**
  * `taskpilot_tasks_mock_v1` — Serialized array of `Task` objects (auto-seeded via `createSeedTasks()` on first load).
  * `taskpilot_settings_v2` — User preferences (`density`, `autoSortDone`, `pageSize`).

---

## 2. Design System & Color Tokens

### 2.1 Color Palette (`:root`)

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--background` | `#1A1A1A` | Primary viewport canvas, input surfaces, inner cards |
| `Surface Elevated` | `#141414` | Fixed sidebar, sticky mobile header, section panels, modal shells |
| `--foreground` | `#FFFFFF` | Primary headings, active navigation labels, task titles |
| `--primary` | `#FF4D12` | Electric orange CTA buttons, `TSK-XXXX` prefixes, Q1 badges, primary chart line |
| `--secondary` | `#FFA489` | Warm peach accents, Q2 badges, In-Progress indicators, chart baseline |
| `--muted` | `#A0A0A0` | Subtitles, timestamps, inactive tabs, secondary labels |
| `--border` | `#222222` | Structural `1px solid` borders and dividers |

### 2.2 Typography Hierarchy

* **Display (`.font-display`):** `Space Grotesk` — Screen titles, KPI counters, modal headers.
* **Body / UI:** `Plus Jakarta Sans` — Task summaries, descriptions, form labels, buttons.
* **Technical (`.font-mono-tech`):** `JetBrains Mono` — `TSK-0000` keys, UUIDs, countdowns, badges, pagination counters, chart axes.

---

## 3. Data Model & Domain Services

### 3.1 `Task` Entity Schema

```ts
interface Task {
  id: string;                 // Immutable UUID v4 primary key
  tskNumber: string;          // Unique 4-digit string ("0000" - "9999")
  title: string;              // Task summary
  description: string;        // Detailed acceptance criteria / notes
  quadrant: PriorityQuadrant; // Eisenhower Matrix classification
  status: TaskStatus;         // Workflow state
  cadence: DueCadence;        // 'HOURLY' | 'DAILY' | 'WEEKLY'
  dueAt: string;              // ISO-8601 deadline timestamp
  completedAt: string | null; // ISO-8601 timestamp when marked DONE
  archivedFrom: 'DONE' | 'CANCELLED' | null; // Origin status when moved to HISTORY
  archivedAt: string | null;  // ISO-8601 timestamp when archived to HISTORY
  createdAt: string;          // ISO-8601 creation timestamp
}
```

### 3.2 Domain Enums

* **`PriorityQuadrant`:**
  1. `URGENT_IMPORTANT` (**Q1 • Do First**, weight `1`, `#FF4D12`)
  2. `NOT_URGENT_IMPORTANT` (**Q2 • Schedule**, weight `2`, `#FFA489`)
  3. `URGENT_NOT_IMPORTANT` (**Q3 • Delegate**, weight `3`, `#E5E5E5`)
  4. `NOT_URGENT_NOT_IMPORTANT` (**Q4 • Eliminate**, weight `4`, `#A0A0A0`)
* **`DueCadence`:**
  * `HOURLY` (`1H`): Default due `+1 hour` from creation/promotion.
  * `DAILY` (`24H`): Default due `23:59:00` local time today.
  * `WEEKLY` (`7D`): Default due `+7 days` at `23:59:00`.
* **`TaskStatus`:** `BACKLOG` | `TODO` | `IN_PROGRESS` | `DONE` | `CANCELLED` | `HISTORY`

### 3.3 Pure Service Modules

* **`DateService`:** Handles cadence due-date calculation (`getDefaultDueDate`), `datetime-local` formatting (`toDateTimeLocalValue`), local calendar day comparison (`isSameLocalDay`), and live relative overdue/countdown strings (`formatOverdueDuration`, `formatDueBadge`).
* **`TaskService`:** Handles UUID generation (`generateUUID`), 4-digit `TSK` zero-padding & `0000`–`9999` validation (`normalizeTskNumber`), next-available `TSK` suggestion (`suggestNextTskNumber`), boolean-to-quadrant mapping (`getQuadrantFromFlags`), overdue detection (`isTaskOverdue`), and multi-criteria sorting (`sortTasks`: Active `Q1→Q4` by earliest due date, followed by `DONE`, then `CANCELLED` at the bottom).

---

## 4. Navigation Shell & Global Feedback

* **Desktop Sidebar (`lg:w-64`, fixed):**
  * **Brand Header:** `TaskPilot` (`MATRIX // WORKSPACE`).
  * **Context-Aware Primary CTA:** `+ New Backlog Item` when on **Backlogs**, `+ New Task` on all other tabs.
  * **5 Navigation Tabs:**
    1. `Welcome back Zia` (`dashboard`) — Live orange count badge when overdue tasks exist.
    2. `Jira-Style Board` (`board`) — Total active board ticket badge.
    3. `Backlogs` (`backlogs`) — Total staged backlog ticket badge.
    4. `History` (`history`) — Total cleared Done & Cancelled ticket badge.
    5. `Settings` (`settings`) — Preferences, backup/reset, and Prisma schema.
  * **Footer Status Pill:** `SYNCED` indicator + `{done}/{total} DONE` counter.
* **Mobile Header (`lg:hidden`, sticky):** Compact brand bar + CTA button + 5-column segmented tab switcher (`Zia` | `Board` | `Backlogs` | `History` | `Settings`).
* **Toast Notification:** Fixed bottom-right alert auto-dismissing after `3000ms` via managed `useRef` timeout.

---

## 5. Screen-by-Screen & Atomic Component Breakdown

### 5.1 Screen 1: Welcome back Zia (`WelcomeDashboardTab`)
* **All Overdue Panel (`lg:col-span-5`):** Lists active (`TODO` / `IN_PROGRESS`) tasks past `dueAt`, sorted longest-overdue first. Each row displays `TSK-XXXX`, cadence badge, live overdue duration, title, quadrant label, clickable edit trigger, and a one-click **Mark Done (`✓`)** button.
* **Weekly Execution & Momentum Chart (`lg:col-span-7`):**
  * **3-Card KPI Strip:** `Completion Rate %`, `On-Time SLA %` (completed on or before `dueAt`, including archived Done items), and `Daily Pace` (`/d` + peak day).
  * **Interactive SVG Spline & Area Chart:** Smooth cubic Bezier curve for **Completed** (`#FF4D12` with gradient area fill) vs. dashed baseline for **Planned/Due** (`#FFA489`), with 7 hoverable/clickable day hitboxes updating the header readout.
  * **Cadence Progress Bars:** Completion progress for `Hourly`, `Daily`, and `Weekly` tasks.
* **Board Pipeline Status & Q1 Focus (`lg:col-span-5`):** Segmented horizontal bar across `Done`, `In Progress`, `To Do`, and `Cancelled`, 2×2 status counters, and up to 2 active **Q1 Do First** tickets.
* **Eisenhower Matrix Radar (`lg:col-span-7`):** 2×2 interactive quadrant cards (`Q1`–`Q4`) showing active counts; clicking any card jumps to the **Jira-Style Board** pre-filtered to that quadrant.

### 5.2 Screen 2: Jira-Style Board (`JiraBoardTab`)
* **Header Actions:**
  * **Clear Done (`N`):** Moves all `DONE` tasks to `HISTORY` (`archivedFrom: 'DONE'`, `archivedAt: now`).
  * **Clear Cancelled (`N`):** Moves all `CANCELLED` tasks to `HISTORY` (`archivedFrom: 'CANCELLED'`, `archivedAt: now`).
  * **View Switcher:** `Kanban` vs. `List View`.
* **Filter Toolbar (`<TaskFilterToolbar />`):** Search by `TSK-XXXX`, title, or description (`180ms` debounced), plus Cadence (`All`, `Hourly`, `Daily`, `Weekly`) and Quadrant (`All`, `Do First`, `Schedule`, `Delegate`, `Eliminate`) pills.
* **Kanban View:** 4 HTML5 drag-and-drop columns (`To Do`, `In Progress`, `Done`, `Cancelled`). Only `To Do` has a `+` quick-create button. Each card includes drag grip, `TSK-XXXX`, cadence & quadrant badges, title, description (hidden in `compact` density), live `DueBadge`, `Backlog` return button, and quick status transitions (`←`, `WIP`, `Done`, `Ban`).
* **List View:** Auto-sorts active tasks above `DONE` and `CANCELLED` (when enabled), with completion toggle checkbox, inline `<select>` status switcher, and `Backlog` return button.
* **Pagination (`<PaginationFooter />`):** Page size selector (`8`, `12`, `24`, `50` / page) and `Prev` / `Next` controls.

### 5.3 Screen 3: Backlogs (`BacklogsTab`)
* **Header Actions:** `+ Add to Backlog` button and `Tile View` (3-column grid) vs. `List View` toggle.
* **Atomic Backlog Card / Row:**
  * **Pull to Board (`↗`):** Promotes ticket from `BACKLOG` to `TODO` and recalculates a fresh `dueAt` based on its cadence.
  * **More (`⋮`) → Duplicate:** Opens `<TaskModal mode="duplicate" />` pre-filled with a new `UUID`, next available `TSK-XXXX` (auto-focused), `"{title} (I)"`, and identical description/cadence/quadrant.

### 5.4 Screen 4: History (`HistoryTab`)
* **Header & Summary Strip:** Two-step **Purge History** permanent deletion button + 3 KPI cards (`Total Archived`, `Cleared Done`, `Cleared Cancelled`).
* **Outcome Filter:** `All (N)` | `Cleared Done (N)` | `Cleared Cancelled (N)` alongside search, cadence, and quadrant filters.
* **Atomic History Row:** Displays prior outcome badge (`Done` or `Cancelled`), `TSK-XXXX`, title, `Cleared {Date • Time}` timestamp, **Restore to Board** (`TODO` with fresh deadline), **Backlog** (`BACKLOG`), and permanent delete (`Trash2`).

### 5.5 Screen 5: Settings (`SettingsTab`)
* **Interface Preferences:** `Comfortable` vs. `Compact` card density toggle and `Auto-Sort Done & Cancelled to Bottom` toggle.
* **Workspace Data Management:** `Export JSON Backup`, `Move Done & Cancelled to History`, and `Reset Demo Data`.
* **Prisma Schema Blueprint:** Copyable `schema.prisma` for upgrading to PostgreSQL + Vercel.

### 5.6 Shared Modal (`<TaskModal />`)
* Supports `create`, `edit`, and `duplicate` modes; dismissible via `X`, `Cancel`, backdrop click, or `Escape`.
* Validates unique `0000`–`9999` `TSK` numbers in real time, displays read-only `UUID`, restricts new/duplicated tickets to `To Do` or `Backlog` only, auto-updates deadline timestamps on cadence change, and maps `Urgent` + `Important` toggles to Eisenhower quadrants.