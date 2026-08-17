# Evaluation Rubric for Alurku. GAN-Build

| Criterion | Weight | Score (1-10) | Description |
|---|---|---|---|
| **1. Functional Completeness & Zero Dead Buttons** | 30% | | All navigation links, buttons, toggles, form inputs, modals, and actions execute real API calls or state mutations with zero dead clicks or uncaught exceptions. |
| **2. Routing, Permalinks & URL Bidirectionality** | 20% | | Direct page loads, browser back/forward (popstate), and tab transitions preserve state and exact permalinks (`/my-tasks`, `/inbox`, `/leaves`, `/masuk`, etc.). |
| **3. UI/UX Consistency & Brand Guidelines** | 20% | | Adherence to alurku. brandbook: Flat yellow `#FACC15`, Navy `#111E38`, Calm Gray `#F3F4F6`, Plus Jakarta Sans typography, smooth micro-animations, no generic clichés. |
| **4. Backend API Robustness & Error Handling** | 15% | | Clean FastAPI endpoint responses, proper auth check & exception handling, no 500 errors on edge cases or empty parameters. |
| **5. Code Quality, Immutability & Clean Architecture** | 15% | | Clean state management, no direct state mutations, modular component tree, no console error spam. |

### Passing Score Threshold: >= 7.5 / 10.0
- **Plateau Condition:** If score does not improve over 2 consecutive iterations, stop and report.
