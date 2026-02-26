# Little Learner Tracker — Design Document

**Date:** 2026-02-25
**Status:** Approved

---

## Overview

A mobile-first child development tracker for homeschool parents and educators. Ages 3-6. Tracks 8 developmental categories with gamified XP/leveling, achievement badges, and auto-generated seasonal reports. Kid aesthetic, parent operated.

**Platform:** Android first, then iOS — single codebase via Expo/React Native.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 52+, React Native, TypeScript |
| Routing | Expo Router (file-based, tab + stack) |
| Auth | Supabase Auth (email/password + Google) |
| Database | Supabase Postgres |
| Storage | Supabase Storage (photos) |
| State (local) | Zustand |
| State (server) | TanStack Query |
| Animations | React Native Reanimated |
| Charts | Victory Native |
| PDF | react-native-html-to-pdf |
| Build | EAS Build (Android + iOS) |

---

## Database Schema (Supabase)

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| display_name | text | |
| avatar_url | text | nullable |
| created_at | timestamptz | |

### children
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| name | text | |
| birthdate | date | |
| avatar_url | text | nullable |
| created_at | timestamptz | |

### entries
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| child_id | uuid FK → children | |
| user_id | uuid FK → auth.users | |
| category_id | text | references static config |
| skill_id | text | references static config |
| entry_type | text | activity, photo, note, milestone, counter |
| value | text | flexible — number as string, text, etc. |
| notes | text | nullable |
| media_urls | text[] | array of Supabase Storage paths |
| logged_at | timestamptz | when the activity happened |
| created_at | timestamptz | when the entry was created |

### milestones
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| child_id | uuid FK → children | |
| skill_id | text | |
| milestone_key | text | |
| completed | boolean | default false |
| completed_at | timestamptz | nullable |

### xp_events
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| child_id | uuid FK → children | |
| xp_amount | integer | |
| source_type | text | entry, milestone, streak, achievement |
| source_id | uuid | nullable, references the triggering record |
| created_at | timestamptz | |

### child_levels
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| child_id | uuid FK → children | UNIQUE |
| total_xp | integer | default 0 |
| current_level | integer | default 1 |
| updated_at | timestamptz | |

### achievements
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| child_id | uuid FK → children | |
| achievement_key | text | references static achievement definitions |
| unlocked_at | timestamptz | |
| UNIQUE | (child_id, achievement_key) | |

### reports
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| child_id | uuid FK → children | |
| report_type | text | weekly, monthly, seasonal |
| period_start | date | |
| period_end | date | |
| season | text | nullable — spring, summer, fall, winter |
| data_json | jsonb | cached report data |
| pdf_url | text | nullable, Supabase Storage path |
| generated_at | timestamptz | |

### Static Config (shipped with app, not in DB)
- Categories and skills from `jk-tracking-categories.json`
- Achievement definitions (key, name, description, icon, criteria)
- Level titles and thresholds
- XP values per action type

---

## Gamification System

### XP Sources
| Action | XP |
|--------|----|
| Log an activity | +10 |
| Add a photo | +15 |
| Write a note/observation | +10 |
| Complete a milestone | +50 |
| Complete all milestones in a skill | +100 |
| Daily streak bonus (3+ days) | +25/day |
| Weekly streak (7 consecutive days) | +100 bonus |

### Level Formula
`level = floor(sqrt(total_xp / 100))`

| Level | Total XP Required |
|-------|-------------------|
| 1 | 100 |
| 2 | 400 |
| 3 | 900 |
| 5 | 2,500 |
| 10 | 10,000 |
| 15 | 22,500 |

### Level Titles
- 1-3: Little Sprout
- 4-6: Curious Explorer
- 7-9: Star Learner
- 10-12: Knowledge Knight
- 13+: Master Adventurer

### Achievements
**Category-based:**
- Bookworm — 50 books read
- Math Whiz — counting to 100
- Nature Scout — 20 hours outdoors
- Creative Spark — 30 art activities
- Helping Hand — all practical life checklists complete

**Streak-based:**
- On Fire — 7-day logging streak
- Unstoppable — 30-day streak
- Legendary — 100-day streak

**Milestone-based:**
- First Steps — first entry ever
- Century Club — 100 entries
- Milestone Master — 50 milestones completed

**Seasonal:**
- Summer Explorer — 10+ entries during summer
- Winter Scholar — 10+ entries during winter

### Achievement Visual Treatment
- Unlocked: full-color merit badge style, circular, thick border, ribbon banner
- Locked: pencil sketch outline (grayscale, hand-drawn stroke)
- Unlock animation: gold star sticker peels from corner, bounces, sticks + construction paper confetti

---

## Reports & Analytics

### Report Periods
| Period | Trigger | Dates |
|--------|---------|-------|
| Weekly | Auto-generated Sunday evening | Mon-Sun |
| Monthly | Auto-generated 1st of month | Calendar month |
| Spring | On-demand / auto Mar 1 | Mar 1 – May 31 |
| Summer | On-demand / auto Jun 1 | Jun 1 – Aug 31 |
| Fall | On-demand / auto Sep 1 | Sep 1 – Nov 30 |
| Winter | On-demand / auto Dec 1 | Dec 1 – Feb 28/29 |

### Report Contents
- Activity counts by category (bar chart)
- Milestones reached this period
- XP earned and levels gained
- Top skills worked on
- Photo highlights (up to 6)
- Templated narrative summary from data
- Comparison to previous period (if available)

### Analytics Dashboard
- Category distribution pie chart
- Activity heatmap (GitHub-style calendar)
- Streak tracker with flame visualization
- Skill progress bars per category
- Trend lines over time

### Export
- In-app viewing
- PDF export with scrapbook aesthetic
- Share via system share sheet

---

## Visual Design: "The Classroom Scrapbook"

### Concept
The app feels like flipping through a child's scrapbook — crayon drawings, construction paper, gold star stickers, teacher's handwriting. Tactile, warm, imperfect.

### Typography
| Role | Font | Character |
|------|------|-----------|
| Display/Headers | Gaegu | Childlike wobble, authentic handwriting |
| Body/Data | Nunito | Rounded, soft, teacher's clean handwriting |
| Accent/Numbers | Fredoka One | Chunky, bubbly, sticker-like for XP |

### Color Palette
```
--craft-red:      #E85D5D    construction paper red
--craft-yellow:   #F2C94C    gold star yellow
--craft-blue:     #5B9BD5    crayon blue
--craft-green:    #6BBF6B    marker green
--craft-purple:   #9B72CF    grape crayon
--craft-orange:   #F2994A    sunset orange
--lined-paper:    #FFF8F0    warm white paper
--pencil-gray:    #4A4A4A    graphite text
--eraser-pink:    #FFB5B5    pink eraser accent
--notebook-blue:  #C5D9F0    ruled line blue
```

Each category uses its own construction paper color as background.

### Textures & Backgrounds
- Default: subtle lined notebook paper (faint blue rules, red margin line)
- Cards: torn construction paper edges (CSS clip-path, irregular polygons)
- Category headers: masking tape strip, slightly skewed, semi-transparent beige
- Section dividers: dotted scissor cut-here lines
- Photo entries: Polaroid frames, slightly rotated, handwritten caption area

### Micro-interactions
- **Tap category card:** lifts (shadow deepens), flips like turning a page
- **Log entry:** green crayon checkmark draws itself, "+10 XP" floats up in Fredoka One
- **Complete milestone:** gold star drops from top, bounces, sticks + paper scrap confetti
- **App open:** notebook spine animation, cover lifts right
- **Pull to refresh:** pencil draws a spiral

### Navigation
- Bottom tab bar: torn craft paper strip, crayon-style icons
- Active tab: circle sticker behind icon
- Tab labels: Nunito

### Layout
- Slightly off-kilter — cards rotated 1-2 degrees randomly
- Photos overlap edges, stickers peek from behind sections
- Generous whitespace — paper breathes
- Thumb-zone optimized — primary actions in bottom 40%
- Home category cards: 2-column with alternating sizes (large/small/small/large)

### Report PDF Aesthetic
- Header: child name in Gaegu, masking tape banner
- Sections: alternating construction paper colors
- Charts: hand-drawn style, wobbly borders, crayon fills
- Photos: Polaroid frames, scattered/overlapping, tape pieces
- Footer: "Made with love" in pencil gray

---

## App Navigation

### Tab Bar (4 tabs)
1. **Home** — Today view, quick log cards for 8 categories, smart suggestions
2. **Progress** — XP/level display, achievement wall, skill progress by category
3. **Reports** — Generated reports list, analytics dashboard
4. **Profile** — Child switcher, child profiles, settings, account

### Key Screens
- Home/Today
- Category Quick Log (expanded card)
- Category Deep Dive (timeline, skill breakdown)
- Entry Detail (photo viewer, notes)
- Progress Overview (XP bar, level, recent achievements)
- Achievement Wall (all badges, locked/unlocked)
- Skill Progress (per-category breakdown)
- Reports List
- Report Viewer
- Analytics Dashboard
- Child Profile
- Add/Edit Child
- Settings
- Auth (Sign In / Sign Up)

### Key Flows
1. **Quick log:** Home → tap category → tap activity / snap photo / write note → done (< 30 sec)
2. **View progress:** Progress → XP bar + level → tap category → skill breakdowns
3. **View report:** Reports → select period → view in-app → export PDF
4. **Add child:** Profile → "+" → name + birthdate + avatar → save

---

## MVP Scope

### Included
- Supabase Auth (email + Google)
- Unlimited children with profile switching
- All 8 categories with skills from JSON schema
- Quick log: activity tap, photo, text note, counter, milestone toggle
- XP system with leveling
- Achievement badges (initial set of ~15)
- Category timelines
- Weekly + monthly + seasonal reports (auto-generated)
- Analytics dashboard (basic)
- PDF report export
- Full scrapbook visual design

### Not Included (Post-MVP)
- Family sharing / multi-user per child
- Voice notes
- Custom categories/skills
- Curriculum integrations
- Smart suggestions (time-of-day, pattern-based)
- Push notifications
- Offline-first / local caching
- Batch "catch up" logging

---

## Children Support

- Unlimited children per account
- Child switcher in Profile tab + persistent indicator in header
- Each child has independent: entries, milestones, XP, achievements, reports
- Default to last-viewed child on app open

---

## Security

- Row Level Security (RLS) on all tables — users only see their own data
- Photos in private Supabase Storage buckets with signed URLs
- No third-party analytics on child data
- No advertising, no data selling

---

*Design approved 2026-02-25*
