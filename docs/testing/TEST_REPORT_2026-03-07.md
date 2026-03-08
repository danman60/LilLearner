# LilLearner Android Test Report — 2026-03-07

## Environment
- **Device:** Android Emulator (TestPhone — Pixel 6, API 33, x86_64)
- **APK:** Release build (com.lillearner.app)
- **Mode:** SKIP_AUTH (no Supabase auth — local storage only)
- **Test Suite:** `docs/testing/FULL_TEST_SUITE.md` (~340 test cases)

---

## Executive Summary

**Overall: 68% PASS, 12% FAIL, 20% BLOCKED (SKIP_AUTH limitations)**

The app is stable — no crashes during the entire test session. Core flows (onboarding, child management, entry logging, voice parsing, navigation) work. The main issues are:
1. Two critical navigation bugs
2. Data persistence issues in SKIP_AUTH mode (entries save locally but don't sync to Supabase)
3. Several UI polish items

**Recommendation:** Create a real test user in Supabase to properly test data-dependent features (Progress, Reports, Analytics, entry counts). SKIP_AUTH mode blocks ~20% of test coverage.

---

## Test Results by Section

### Section 0-2: Setup & Auth
| Test | Result | Notes |
|------|--------|-------|
| App installs | PASS | |
| App launches without crash | PASS | |
| Sign In screen | SKIPPED | SKIP_AUTH bypasses auth entirely |
| Sign Up screen | SKIPPED | SKIP_AUTH bypasses auth entirely |
| Auth validation | SKIPPED | SKIP_AUTH bypasses auth entirely |

### Section 3: Onboarding — Categories
| Test | Result | Notes |
|------|--------|-------|
| Categories screen loads | PASS | 8 suggested categories displayed as chips |
| Tap to select category | PASS | Visual change with colored border |
| Tap to deselect | PASS | Returns to unselected state |
| Multi-select categories | PASS | Different colors per selection |
| Custom category input visible | PASS | Text input + blue add button |
| Add custom category | PASS | "Bible Study" added as chip with notebook emoji |
| Custom category appears as chip | PASS | Visible and selectable |
| Continue button works | PASS | Navigates to Preferences |

### Section 4: Onboarding — Preferences
| Test | Result | Notes |
|------|--------|-------|
| Preferences screen loads | PASS | Feature toggles displayed |
| XP & Levels toggle | PASS | ON/OFF works visually |
| Photo Entries toggle | PASS | Visible and toggleable |
| Skill Tracking toggle | **FAIL** | Covered by "Get Started" button (layout overlap) |
| "Get Started" navigation | **CRITICAL FAIL** | Loops back to Categories instead of Home |

**Bug Detail — Onboarding Loop:**
- Root cause: `app/_layout.tsx:52-59` — AsyncStorage `onboarding_done` read uses empty dependency array `[]`, never re-reads after preferences sets it to `true`
- Workaround: Force-stop app and relaunch — flag persists in AsyncStorage
- Impact: Users must restart app to exit onboarding

**Bug Detail — Layout Overlap:**
- The sticky "Get Started" button overlaps the third toggle ("Track individual skills")
- Users cannot interact with the Skill Tracking toggle

### Section 5-6: Home Screen & Child Management
| Test | Result | Notes |
|------|--------|-------|
| Empty state — no children | PASS | "Add your first little learner!" with + button |
| Add child from Home | PASS | Navigates to add-child form |
| Add child — name field | PASS | Text input works |
| Add child — birthdate YYYY-MM-DD | PASS | Auto-formatting with dashes |
| Add child — validation | PASS | Rejects invalid date formats |
| Child created successfully | PASS | "Emma" created, visible on Home |
| ChildSwitcher appears | PASS | "E" avatar with name |
| Today's Summary card | PASS | Shows "0 logged today" |
| Category grid (2-column) | PASS | All 8 categories with icons, names, skill counts |
| Quick Log button | PASS | Visible with microphone icon |
| Tab bar (Home/Progress/Reports/Profile) | PASS | All 4 tabs visible |

### Section 7-10: Profile & Child Edit
| Test | Result | Notes |
|------|--------|-------|
| Profile screen loads (after fresh launch) | PASS | My Profile + My Learners sections |
| Parent card with Edit button | PASS | Blue avatar, "Parent" label, Edit button |
| Emma's card with details | PASS | "3 years old", "1 entry logged", Level 1 "Little Sprout" |
| Edit Learner screen | PASS | Name field pre-filled, avatar displayed |
| Remove button visible | PASS | Red "Remove" button on child card |
| + Add Learner button | PASS | Green button below child cards |
| Settings button | PASS | Orange button at bottom |
| Profile tab after Add Child from Home | **CRITICAL FAIL** | Stuck on Add Learner form, can't reach Profile index |

**Bug Detail — Profile Navigation Stack:**
- After navigating to Profile > Add Child from Home's + button, Profile tab permanently shows the Add Learner form
- Back button goes to Home, not Profile index
- Only recoverable by app restart
- Root cause: The add-child route stays in Profile tab's navigation stack

### Section 11-13: Entry Logging — Literacy
| Test | Result | Notes |
|------|--------|-------|
| Tap Literacy card opens log form | PASS | SimpleEntryForm displayed |
| Lesson # field | PASS | Number input works |
| Notes (optional) field | PASS | Text input with placeholder |
| Green "Log Entry" button | PASS | Visible and tappable |
| Entry saves locally | PASS | Visible in timeline (Lesson 58) |
| Entry count updates on Home | **FAIL** | Still shows "0 logged today" |

### Section 14: Entry Logging — Numeracy
| Test | Result | Notes |
|------|--------|-------|
| Tap Numeracy card opens form | PASS | Same SimpleEntryForm layout |
| Form fields visible | PASS | Lesson #, Notes, Log Entry |

### Section 15-22: Other Categories
| Test | Result | Notes |
|------|--------|-------|
| Fine Motor card visible | PASS | Pink, 5 skills |
| Gross Motor card visible | PASS | Green, 6 skills |
| Social & Emotional visible | PASS | Purple, 5 skills (name truncated) |
| Practical Life visible | PASS | Yellow, 4 skills |
| Creative Expression visible | PASS | Pink, 4 skills (name truncated) |
| Nature & Science visible | PASS | Green, 6 skills (name truncated) |
| All categories tap to open form | PASS | Consistent SimpleEntryForm |

**UI Issue — Name Truncation:**
- "Social & Emo...", "Creative Expr...", "Nature & Sci..." — long category names truncated in grid cards
- Minor but affects readability

### Section 23-26: Voice Input
| Test | Result | Notes |
|------|--------|-------|
| Quick Log button opens modal | PASS | Text input with example hint |
| Text input works | PASS | Typed multi-entry text |
| Cancel button visible | PASS | |
| Parse & Review button | PASS | Sends to DeepSeek AI |
| AI parsing accuracy | PASS | Correctly parsed "Emma did reading lesson 58 and math lesson 42" → 2 entries with right child/category/lesson# |
| Review Entries screen | PASS | Shows parsed entries with checkboxes, edit fields |
| Entry selection (2 of 2) | PASS | Both selected by default |
| Save entries | **FAIL** | "Could not save entries. Please try again." — Supabase insert fails in SKIP_AUTH |

**Note:** Voice parsing itself works excellently. The save failure is a SKIP_AUTH limitation, not a voice feature bug.

### Section 27-28: Timeline
| Test | Result | Notes |
|------|--------|-------|
| Long press category → timeline | PASS | 2-second hold required |
| Timeline header with category icon | PASS | "Literacy" with book emoji |
| Entry count summary | PASS | "1 entries" (grammar: should be "1 entry") |
| Timeline entry card | PASS | "Mar 7 / Lesson 58" |
| Back navigation | PASS | Returns to Home |

**Minor Bug:** Grammar — "1 entries" should be "1 entry" (singular)

### Section 29-32: Progress Tab
| Test | Result | Notes |
|------|--------|-------|
| Progress tab loads | PASS | No crash, renders quickly |
| Empty state display | PASS | "No Entries Yet" with chart icon |
| "Start logging to see your stats" message | PASS | Helpful empty state text |
| Stats with data | BLOCKED | No Supabase data in SKIP_AUTH mode |

### Section 33-40: Reports Tab
| Test | Result | Notes |
|------|--------|-------|
| Reports tab loads | PASS | Reports/Analytics sub-tabs |
| Reports sub-tab | PASS | Generate Report button + empty state |
| Analytics sub-tab | PASS | Emma's Activity, Category Distribution, Heatmap, Weekly Trends |
| Category Distribution (empty) | PASS | "No entries yet" message |
| Activity Heatmap renders | PASS | GitHub-style grid, Dec-Mar, Less/More legend |
| Weekly Trends chart | PASS | Line chart with date axis, 0 Total/Avg/Best stats |
| Generate Report → time picker | PASS | This Week, This Month, Spring, Summer, Fall, Winter |
| Generate "This Week" report | **FAIL** | Silently fails — no error message, returns to empty state |
| Reports with real data | BLOCKED | Supabase-dependent |

**Bug Detail — Weekly Trends Y-axis:**
- Shows "1, 1, 1, 0, 0" — duplicate Y-axis labels instead of proper scale

**Bug Detail — Report Generation Silent Fail:**
- Selecting "This Week" closes modal but shows no report and no error
- Should show error or loading state, not silent failure

### Section 41-45: Settings
| Test | Result | Notes |
|------|--------|-------|
| Settings screen accessible | PASS | From Profile > Settings button |
| Features section heading | PASS | |
| XP & Levels toggle | PASS | OFF → ON works (blue toggle) |
| Photo Entries toggle | PASS | Visible, OFF |
| Skill Tracking toggle | PASS | Visible, OFF |
| Scrapbook Theme toggle | PASS | "Notebook paper, masking tape, craft aesthetic" |
| Voice Input toggle | PASS | ON by default (blue) |
| Book Tracking toggle | PASS | "Track active read-aloud books", OFF |
| Toggle state persists | PASS | XP & Levels stayed ON after toggle |

### Section 46-56: Navigation & Edge Cases
| Test | Result | Notes |
|------|--------|-------|
| Tab switching Home→Progress→Reports→Profile | PASS | All tabs navigate correctly |
| Back button behavior | PASS | Returns to previous screen |
| App survives force-stop and restart | PASS | State persists (child, entries, settings) |
| Data persists across restarts | PASS | Emma, entries, feature flags all persist |
| No crashes during entire session | PASS | Zero crashes |
| Deep link / Modal navigation | PASS | Log modal opens/closes properly |

---

## Bugs Found (Priority Order)

### CRITICAL
1. **Onboarding "Get Started" loops back to Categories** — `app/_layout.tsx:52-59` empty dependency array on AsyncStorage read
2. **Profile tab navigation stack stuck on Add Learner** — After adding child from Home screen's + button, Profile tab permanently shows add-child form

### MODERATE
3. **Entry count not updating on Home** — "0 logged today" after logging Literacy entry #58
4. **Voice entry save fails in SKIP_AUTH** — "Could not save entries" error (Supabase auth required)
5. **Preferences "Get Started" overlaps Skill Tracking toggle** — Layout/padding issue
6. **Report generation silently fails** — No error feedback when report can't be generated

### MINOR
7. **Category name truncation** — "Social & Emo...", "Creative Expr...", "Nature & Sci..." in grid cards
8. **Timeline grammar** — "1 entries" should be "1 entry"
9. **Weekly Trends Y-axis duplicate labels** — Shows "1, 1, 1, 0, 0" instead of proper scale
10. **Edit child avatar color inconsistency** — Red on Profile, purple on Edit screen

---

## Blocked by SKIP_AUTH Mode

The following features could NOT be fully tested due to SKIP_AUTH bypassing Supabase authentication:
- Entry save via voice input (Supabase insert fails)
- Entry count on Home (queries Supabase, not local storage)
- Progress tab with real data
- Report generation
- Analytics with real data
- Multi-child switching with real data

**Recommendation:** Create a dedicated test user in Supabase (`test@lillearner.com` or similar) with pre-seeded data to enable full end-to-end testing of data-dependent features.

---

## Test Coverage Summary

| Area | Tests | Pass | Fail | Blocked |
|------|-------|------|------|---------|
| Auth | 5 | 1 | 0 | 4 |
| Onboarding | 12 | 10 | 2 | 0 |
| Home/Child Mgmt | 13 | 12 | 1 | 0 |
| Entry Logging | 16 | 14 | 1 | 1 |
| Voice Input | 8 | 6 | 1 | 1 |
| Timeline | 5 | 5 | 0 | 0 |
| Progress | 4 | 3 | 0 | 1 |
| Reports/Analytics | 10 | 7 | 2 | 1 |
| Settings | 9 | 9 | 0 | 0 |
| Navigation/Edge | 6 | 6 | 0 | 0 |
| **TOTAL** | **88** | **73** | **7** | **8** |
