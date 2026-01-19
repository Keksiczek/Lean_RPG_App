# Use Cases for Lean RPG

This document outlines the three primary scenarios designed to demonstrate the value of the Lean RPG platform.

## 1. Onboarding a New Engineer to 5S
**Objective:** Rapidly upskill a new hire on workplace organization standards using AR-simulated audits.
**Scenarios:**
- **Initial Assessment:** The engineer enters a virtual "Messy Assembly Line" (see `AUDIT_SCENES` in constants). They must identify 5 red-tag items (broken tools, oil spills) within 2 minutes.
- **Learning Loop:** For every missed item, the "Lean Chatbot" (Gemini) explains the specific 5S violation (e.g., "Sort: Remove unnecessary items").
- **Certification:** The engineer runs a real-world AR scan of their assigned desk. The AI verifies it is "Optimal" and awards the "First Steps" badge.

## 2. Team Training: Ishikawa (Fishbone) Analysis
**Objective:** Standardise root cause analysis methodology across the Quality Team.
**Scenarios:**
- **The "High Defect Rate" Challenge:** The team is presented with a historical problem: "Paint defects spiked to 8% last week".
- **Collaborative Solving:** Using the `IshikawaGame` component, users drag-and-drop potential causes into 6M categories (Man, Machine, Material, etc.).
- **AI Validation:** The AI checks the logic chain (e.g., "Is 'Humidity' a 'Method' or 'Environment' issue?") and suggests missing branches. 
- **Reward:** Completing the diagram unlocks the "Problem Solver" achievement.

## 3. Gamification of the Gemba Walk
**Objective:** Turn the routine daily management walk into an engaging, data-driven activity.
**Scenarios:**
- **Zone Check-in:** The Plant Manager walks to "Assembly Line A". The generic map (`FactoryMap`) detects their location.
- **Quest Activation:** A notification pops up: "Quest Available: Find 3 Safety Risks in 10 minutes."
- **Evidence Capture:** The manager snaps photos of safety hazards. The `geminiService` analyzes the images for compliance.
- **Leaderboard Impact:** Validated observations award XP, pushing the manager up the "CI Specialist" leaderboard, fostering healthy competition among shift leaders.
