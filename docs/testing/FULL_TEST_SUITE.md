# LilLearner — Full Manual Test Suite

**Target:** Android Emulator (phone form factor)
**Date:** 2026-03-07
**App:** LilLearner (React Native / Expo)

---

## How to Use This Document

- Execute tests **in order** — later sections depend on data created in earlier ones
- Mark each test: PASS / FAIL / BLOCKED / SKIPPED
- Record device info: emulator name, API level, screen size
- Note any unexpected behavior in the "Notes" column
- Screenshots recommended for any FAIL result

### Status Key

| Symbol | Meaning |
|--------|---------|
| [ ] | Not tested |
| [P] | Pass |
| [F] | Fail |
| [B] | Blocked |
| [S] | Skipped |

---

## 0. Pre-Test Setup

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 0.1 | Launch Android emulator (phone profile, e.g. Pixel 6, API 33+) | Emulator boots to home screen | [ ] | |
| 0.2 | Install APK: `adb install app-release.apk` | Installs without error | [ ] | |
| 0.3 | Verify app icon appears in app drawer | "LilLearner" icon visible | [ ] | |
| 0.4 | Tap app icon to launch | App opens, splash screen appears briefly | [ ] | |
| 0.5 | Verify no crash on cold start | App reaches auth or home screen | [ ] | |

---

## 1. Authentication — Sign Up

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 1.1 | App shows Sign In screen on first launch | Sign In form visible with email, password fields | [ ] | |
| 1.2 | Tap "Sign Up" link at bottom | Navigates to Sign Up screen | [ ] | |
| 1.3 | Verify Sign Up form fields | Display Name, Email, Password fields visible | [ ] | |
| 1.4 | Tap Sign Up with all fields empty | Validation error shown | [ ] | |
| 1.5 | Enter display name only, tap Sign Up | Error: email/password required | [ ] | |
| 1.6 | Enter valid name + email, password < 6 chars | Error: password too short (min 6 chars) | [ ] | |
| 1.7 | Enter valid name + invalid email format + valid password | Error: invalid email | [ ] | |
| 1.8 | Enter valid name + valid email + valid password (6+ chars) | Account created, navigates to onboarding | [ ] | |
| 1.9 | Verify lined paper background decoration renders | Visual decoration visible behind form | [ ] | |
| 1.10 | Verify error messages show with red border styling | Red border/highlight on error state | [ ] | |

**Test credentials to use:**
- Name: `Test Parent`
- Email: `testparent@example.com`
- Password: `test123456`

---

## 2. Authentication — Sign In

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 2.1 | (Sign out first if needed) Navigate to Sign In | Sign In form with email + password | [ ] | |
| 2.2 | Tap Sign In with empty fields | Error displayed | [ ] | |
| 2.3 | Enter wrong email + any password | Error: invalid credentials | [ ] | |
| 2.4 | Enter correct email + wrong password | Error: invalid credentials | [ ] | |
| 2.5 | Enter correct email + correct password | Signs in, navigates to onboarding (first login) or home (returning) | [ ] | |
| 2.6 | Verify "Sign Up" link navigates to sign up screen | Navigation works | [ ] | |
| 2.7 | Kill app, relaunch | Session persists, goes straight to home (no re-login) | [ ] | |

---

## 3. Onboarding — Category Selection

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 3.1 | After first sign-up, lands on Categories screen | "Choose what to track" screen visible | [ ] | |
| 3.2 | Verify 8 suggested categories are shown as chips | Reading Lessons, Math Lessons, Language Arts, Printing, Read Alouds, Time Outside, Field Trips, Extras | [ ] | |
| 3.3 | Tap a category chip to select it | Chip toggles to selected state (visual change) | [ ] | |
| 3.4 | Tap the same chip again to deselect | Chip toggles back to unselected | [ ] | |
| 3.5 | Select multiple categories | All selected chips show selected state | [ ] | |
| 3.6 | Verify "Add Custom Category" input is visible | Text input + add button present | [ ] | |
| 3.7 | Type a custom category name (e.g. "Bible Study") | Text appears in input | [ ] | |
| 3.8 | Tap Add button | Custom category appears as a selected chip | [ ] | |
| 3.9 | Add another custom category (e.g. "Piano") | Second custom chip appears | [ ] | |
| 3.10 | Tap Next with no categories selected | Should require at least one selection (or allow empty) | [ ] | |
| 3.11 | Select 3+ categories and tap Next | Navigates to Preferences screen | [ ] | |

---

## 4. Onboarding — Preferences

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 4.1 | Preferences screen shows toggle switches | Gamification, Photo Entries, Skill Tracking, Scrapbook Theme toggles visible | [ ] | |
| 4.2 | Verify Voice Input shows as always-on (non-toggleable) | Voice Input displayed but not toggleable | [ ] | |
| 4.3 | Verify Book Tracking shows as always-on (non-toggleable) | Book Tracking displayed but not toggleable | [ ] | |
| 4.4 | Toggle Gamification ON | Switch animates to ON position | [ ] | |
| 4.5 | Toggle Photo Entries ON | Switch animates to ON position | [ ] | |
| 4.6 | Toggle Skill Tracking ON | Switch animates to ON position | [ ] | |
| 4.7 | Toggle Scrapbook Theme ON | Switch animates to ON position | [ ] | |
| 4.8 | Toggle Gamification back OFF | Switch animates to OFF position | [ ] | |
| 4.9 | Tap "Get Started" button | Navigates to main app (Home tab) | [ ] | |
| 4.10 | Kill and relaunch app | Should NOT show onboarding again — goes to home | [ ] | |

---

## 5. Home Screen — Empty State

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 5.1 | Home screen loads after onboarding | Tab bar visible at bottom with Home, Progress, Reports, Profile | [ ] | |
| 5.2 | Verify empty state message (no child added yet) | Welcome message with prompt to add a child | [ ] | |
| 5.3 | Verify ChildSwitcher shows empty or prompt state | No children to switch between | [ ] | |

---

## 6. Profile — Add First Child

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 6.1 | Tap Profile tab | Profile screen opens | [ ] | |
| 6.2 | Verify Profile Card shows parent display name | "Test Parent" (or name from signup) | [ ] | |
| 6.3 | Verify "My Learners" section shows empty state | No children listed | [ ] | |
| 6.4 | Tap "Add Learner" button | Add Child modal/screen opens | [ ] | |
| 6.5 | Verify form fields: Name and Birthdate | Both inputs visible | [ ] | |
| 6.6 | Tap Save with empty fields | Validation error | [ ] | |
| 6.7 | Enter name "Emma", leave birthdate empty | Validation error on birthdate | [ ] | |
| 6.8 | Enter name "Emma", birthdate "2099-01-01" (future date) | Validation error: date must be in past | [ ] | |
| 6.9 | Enter name "Emma", birthdate "2022-06-15" | Valid input accepted | [ ] | |
| 6.10 | Verify birthdate auto-formatting (YYYY-MM-DD) | Dashes auto-inserted as user types | [ ] | |
| 6.11 | Tap Save/Create | Child created, returns to profile, Emma appears in list | [ ] | |
| 6.12 | Verify child card shows: name, birthdate, age, avatar (letter "E") | All info displayed correctly | [ ] | |
| 6.13 | Verify total entries shows 0 | "0 entries" or similar | [ ] | |

---

## 7. Profile — Add Second Child

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 7.1 | Tap "Add Learner" again | Add Child screen opens | [ ] | |
| 7.2 | Enter name "Noah", birthdate "2023-03-10" | Valid input | [ ] | |
| 7.3 | Tap Save | Child created, both Emma and Noah visible in profile | [ ] | |
| 7.4 | Verify both child cards show correct info | Names, ages, avatars correct | [ ] | |

---

## 8. Profile — Edit Child

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 8.1 | Tap Edit button on Emma's card | Edit Child screen opens | [ ] | |
| 8.2 | Verify fields pre-populated with "Emma" and "2022-06-15" | Correct data shown | [ ] | |
| 8.3 | Change name to "Emma Rose" | Text updates | [ ] | |
| 8.4 | Tap Save | Returns to profile, name updated to "Emma Rose" | [ ] | |
| 8.5 | Tap Edit on Emma again, change birthdate to "2022-07-01" | Date updates | [ ] | |
| 8.6 | Tap Save | Birthdate and age recalculated correctly | [ ] | |

---

## 9. Profile — Delete Child

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 9.1 | Tap Delete button on Noah's card | Confirmation dialog/prompt appears | [ ] | |
| 9.2 | Cancel deletion | Noah still visible, no change | [ ] | |
| 9.3 | Tap Delete again, confirm | Noah removed from list | [ ] | |
| 9.4 | Only Emma Rose remains | One child card visible | [ ] | |

---

## 10. Child Switcher

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 10.1 | Navigate to Home tab | Home screen with ChildSwitcher visible | [ ] | |
| 10.2 | Verify Emma Rose is selected as active child | Name shown in switcher | [ ] | |
| 10.3 | (Add Noah back via Profile > Add Learner) | Second child exists | [ ] | |
| 10.4 | Tap ChildSwitcher dropdown on Home | Dropdown shows Emma Rose and Noah | [ ] | |
| 10.5 | Select Noah | Switcher updates to show Noah, screen data refreshes | [ ] | |
| 10.6 | Switch back to Emma Rose | Data updates for Emma | [ ] | |
| 10.7 | Kill app, relaunch | Last selected child persists (AsyncStorage) | [ ] | |

---

## 11. Home Screen — Category Grid

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 11.1 | Home screen shows category grid | 2-column grid of category cards | [ ] | |
| 11.2 | Verify selected onboarding categories appear | Categories chosen in onboarding are visible | [ ] | |
| 11.3 | Verify custom categories appear (if created during onboarding) | "Bible Study", "Piano" etc. visible | [ ] | |
| 11.4 | Verify each card shows: icon/emoji, category name, color | Visual elements correct | [ ] | |
| 11.5 | Verify TodaySummary shows 0 entries for today | "0 entries today" or similar | [ ] | |
| 11.6 | Scroll if more categories than fit on screen | Grid scrolls smoothly | [ ] | |

---

## 12. Entry Logging — Simple Entry (Skills Tracking OFF)

*If Skills Tracking was disabled in onboarding, test this path:*

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 12.1 | Tap a category card (e.g. "Reading Lessons") | Log screen opens for that category | [ ] | |
| 12.2 | Verify SimpleEntryForm is shown | Text/note input visible | [ ] | |
| 12.3 | Enter a note: "Completed lesson 12 - phonics review" | Text appears in input | [ ] | |
| 12.4 | Tap Save/Log button | Entry saved, success feedback shown | [ ] | |
| 12.5 | Navigate back to home | Entry count updates (TodaySummary shows 1) | [ ] | |
| 12.6 | Log another entry for same category without notes | Entry saves with empty notes | [ ] | |
| 12.7 | Log entry for a different category | Entry saves under correct category | [ ] | |

---

## 13. Entry Logging — Skill-Based Entry (Skills Tracking ON)

*Enable Skills Tracking in preferences if not already on. Navigate to a hardcoded category.*

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 13.1 | Tap "Literacy" category | Log screen opens showing skills list | [ ] | |
| 13.2 | Verify skills listed: Letter Names, Letter Sounds, Reading Program, CVC Words, Printing, Books Read, Narration | All skills visible | [ ] | |
| 13.3 | **Activity Log entry**: Tap a skill with `activity_log` type (e.g. Narration) | ActivityLogEntry component renders | [ ] | |
| 13.4 | Enter text note and save | Entry logged successfully | [ ] | |
| 13.5 | **Counter entry**: Tap a skill with `count` type (e.g. Books Read) | CounterEntry component renders with +/- buttons | [ ] | |
| 13.6 | Tap + to increment counter | Number increases | [ ] | |
| 13.7 | Tap - to decrement | Number decreases (min 0) | [ ] | |
| 13.8 | Save counter entry | Entry logged with correct count value | [ ] | |
| 13.9 | **Milestone entry**: Tap a skill with `mastery` type (e.g. Letter Names) | MilestoneEntry component renders with checkboxes | [ ] | |
| 13.10 | Check a milestone checkbox | Checkbox toggles on | [ ] | |
| 13.11 | Uncheck the milestone | Checkbox toggles off | [ ] | |
| 13.12 | Check milestone and save | Milestone logged | [ ] | |
| 13.13 | **Numeric entry**: Tap a skill with `numeric` type (e.g. Counting) | Numeric input or counter shown | [ ] | |
| 13.14 | Enter/adjust numeric value and save | Entry logged with value | [ ] | |

---

## 14. Entry Logging — Numeracy Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 14.1 | Tap "Numeracy" category from home | Log screen opens | [ ] | |
| 14.2 | Verify skills: Counting, Numeral Recognition, Math Program, Addition, Practical Math | All listed | [ ] | |
| 14.3 | Log a Counting entry (numeric type) | Entry saves | [ ] | |
| 14.4 | Log a Math Program entry (activity log) | Entry saves | [ ] | |
| 14.5 | Navigate back, verify entry count increased | TodaySummary updated | [ ] | |

---

## 15. Entry Logging — Fine Motor Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 15.1 | Tap "Fine Motor" category | Log screen opens | [ ] | |
| 15.2 | Verify skills: Pencil Grip, Tracing, Scissor Skills, Coloring, Manipulatives | Listed | [ ] | |
| 15.3 | Log a progress-type entry (e.g. Pencil Grip) | Milestone stages shown, entry saves | [ ] | |
| 15.4 | Log an activity_log entry (e.g. Coloring) | Free text entry saves | [ ] | |

---

## 16. Entry Logging — Gross Motor Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 16.1 | Tap "Gross Motor" category | Log screen opens | [ ] | |
| 16.2 | Verify skills listed | Outdoor Time, Balance, Gymnastics, Swimming, Ball Skills, Structured Activities | [ ] | |
| 16.3 | Log a cumulative entry (e.g. Outdoor Time — hours) | Value entry saves | [ ] | |
| 16.4 | Log a checklist entry (e.g. Balance) | Checklist items shown, save works | [ ] | |

---

## 17. Entry Logging — Social & Emotional Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 17.1 | Tap "Social & Emotional" category | Log screen opens | [ ] | |
| 17.2 | Verify skills listed | Emotional Recognition, Social Interaction, etc. | [ ] | |
| 17.3 | Log an observation_log entry | Text observation saves | [ ] | |
| 17.4 | Log a progress-type entry | Milestone stages shown, saves | [ ] | |

---

## 18. Entry Logging — Practical Life Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 18.1 | Tap "Practical Life" category | Log screen opens | [ ] | |
| 18.2 | Verify skills listed | Pouring, Dressing, Cleaning, Eating, Bathroom Skills, Household Chores | [ ] | |
| 18.3 | Log a checklist entry | Checkboxes toggle and save | [ ] | |

---

## 19. Entry Logging — Creative Expression Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 19.1 | Tap "Creative Expression" category | Log screen opens | [ ] | |
| 19.2 | Verify skills listed | Drawing, Music, Singing, Drama, Crafts, Dancing | [ ] | |
| 19.3 | Log an activity_log entry | Free text saves | [ ] | |
| 19.4 | Log an observation_log entry | Text observation saves | [ ] | |

---

## 20. Entry Logging — Nature & Science Category

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 20.1 | Tap "Nature & Science" category | Log screen opens | [ ] | |
| 20.2 | Verify skills listed | Outdoor Exploration, Nature Knowledge, Science Topics, etc. | [ ] | |
| 20.3 | Log a topic_log entry | Topic/lesson text saves | [ ] | |
| 20.4 | Log a cumulative entry | Value accumulation saves | [ ] | |

---

## 21. Entry Logging — Custom/User Categories

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 21.1 | Tap a custom category created during onboarding (e.g. "Bible Study") | Log screen opens | [ ] | |
| 21.2 | Verify SimpleEntryForm is shown (custom categories use simple form) | Text input visible, no skill list | [ ] | |
| 21.3 | Enter notes and save | Entry logged to custom category | [ ] | |
| 21.4 | Navigate back, verify custom category shows entry count | Count updated | [ ] | |
| 21.5 | Test second custom category (e.g. "Piano") | Same simple form, logs correctly | [ ] | |

---

## 22. Entry Logging — Photo Entry (Photo Entries ON)

*Enable Photo Entries in preferences if not already on.*

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 22.1 | Open a category log screen | PhotoEntry section visible | [ ] | |
| 22.2 | Tap photo capture/gallery button | Camera or gallery picker opens | [ ] | |
| 22.3 | Take a photo or select from gallery | Photo preview shown in entry | [ ] | |
| 22.4 | Save entry with photo | Entry saves with media_url | [ ] | |
| 22.5 | Verify photo appears in timeline view | Photo thumbnail visible | [ ] | |

---

## 23. Voice Input — Quick Log

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 23.1 | Verify VoiceButton/"Quick Log" button visible on Home screen | Button present | [ ] | |
| 23.2 | Tap Quick Log button | Voice input modal opens | [ ] | |
| 23.3 | Verify text input field is present | TextInput visible in modal | [ ] | |
| 23.4 | Type: "Emma did reading lesson 58" | Text appears | [ ] | |
| 23.5 | Tap submit/parse button | Loading state, then VoiceReviewScreen opens | [ ] | |
| 23.6 | Verify parsed entry shows: child=Emma, category=Reading, lesson=58 | Parsed data matches input | [ ] | |
| 23.7 | Verify confidence score is displayed | Score shown per entry | [ ] | |
| 23.8 | Tap Confirm to save | Entry saved, returns to home | [ ] | |
| 23.9 | Verify entry appears in correct category with lesson number | Data correct | [ ] | |

---

## 24. Voice Input — Multiple Entries

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 24.1 | Open Quick Log | Modal opens | [ ] | |
| 24.2 | Type: "Emma did reading lesson 59 and math lesson 42" | Text entered | [ ] | |
| 24.3 | Submit for parsing | VoiceReviewScreen shows 2 parsed entries | [ ] | |
| 24.4 | Verify Entry 1: Emma, Reading, lesson 59 | Correct | [ ] | |
| 24.5 | Verify Entry 2: Emma, Math, lesson 42 | Correct | [ ] | |
| 24.6 | Delete one entry from review | Entry removed from list | [ ] | |
| 24.7 | Edit remaining entry (if edit available) | Edits apply | [ ] | |
| 24.8 | Confirm save | Remaining entry saved | [ ] | |

---

## 25. Voice Input — Multi-Child

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 25.1 | Open Quick Log | Modal opens | [ ] | |
| 25.2 | Type: "Emma did reading lesson 60 and Noah did math lesson 5" | Text entered | [ ] | |
| 25.3 | Submit for parsing | 2 entries parsed, one per child | [ ] | |
| 25.4 | Verify child names correctly assigned | Emma→Reading, Noah→Math | [ ] | |
| 25.5 | Confirm save | Both entries saved under correct children | [ ] | |

---

## 26. Voice Input — Edge Cases

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 26.1 | Submit empty text | Error or no entries parsed | [ ] | |
| 26.2 | Submit gibberish: "asdfghjkl" | Low confidence or error message | [ ] | |
| 26.3 | Submit with unknown child name: "Jake did reading" | Unmatched name flagged or best guess shown | [ ] | |
| 26.4 | Submit with unknown category: "Emma did underwater basket weaving" | Category unmatched, user can correct in review | [ ] | |

---

## 27. Category Timeline (Long Press)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 27.1 | Long-press a category card on Home | Category timeline screen opens | [ ] | |
| 27.2 | Verify entries listed in reverse chronological order (newest first) | Correct ordering | [ ] | |
| 27.3 | Verify each entry shows: text/value, date, time | All info visible | [ ] | |
| 27.4 | Scroll through entries | Smooth scrolling | [ ] | |
| 27.5 | Long-press a custom category | SimpleCategoryTimeline opens | [ ] | |
| 27.6 | Verify custom category entries displayed correctly | Text, date, time shown | [ ] | |

---

## 28. Category Timeline — Hardcoded Category (Skills Tracking ON)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 28.1 | Long-press a hardcoded category (e.g. Literacy) | Timeline opens with SkillMiniBadges at top | [ ] | |
| 28.2 | Verify skill mini badges show progress indicators | Counts, colors, checkmarks visible | [ ] | |
| 28.3 | Verify EntryTimeline below shows full history | Entries with skill name, details, timestamp | [ ] | |
| 28.4 | Delete an entry from timeline (if delete button present) | Entry removed, list refreshes | [ ] | |

---

## 29. Progress Screen — Without Gamification

*Ensure Gamification is OFF in preferences.*

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 29.1 | Tap Progress tab | Simple stats view loads | [ ] | |
| 29.2 | Verify summary cards: This Week / This Month / All Time | Three stat cards visible | [ ] | |
| 29.3 | Verify "This Week" count matches entries logged this week | Count correct | [ ] | |
| 29.4 | Verify "All Time" count matches total entries logged | Count correct | [ ] | |
| 29.5 | Verify category breakdown section | Per-category stats listed | [ ] | |
| 29.6 | Each category shows: this week, this month, total, avg/week, last entry | All columns populated | [ ] | |
| 29.7 | Verify categories with 0 entries show appropriately | Zero or dash displayed | [ ] | |

---

## 30. Progress Screen — With Gamification

*Enable Gamification in preferences.*

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 30.1 | Tap Progress tab | Gamification view loads | [ ] | |
| 30.2 | Verify XpBar component visible | XP progress bar shown | [ ] | |
| 30.3 | Verify LevelBadge shows current level + title | E.g. "Level 1: Little Sprout" | [ ] | |
| 30.4 | Verify StreakDisplay shows current streak | Streak count visible | [ ] | |
| 30.5 | Verify CategoryProgress section | Skills with progress bars | [ ] | |
| 30.6 | Verify AchievementWall at bottom | Grid of locked/unlocked badges | [ ] | |
| 30.7 | Check "First Steps" achievement is unlocked (if 1+ entries) | Badge shows as unlocked | [ ] | |
| 30.8 | Verify locked achievements show in grayed/locked state | Visual distinction clear | [ ] | |

---

## 31. Gamification — XP Earning

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 31.1 | Note current XP before logging | Record value | [ ] | |
| 31.2 | Log an activity entry | +10 XP expected | [ ] | |
| 31.3 | Verify XpToast appears (floating notification) | XP gain toast visible | [ ] | |
| 31.4 | Check Progress tab — XP increased by 10 | Bar moved | [ ] | |
| 31.5 | Log entry with a note | +10 XP for note | [ ] | |
| 31.6 | Log entry with photo (if enabled) | +15 XP for photo | [ ] | |
| 31.7 | Complete a milestone | +50 XP for milestone | [ ] | |
| 31.8 | Verify cumulative XP matches expected total | Math checks out | [ ] | |

---

## 32. Gamification — Level Up

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 32.1 | Log entries until XP reaches level 2 threshold (400 XP = Level 2) | Keep logging | [ ] | |
| 32.2 | On level up, verify LevelUpOverlay appears | Full-screen celebration animation | [ ] | |
| 32.3 | Dismiss level up overlay | Returns to normal view | [ ] | |
| 32.4 | Check Progress tab — level updated | Level badge shows new level | [ ] | |
| 32.5 | Verify level title updates at thresholds | "Little Sprout" → "Curious Explorer" at level 4 | [ ] | |

---

## 33. Gamification — Achievements

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 33.1 | Log first ever entry (if not done) | "First Steps" achievement triggers | [ ] | |
| 33.2 | Verify AchievementUnlockOverlay appears | Achievement animation shown | [ ] | |
| 33.3 | Dismiss overlay | Returns to normal view | [ ] | |
| 33.4 | Check Achievement Wall — "First Steps" now unlocked | Badge glowing/colored | [ ] | |
| 33.5 | Log entries on consecutive days to build 7-day streak | "On Fire" achievement triggers | [ ] | |
| 33.6 | Verify streak-based achievement unlock | Overlay + wall update | [ ] | |

---

## 34. Gamification — Streak

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 34.1 | Log at least one entry today | Streak should be 1 (or increment) | [ ] | |
| 34.2 | Verify StreakDisplay shows current streak count | Number visible | [ ] | |
| 34.3 | Verify streak bonus XP (25 XP daily) | XP increases accordingly | [ ] | |
| 34.4 | Verify TodaySummary reflects streak status | Streak info on home | [ ] | |

---

## 35. Reports — Generate Weekly Report

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 35.1 | Tap Reports tab | Reports screen loads | [ ] | |
| 35.2 | Verify two sub-tabs: Reports and Analytics | Both tabs visible | [ ] | |
| 35.3 | Tap "Generate Report" button | Modal opens with report type options | [ ] | |
| 35.4 | Select "Weekly" | Weekly report option selected | [ ] | |
| 35.5 | Tap Generate/Create | Loading state, then report appears in list | [ ] | |
| 35.6 | Verify report shows in list: type=Weekly, period=current week | Correct metadata | [ ] | |
| 35.7 | Verify entry count shown on report card | Matches actual entries this week | [ ] | |

---

## 36. Reports — Generate Monthly Report

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 36.1 | Tap "Generate Report" | Modal opens | [ ] | |
| 36.2 | Select "Monthly" | Monthly selected | [ ] | |
| 36.3 | Tap Generate | Report created | [ ] | |
| 36.4 | Verify report appears in list under Monthly group | Grouped correctly | [ ] | |

---

## 37. Reports — Generate Seasonal Report

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 37.1 | Tap "Generate Report" | Modal opens | [ ] | |
| 37.2 | Select "Seasonal" | Seasonal selected | [ ] | |
| 37.3 | Tap Generate | Report created (current season auto-detected) | [ ] | |
| 37.4 | Verify season label correct (e.g. Winter for March = Winter or Spring depending on config) | Season accurate | [ ] | |

---

## 38. Reports — View Report

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 38.1 | Tap on a generated report in the list | Report viewer opens (`/report/[reportId]`) | [ ] | |
| 38.2 | Verify header badge: report type + date range | Correct type and period | [ ] | |
| 38.3 | Verify narrative text (AI-generated summary) | Readable, references child name + activities | [ ] | |
| 38.4 | Verify statistics section: total entries, XP earned, milestones, streak | Numbers match expectations | [ ] | |
| 38.5 | Verify category breakdown | Bar chart or list of entries by category | [ ] | |
| 38.6 | Verify photos section (if photos logged) | Up to 6 photo thumbnails | [ ] | |
| 38.7 | Scroll through entire report | All sections render, no cut-off | [ ] | |
| 38.8 | Navigate back | Returns to reports list | [ ] | |

---

## 39. Reports — PDF Export

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 39.1 | Open a report | Report viewer displayed | [ ] | |
| 39.2 | Tap "Share PDF" button | PDF generation starts (loading indicator) | [ ] | |
| 39.3 | Native share dialog appears | Android share sheet opens with PDF | [ ] | |
| 39.4 | Dismiss share dialog | Returns to report viewer | [ ] | |

---

## 40. Reports — Analytics Tab

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 40.1 | Tap Analytics sub-tab on Reports screen | Analytics view loads | [ ] | |
| 40.2 | Verify Category Distribution pie chart | Pie chart shows entry % per category | [ ] | |
| 40.3 | Verify Activity Heatmap | Calendar view with colored days | [ ] | |
| 40.4 | Verify Weekly Trends line chart | 12-week trend line visible | [ ] | |
| 40.5 | Interact with charts (tap segments, hover) | Tooltips or details shown (if interactive) | [ ] | |

---

## 41. Profile — Settings

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 41.1 | Tap Profile tab | Profile screen loads | [ ] | |
| 41.2 | Tap Settings button | Settings screen opens | [ ] | |
| 41.3 | Verify preference toggles match onboarding selections | Same states as set during onboarding | [ ] | |
| 41.4 | Toggle Gamification ON (if off) | Switch animates | [ ] | |
| 41.5 | Navigate to Progress tab | Gamification view now shown | [ ] | |
| 41.6 | Go back to Settings, toggle Gamification OFF | Switch animates | [ ] | |
| 41.7 | Navigate to Progress tab | Simple stats view shown | [ ] | |
| 41.8 | Toggle Skills Tracking ON/OFF | Switch animates | [ ] | |
| 41.9 | Open a category log — verify form changes based on toggle | Skills list vs SimpleEntryForm | [ ] | |

---

## 42. Profile — Sign Out

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 42.1 | Navigate to Profile or Settings | Screen loads | [ ] | |
| 42.2 | Tap Sign Out button | Confirmation prompt (if any) | [ ] | |
| 42.3 | Confirm sign out | Session cleared, navigates to Sign In screen | [ ] | |
| 42.4 | Verify back button does NOT return to authenticated screens | Auth guard blocks | [ ] | |
| 42.5 | Sign in again with same credentials | Signs in, goes to Home (onboarding already complete) | [ ] | |
| 42.6 | Verify all data persists (children, entries, categories) | Data intact from Supabase | [ ] | |

---

## 43. Navigation — Tab Bar

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 43.1 | Verify 4 tabs: Home, Progress, Reports, Profile | All tabs visible | [ ] | |
| 43.2 | Tap each tab in sequence | Each screen loads correctly | [ ] | |
| 43.3 | Verify active tab has visual indicator | Highlighted/colored icon | [ ] | |
| 43.4 | Rapid tap between tabs | No crashes, smooth transitions | [ ] | |
| 43.5 | Verify Scrapbook Theme tab bar (if enabled) | Custom CraftTabBar renders with notebook aesthetic | [ ] | |

---

## 44. Navigation — Back Button & Stack

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 44.1 | From Home, tap a category (opens log modal) | Log screen opens | [ ] | |
| 44.2 | Press Android back button | Returns to Home | [ ] | |
| 44.3 | From Home, long-press category (opens timeline) | Timeline opens | [ ] | |
| 44.4 | Press back | Returns to Home | [ ] | |
| 44.5 | Open Profile > Add Child | Add Child modal opens | [ ] | |
| 44.6 | Press back | Returns to Profile | [ ] | |
| 44.7 | Open Reports > tap report > view report | Report viewer opens | [ ] | |
| 44.8 | Press back | Returns to Reports list | [ ] | |
| 44.9 | Press back from Sign In (no history) | App exits or stays on Sign In | [ ] | |

---

## 45. Navigation — Deep Modals

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 45.1 | Home > tap category > log entry > save > auto-return | Returns to home after save | [ ] | |
| 45.2 | Home > Quick Log > parse > review > save > auto-return | Returns to home after save | [ ] | |
| 45.3 | Profile > Edit Child > Save > auto-return | Returns to profile after save | [ ] | |
| 45.4 | Reports > Generate > view > back > back | Returns through stack correctly | [ ] | |

---

## 46. Scrapbook Theme (Toggle ON)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 46.1 | Enable Scrapbook Theme in Settings | Toggle ON | [ ] | |
| 46.2 | Verify custom CraftTabBar renders | Notebook-style tab bar with washi tape | [ ] | |
| 46.3 | Verify warm background colors (#FFF8F0 lined paper) | Background tint changes | [ ] | |
| 46.4 | Verify font styling (Gaegu headings, Nunito body) | Handwritten display font visible | [ ] | |
| 46.5 | Disable Scrapbook Theme | Toggle OFF | [ ] | |
| 46.6 | Verify default theme restores | Standard tab bar and styling | [ ] | |

---

## 47. Active Books (Book Tracking)

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 47.1 | Navigate to a book-type category (if one exists) | Log screen with ActiveBooksList | [ ] | |
| 47.2 | Verify active books list renders | Book list or empty state | [ ] | |
| 47.3 | Add a book title | Book appears in active list | [ ] | |
| 47.4 | Log reading progress for book | Entry saved with book reference | [ ] | |
| 47.5 | Mark book as complete (if feature exists) | Book moves to completed or removed from active | [ ] | |

---

## 48. Empty States

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 48.1 | New account with no children: Home screen | Welcome message / add child prompt | [ ] | |
| 48.2 | No entries logged: Home TodaySummary | "0 entries" or hint text | [ ] | |
| 48.3 | No entries: Progress tab (simple stats) | All zeros, no crash | [ ] | |
| 48.4 | No entries: Progress tab (gamification) | Level 1, 0 XP, 0 streak | [ ] | |
| 48.5 | No reports: Reports tab | Empty list, generate button visible | [ ] | |
| 48.6 | No entries: Category timeline | Empty timeline, no crash | [ ] | |
| 48.7 | No entries: Analytics tab | Charts handle empty data gracefully | [ ] | |

---

## 49. Error Handling

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 49.1 | Disable network (airplane mode), try to sign in | Error message about connectivity | [ ] | |
| 49.2 | Disable network, try to log entry | Error or offline indicator | [ ] | |
| 49.3 | Disable network, try to generate report | Error message | [ ] | |
| 49.4 | Re-enable network, retry actions | Actions succeed | [ ] | |
| 49.5 | Enter extremely long text in entry notes (1000+ chars) | Handles gracefully (truncates or accepts) | [ ] | |
| 49.6 | Enter special characters in child name: `<script>alert('x')</script>` | No XSS, text treated as literal | [ ] | |
| 49.7 | Enter emoji in child name: "Emma 🌟" | Handles gracefully | [ ] | |
| 49.8 | Rapid-tap save button on entry form | No duplicate entries created | [ ] | |
| 49.9 | Navigate away mid-save | No crash, entry either saved or discarded cleanly | [ ] | |

---

## 50. Performance & Stability

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 50.1 | App cold start time | Under 5 seconds to interactive | [ ] | |
| 50.2 | Tab switching latency | Under 500ms, no janky transitions | [ ] | |
| 50.3 | Scroll performance with 50+ entries in timeline | Smooth 60fps scrolling | [ ] | |
| 50.4 | Memory usage after 10 min of active use | No memory leak / OOM crash | [ ] | |
| 50.5 | Rotate device (if rotation enabled) | Layout adapts or stays locked to portrait | [ ] | |
| 50.6 | Put app in background, return after 5 min | App resumes without crash, data intact | [ ] | |
| 50.7 | Put app in background, return after 30 min | Session still valid or re-authenticates gracefully | [ ] | |
| 50.8 | Open 5+ log modals in sequence (open, save, repeat) | No memory buildup, consistent performance | [ ] | |

---

## 51. SKIP_AUTH Mode (Dev Only)

*Set `SKIP_AUTH: true` in feature flags for development testing.*

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 51.1 | Launch app with SKIP_AUTH enabled | Bypasses Supabase auth, goes to onboarding | [ ] | |
| 51.2 | Complete onboarding | Categories/preferences stored to AsyncStorage | [ ] | |
| 51.3 | Home screen loads with local data | No network required | [ ] | |
| 51.4 | Log entries in SKIP_AUTH mode | Entries persist locally | [ ] | |
| 51.5 | Kill and relaunch | Onboarding NOT shown again (local flag stored) | [ ] | |

---

## 52. Onboarding Reset / Re-entry Prevention

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 52.1 | Complete onboarding, navigate to home | Onboarding done | [ ] | |
| 52.2 | Press back — should NOT return to onboarding | Back goes to nothing or stays on home | [ ] | |
| 52.3 | Manually navigate to `/onboarding/categories` (if possible) | Should redirect to home or be blocked | [ ] | |
| 52.4 | Kill app, relaunch | Goes to home, not onboarding | [ ] | |
| 52.5 | Sign out and sign in with same account | Goes to home (onboarding already marked complete) | [ ] | |

---

## 53. Multi-Child Data Isolation

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 53.1 | Select Emma, log 3 entries | Entries under Emma | [ ] | |
| 53.2 | Switch to Noah | Home refreshes, Noah's data shown | [ ] | |
| 53.3 | Noah should have 0 entries (if none logged for Noah) | Clean state | [ ] | |
| 53.4 | Log 2 entries for Noah | Entries under Noah | [ ] | |
| 53.5 | Switch back to Emma | Emma's 3 entries shown, not Noah's | [ ] | |
| 53.6 | Progress tab: data matches active child | XP, stats, achievements per-child | [ ] | |
| 53.7 | Reports: generate for Emma | Report only includes Emma's data | [ ] | |
| 53.8 | Switch to Noah, generate report | Report only includes Noah's data | [ ] | |

---

## 54. Font Loading & Visual Verification

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 54.1 | App startup — fonts loaded before rendering | No flash of unstyled text (FOUT) | [ ] | |
| 54.2 | Headings use Gaegu font (handwritten style) | Visually distinct display font | [ ] | |
| 54.3 | Body text uses Nunito font | Clean, rounded sans-serif | [ ] | |
| 54.4 | Accent text uses Fredoka One | Bold decorative font | [ ] | |
| 54.5 | All text is legible (no clipping, overlapping, truncation) | Clean rendering | [ ] | |

---

## 55. Accessibility Basics

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 55.1 | Enable TalkBack on emulator | Screen reader activates | [ ] | |
| 55.2 | Navigate Sign In screen with TalkBack | All elements announced | [ ] | |
| 55.3 | Navigate Home screen with TalkBack | Categories, buttons announced | [ ] | |
| 55.4 | Tap buttons via TalkBack double-tap | Actions execute correctly | [ ] | |
| 55.5 | Increase system font size to largest | Text scales, no overlap/clipping | [ ] | |
| 55.6 | Decrease system font size to smallest | Text remains legible | [ ] | |

---

## 56. Data Persistence After App Kill

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| 56.1 | Log several entries, add children, generate reports | Data created | [ ] | |
| 56.2 | Force-stop app from Android settings | App killed | [ ] | |
| 56.3 | Relaunch app | Session restores, all data intact | [ ] | |
| 56.4 | Verify entries, children, reports all present | Nothing lost | [ ] | |
| 56.5 | Verify active child selection persists | Same child selected as before kill | [ ] | |
| 56.6 | Verify feature preferences persist | Same toggles as before kill | [ ] | |

---

## Test Execution Summary

| Section | Total Tests | Pass | Fail | Blocked | Skipped |
|---------|-------------|------|------|---------|---------|
| 0. Pre-Test Setup | 5 | | | | |
| 1. Sign Up | 10 | | | | |
| 2. Sign In | 7 | | | | |
| 3. Onboarding — Categories | 11 | | | | |
| 4. Onboarding — Preferences | 10 | | | | |
| 5. Home — Empty State | 3 | | | | |
| 6. Add First Child | 13 | | | | |
| 7. Add Second Child | 4 | | | | |
| 8. Edit Child | 6 | | | | |
| 9. Delete Child | 4 | | | | |
| 10. Child Switcher | 7 | | | | |
| 11. Category Grid | 6 | | | | |
| 12. Simple Entry Logging | 7 | | | | |
| 13. Skill-Based Entry | 14 | | | | |
| 14. Numeracy Entries | 5 | | | | |
| 15. Fine Motor Entries | 4 | | | | |
| 16. Gross Motor Entries | 4 | | | | |
| 17. Social-Emotional Entries | 4 | | | | |
| 18. Practical Life Entries | 3 | | | | |
| 19. Creative Expression Entries | 4 | | | | |
| 20. Nature & Science Entries | 4 | | | | |
| 21. Custom Category Entries | 5 | | | | |
| 22. Photo Entries | 5 | | | | |
| 23. Voice Input — Single | 9 | | | | |
| 24. Voice Input — Multiple | 8 | | | | |
| 25. Voice Input — Multi-Child | 5 | | | | |
| 26. Voice Input — Edge Cases | 4 | | | | |
| 27. Category Timeline | 6 | | | | |
| 28. Timeline — Skills View | 4 | | | | |
| 29. Progress — No Gamification | 7 | | | | |
| 30. Progress — Gamification | 8 | | | | |
| 31. XP Earning | 8 | | | | |
| 32. Level Up | 5 | | | | |
| 33. Achievements | 6 | | | | |
| 34. Streak | 4 | | | | |
| 35. Weekly Report | 7 | | | | |
| 36. Monthly Report | 4 | | | | |
| 37. Seasonal Report | 4 | | | | |
| 38. View Report | 8 | | | | |
| 39. PDF Export | 4 | | | | |
| 40. Analytics Tab | 5 | | | | |
| 41. Settings | 9 | | | | |
| 42. Sign Out | 6 | | | | |
| 43. Tab Bar Navigation | 5 | | | | |
| 44. Back Button & Stack | 9 | | | | |
| 45. Deep Modals | 4 | | | | |
| 46. Scrapbook Theme | 6 | | | | |
| 47. Active Books | 5 | | | | |
| 48. Empty States | 7 | | | | |
| 49. Error Handling | 9 | | | | |
| 50. Performance & Stability | 8 | | | | |
| 51. SKIP_AUTH Mode | 5 | | | | |
| 52. Onboarding Reset | 5 | | | | |
| 53. Multi-Child Isolation | 8 | | | | |
| 54. Font & Visuals | 5 | | | | |
| 55. Accessibility | 6 | | | | |
| 56. Data Persistence | 6 | | | | |
| **TOTAL** | **~340** | | | | |

---

## Test Environment

| Field | Value |
|-------|-------|
| **Tester** | |
| **Date** | |
| **Emulator** | |
| **API Level** | |
| **Screen Size** | |
| **APK Version** | |
| **Build Type** | Release / Debug |
| **Network** | WiFi / Cellular / Offline |

---

## Notes

- Tests should be run on **release APK** for production-accurate behavior
- Run again on **debug APK** if release passes to catch dev-only issues
- Sections 12 vs 13 are mutually exclusive paths based on Skills Tracking toggle — test both
- Voice Input tests (23-26) require DeepSeek API connectivity
- Photo tests (22) require emulator camera simulation or gallery images
- Streak tests (34) ideally span multiple days for full validation
- PDF export (39) requires testing actual file output, not just share dialog
