# S-07 — Architecture Decision Records (ADRs)

This document provides a concise, technically defensible record of the three principal architectural and design decisions adopted in the **Rukn (رُكن)** specialty coffee preorder platform.

---

## DECISION 01: ARCHITECTURE AND TECHNOLOGY

### القرار:
Decoupled client-server architecture consisting of an **ASP.NET Core Web API (.NET 8)** backend, a **PostgreSQL** relational database managed via **Entity Framework Core 8**, and an independent **Next.js (App Router, React 19, TypeScript)** frontend, supplemented by **SignalR** (`/hubs/orders`) for duplex real-time event broadcasting.

### البدائل التي فكرت فيها:
1. **Full Monolith (ASP.NET Core MVC / Razor Pages / Blazor Server)**: A single deployable project where views are server-rendered by C#.
2. **Node.js / Express or NestJS Fullstack**: Unifying the entire stack in TypeScript.
3. **HTTP Polling instead of SignalR**: Relying on periodic client-side polling every 3–5 seconds to detect status changes.
4. **SQLite / In-Memory Database**: Forgoing PostgreSQL in favor of a local file-based database.

### لماذا اخترت هذا تحديدًا (اربطه بالطلب أو الجمهور أو القيود):
- **Domain Reliability & Data Integrity**: .NET 8 provides strong typing, enterprise-grade dependency injection, robust transactional boundaries, and native async concurrency. This ensures reliable stock accounting and lifecycle enforcement.
- **Arabic-First UX & Fast Interactive UI**: Next.js App Router with React 19 allowed us to deliver an RTL-first, server-rendered landing page with client-side reactive components (preorder modal, live tracking timeline with smooth animations).
- **Relational Integrity with PostgreSQL**: PostgreSQL provides robust check constraints (`CK_Orders_CancellationReason`), custom enum types (`order_status`), and atomic row-level updates.
- **Immediate Push via SignalR**: Baristas need to see new preorders immediately without refreshing the dashboard, and customers expect their tracking timeline to transition automatically when their coffee is ground, brewed, ready, or delivered.

### ما الذي ضحّيت به مقابله؟
- **Increased Complexity**: Managing two separate runtimes (.NET SDK and Node.js), dual dependency trees (`csproj` vs `package.json`), independent dev servers (ports 5000 and 3000), and CORS credential negotiation (`Access-Control-Allow-Credentials: true`).
- **SignalR Connection State Management**: Required implementing client-side reconnection logic and fallback REST synchronization upon reconnect.

### لو كان الوقت ضعفين، ماذا كنت ستغيّر؟
1. Introduce a **SignalR Backplane** (e.g., PostgreSQL `LISTEN`/`NOTIFY` or Redis Pub/Sub) to allow horizontal scaling across multiple API replicas without losing group subscriptions.
2. Implement **BFF (Backend-For-Frontend) session proxying** or Next.js server actions to eliminate browser CORS overhead entirely.
3. Add automated contract validation using generated TypeScript clients directly from the OpenAPI/Swagger specification.

---

## DECISION 02: ORDER LIFECYCLE AND DATA INTEGRITY

### القرار:
Enforcing strict, unidirectional order lifecycle transitions directly in the domain service and database, supported by **atomic database-level inventory decrement/restoration** (`ExecuteUpdateAsync`), historical price/name snapshotting, and strict PostgreSQL check constraints for cancellations. The official lifecycle consists of:
`New` (جديد) ➔ `Preparing` (قيد التحضير) ➔ `Ready` (جاهز للاستلام), extended by an additional terminal completion enhancement `Completed` (تم التسليم) and a terminal cancellation workflow `Cancelled` (ملغي) requiring a mandatory cancellation reason.

### البدائل التي فكرت فيها:
1. **In-Memory Locks / SemaphoreSlim**: Synchronizing stock decrement with C# locking before calling `SaveChangesAsync()`.
2. **Distributed Locks via Redis (Redlock)**: Acquiring a distributed mutex per coffee ID.
3. **Allowing Free-Form Status Updates**: Allowing staff to transition an order back and forth between any status without state machine validation.
4. **Foreign Key Reference without Snapshots**: Computing total order price dynamically by referencing `DailyCoffees.Price`.

### لماذا اخترت هذا تحديدًا (اربطه بالطلب أو الجمهور أو القيود):
- **Atomic Stock Protection Without External Infrastructure**: In a constrained assessment timeline without external dependencies like Redis, `ExecuteUpdateAsync` applies `SET AvailableQuantity = AvailableQuantity - Quantity WHERE Id = @id AND AvailableQuantity >= @quantity` within an explicit database transaction. If rows affected equals 0, the stock is depleted, completely eliminating overselling under concurrent requests.
- **Historical Immutability**: If a barista modifies the daily coffee price or name later in the week, past orders must retain their historical purchased price and coffee title (`UnitPriceSnapshot`, `CoffeeNameSnapshot`).
- **Enforced Cancellation Integrity**: Cancellation is permitted strictly from `New` and `Preparing` states. It restores reserved cups back to stock exactly once within an atomic database transaction. An EF Core migration enforces a PostgreSQL check constraint (`CK_Orders_CancellationReason`) guaranteeing that cancelled orders have a non-empty reason while active orders have null.
- **State Transition Guard**: Invalid transitions (e.g., trying to cancel a `Ready` or `Completed` order, or reverting `Ready` to `New`) are rejected with descriptive domain validation errors.

### ما الذي ضحّيت به مقابله؟
- **Slightly Higher Database Contention**: Atomic updates lock the specific coffee row during the transaction, introducing minimal database serialization under extreme burst concurrency compared to eventual-consistency queuing.
- **Zero In-Place Deletions**: Orders cannot be physically deleted; they must be transitioned to `Cancelled`, requiring extra storage over time.

### لو كان الوقت ضعفين، ماذا كنت ستغيّر؟
1. Implement a **CQRS / Event-Sourced Order Lifecycle**: Record every state transition as an immutable `OrderEvent` (e.g., `OrderPlaced`, `OrderPreparingStarted`, `OrderReadyForPickup`, `OrderCancelled`, `InventoryRestored`) with timestamps and user IDs for a complete audit trail.
2. Implement an asynchronous queue worker with message de-duplication for burst handling during morning peak hours.

---

## DECISION 03: USER EXPERIENCE, SPECIALTY COFFEE SCOPE AND AI ASSISTANCE

### القرار:
Building an **Arabic-first, RTL-native, minimal specialty coffee preorder experience** focused strictly on the "Daily Brew" concept rather than a bloated e-commerce catalog. The customer interface emphasizes single-tap preordering via modal, zero-login tracking via reference code, live 4-stage visual timeline, dark/light theme support, and a responsive staff management dashboard with touch targets $\ge 44$px.

### البدائل التي فكرت فيها:
1. **Full Multi-Category E-Commerce Store**: Implementing shopping carts, customer authentication/registration, loyalty points, multi-item checkout, and delivery driver tracking.
2. **Generic Dashboard Template**: Using an off-the-shelf English admin template and flipping it to RTL.
3. **Desktop-Only Interface**: Focusing exclusively on desktop screens and neglecting mobile viewports.

### لماذا اخترت هذا تحديدًا (اربطه بالطلب أو الجمهور أو القيود):
- **Specialty Coffee Philosophy**: Moroccan specialty coffee lovers value the uniqueness of the single origin beans brewed daily. A single focused offering with limited cup availability creates authentic exclusivity and eliminates cognitive overload.
- **Frictionless Customer Flow**: Forcing account registration to buy a single morning coffee leads to high drop-off rates. Allowing quick preorders with an order reference code (`RUKN-YYYYMMDD-XXXXXX`) makes ordering instantaneous.
- **Operational Ergonomics for Staff**: Baristas work on tablets or phones behind the espresso machine. Touch targets must be generous ($\ge 44$px), status progression must take a single tap, and dark mode reduces eye strain in dimly lit café environments.
- **Accessible RTL Typography**: Integrating `IBM Plex Sans Arabic` with carefully tuned contrast ensures legibility across mobile screens down to 320px width.

### ما الذي ضحّيت به مقابله؟
- **Feature Breadth**: Sacrificed complex features like online card payment processing, customer accounts, and scheduled recurring subscriptions in favor of high quality in the core preorder and tracking loop.
- **Custom Design Overhead**: Building custom RTL components (modal popups, 4-stage animated timeline, charts) required custom CSS and testing across viewports rather than importing generic LTR UI libraries.

### لو كان الوقت ضعفين، ماذا كنت ستغيّر؟
1. Add an interactive **Barista Sound Notification** (Web Audio API) when a new order arrives on the dashboard.
2. Add **PWA (Progressive Web App) Manifest & Web Push Notifications** so customers receive a phone notification when their coffee status becomes "Ready for Pickup" even if their browser tab is closed.

---

### Use of AI-Assisted Development Tools

AI tools were used throughout the development process as engineering support tools, particularly for:

- **Code Review:** Reviewing implementation approaches and identifying potential code quality issues.
- **Debugging Assistance:** Investigating errors, analyzing unexpected behavior and suggesting possible fixes.
- **Code Quality:** Identifying potential code duplication, unnecessary complexity and opportunities for refactoring.
- **Documentation:** Improving code comments, technical explanations and project documentation.
- **Architecture:** Evaluating architectural alternatives and suggesting improvements to maintainability and separation of concerns.
- **Security Review:** Identifying potential security weaknesses and recommending appropriate mitigation strategies.
- **UI/UX:** Reviewing interface consistency, responsiveness, accessibility and user experience.

AI-generated suggestions were treated as recommendations rather than automatically accepted solutions. Implementation decisions remained subject to developer review, adaptation and verification.

The developer retained responsibility for the architecture, implementation, technical decisions and final validation of the application.
