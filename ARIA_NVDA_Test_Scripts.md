# ARIA & NVDA Test Scripts — TwoHearts MVP

These are step-by-step manual accessibility (NVDA / VoiceOver) test scripts and acceptance criteria for the core flows:
- Signup → Preferences → Profile → Browse → Connect → Chat
- Keyboard navigation, focus order, and important ARIA checks

## How to run
1. Open the React app (or the single-file prototype) in your browser.
2. Use NVDA on Windows (or VoiceOver on Mac/iOS) and follow the steps.
3. Mark pass/fail and collect notes for any failures.

---

## General acceptance criteria (baseline)
- All interactive controls (buttons, inputs, links) are reachable by keyboard (Tab/Shift+Tab).
- Focus order is logical and top-to-bottom reading order.
- All images or non-text controls have accessible names (aria-label, alt, or visible label).
- Dynamic updates (toasts, new messages) are announced appropriately (aria-live).
- Modal dialogs use role="dialog" and focus is trapped; there is a clear labelled close control.

---

## 1) Signup / Create account
**Goal:** A screen reader user can create an account with keyboard only.

Steps:
1. Open app; ensure focus starts at the main landmark. If not, press Tab to reach "Get started".
2. Activate "Get started" (Enter).
3. Focus should move to the "Create account" form.
4. Navigate through the fields using Tab: Email → Display name → About → Create account button.
5. For each field, NVDA should read the label before the input; for textarea, NVDA should announce 'multiline edit'.
6. Leave email blank and try to submit — an accessible error message should appear and be readable.
7. Fill the email and submit. On success, NVDA should announce "Account created" (use aria-live region).

Acceptance:
- All labels are read; submit announces success in aria-live region.

---

## 2) Preferences / Onboarding
**Goal:** Screen reader user can set preferences.

Steps:
1. After signup, focus lands in the preferences page.
2. Tab through checkboxes: Friendship → Companionship → Relationship → Marriage.
3. NVDA should announce state (checked/unchecked) for each checkbox.
4. Tab to min & max age inputs, change values, and press 'Save preferences'.

Acceptance:
- Checkboxes and inputs are reachable and announced correctly; saving returns to Browse.

---

## 3) Browse (List of profiles)
**Goal:** Profiles are discoverable in a list layout and each card is an accessible group.

Steps:
1. From main, navigate to "Discover people".
2. Use Tab to reach each profile card. Each card should be a single group with aria-label like "Ravi profile card".
3. Within the card, Tab should reach 'View profile' and 'Connect' buttons.
4. Activate 'View profile' — the profile detail should open and NVDA announces heading with person's name.

Acceptance:
- Cards are exposed as groups; actions inside are reachable and announced.

---

## 4) Profile detail
**Goal:** Screen reader user can review details and send a connect request.

Steps:
1. In profile detail, NVDA should read the heading (person's name) and region content.
2. Tab to Connect button and activate.
3. An accessible toast (aria-live) should announce "Connection sent".

Acceptance:
- Connect action announces success.

---

## 5) Create a Match & Chat
**Goal:** When matched, the chat UI is usable for keyboard and screen reader users.

Setup:
- To simulate match in the prototype: open browser console and run:
```
localStorage.setItem('two_like_p1', JSON.stringify([localStorage.getItem('two_current')]))
```
Then connect to that profile.

Steps:
1. After mutual connect, open chat.
2. NVDA should announce "Chat" dialog or heading.
3. Tab to message composer; NVDA should announce 'multiline edit' and label 'Write a message' (or equivalent).
4. Type a message and press Enter or activate Send. New message appears in the log and aria-live should briefly announce "Message sent" (polite).
5. Ensure messages in the log are focusable (or there is a way to navigate them) and read in order.

Acceptance:
- Composer and send control are usable; messages are announced; conversation log is accessible.

---

## 6) Keyboard-only navigation test
**Goal:** Full app should be usable without a mouse.

Steps:
1. From landing, use only Tab/Shift+Tab and Enter/Space to navigate all flows: signup, prefs, browse, view profile, connect, chat, settings.
2. Ensure there are no keyboard traps.
3. Ensure focus is visible (focus outline).

Acceptance:
- No traps; all features operable by keyboard.

---

## 7) Focus management & live regions
- Ensure focus moves to the main interactive region after navigation (e.g., after clicking Get Started, focus goes to the first field).
- Toasts and notices are announced using an aria-live region (`aria-live="polite"`).
- Modal dialogs (if any) trap focus and return focus to the triggering control when closed.

---

## 8) VoiceOver (Mac) adjustments
- Same flows should be tested with VoiceOver Rotor and VO commands.
- Ensure form labels are correctly exposed and that semantics are preserved.

---

## Reporting
Use a simple spreadsheet or text file with columns: Test Case ID | Step | Expected | Actual | Pass/Fail | Notes. Save and share results; I will iterate quickly on failures.

---

Thank you — run these tests and paste failures here; I will fix issues and provide updated code.
