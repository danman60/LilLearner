# Product Requirements Document: Little Learner Tracker

## Overview

**Product Name:** Little Learner Tracker  
**Target Users:** Homeschool parents, early childhood educators, caregivers  
**Age Range Covered:** 3–6 years (Pre-K through Kindergarten)  
**Platform:** Mobile-first (iOS, Android), web companion

---

## Problem Statement

Parents and educators tracking early childhood development face fragmented tools—paper checklists, scattered notes, photos in camera rolls, and curriculum workbooks. There's no unified way to:

- Log daily progress across developmental domains
- Capture moments (photos, quotes, observations) in context
- See longitudinal growth over weeks/months/years
- Generate meaningful progress reports for co-parents, schools, or portfolios

---

## Solution

A delightful, low-friction daily tracker that makes capturing early learning progress as easy as posting to social media—but private, organized, and purposeful.

---

## Core Principles

1. **30-second logging** — Most entries should take under 30 seconds
2. **Capture, don't create** — Photos, voice notes, quick taps over lengthy forms
3. **Celebrate small wins** — Surface progress and streaks to motivate consistency
4. **Beautiful output** — Generate shareable, print-ready reports automatically
5. **Private by default** — Family data stays within the family

---

## User Personas

### Primary: Homeschool Parent (Sarah)
- Homeschools 2 kids (ages 4 and 6)
- Juggles curriculum, life skills, outdoor time
- Wants to document progress without adding to her workload
- Needs to show progress to skeptical relatives or for portfolio reviews

### Secondary: Part-time Caregiver (Grandma Linda)
- Watches grandkids 2 days/week
- Wants to contribute observations without complexity
- Needs simple "what we did today" logging

### Tertiary: Co-Parent (Dad Mike)
- Works full-time, involved on evenings/weekends
- Wants to see what happened during the day
- Logs weekend activities (sports, outdoor time)

---

## Feature Requirements

### 1. Daily Quick Log

**Priority: P0 (MVP)**

The primary interface for daily tracking.

#### 1.1 Category Cards
- Display all 8 developmental categories as tappable cards
- Each card shows: icon, name, streak indicator, last activity preview
- Tap to expand and log

#### 1.2 Quick Entry Types
| Entry Type | Input Method | Use Case |
|------------|--------------|----------|
| Activity tap | Single tap on predefined activity | "Did reading lesson" |
| Counter increment | Tap +1 | "Books read: 18" |
| Photo capture | Camera or gallery | Artwork, worksheet, moment |
| Voice note | Hold to record | "Stella said the funniest thing..." |
| Text note | Keyboard | Detailed observation |
| Milestone toggle | Tap to mark complete | "Can write name independently ✓" |

#### 1.3 Smart Suggestions
- Surface relevant activities based on:
  - Time of day (morning = literacy, afternoon = gross motor)
  - Day of week (Wednesday = forest school)
  - Recent patterns (hasn't logged numeracy in 3 days)

#### 1.4 Batch Logging
- "Catch up" mode for logging multiple days at once
- Weekly review prompt on Sunday evenings

---

### 2. Category Deep Dives

**Priority: P0 (MVP)**

Detailed view for each developmental category.

#### 2.1 Skill Tracking
- Visual progress bars for milestone-based skills
- Numeric trackers with graphs (e.g., counting progress over time)
- Checklist items with completion dates

#### 2.2 Activity Timeline
- Reverse-chronological feed of all entries in category
- Filter by: entry type, date range, skill
- Search within notes

#### 2.3 Media Gallery
- Grid view of all photos/videos in category
- Tap to see context (date, associated notes)

---

### 3. Child Profile

**Priority: P0 (MVP)**

#### 3.1 Basic Info
- Name, birthdate (age auto-calculated), photo
- Multiple children supported with easy switching

#### 3.2 Curriculum Connections (Optional)
- Link to curriculum (e.g., "100 Easy Lessons", "Good and the Beautiful")
- Track lesson progress within app

#### 3.3 Goals
- Set term goals (e.g., "Finish 100 Easy Lessons by March")
- Visual progress toward goals

---

### 4. Progress Reports

**Priority: P1**

Auto-generated reports from logged data.

#### 4.1 Report Types
| Report | Frequency | Content |
|--------|-----------|---------|
| Weekly Summary | Auto-generated Sunday | Activity counts, highlights, photos |
| Monthly Progress | Auto-generated 1st of month | Skill advancement, milestones reached |
| Term Report Card | On-demand | Full narrative report like the JK Report Card |
| Custom Date Range | On-demand | User-selected period |

#### 4.2 Report Output
- In-app viewing
- PDF export (styled like scrapbook report card)
- Share via email, AirDrop, messaging

#### 4.3 Report Customization
- Select which categories to include
- Add/edit narrative sections
- Choose photos to feature
- Adjust tone (formal vs. warm)

---

### 5. Family Sharing

**Priority: P1**

#### 5.1 Invite Family Members
- Invite via email or link
- Role-based permissions:
  - **Admin**: Full access, can edit/delete, manage settings
  - **Contributor**: Can add entries, view everything
  - **Viewer**: Read-only access

#### 5.2 Activity Feed
- Shared feed of all family logging activity
- React with emoji (❤️ 🎉 ⭐)
- Comment on entries

#### 5.3 Notifications
- Daily digest: "Here's what [Child] did today"
- Milestone alerts: "[Child] reached a new milestone!"
- Configurable per user

---

### 6. Insights & Analytics

**Priority: P2**

#### 6.1 Dashboard
- Hours logged by category (pie chart)
- Activity frequency heatmap (GitHub-style)
- Streaks and consistency scores

#### 6.2 Trends
- Skill progression over time
- Compare across terms/years
- Seasonal patterns (more outdoor time in summer)

#### 6.3 Recommendations
- "You haven't logged Fine Motor in 5 days"
- "Stella is close to reaching [milestone]—keep going!"
- Suggested activities based on gaps

---

### 7. Content Library

**Priority: P2**

#### 7.1 Activity Ideas
- Curated activity suggestions per category
- Age-appropriate filtering
- Save favorites

#### 7.2 Milestone References
- Typical developmental milestones by age
- "What to expect" guides
- Note: Descriptive, not prescriptive—every child develops differently

#### 7.3 Curriculum Integrations
- Partner with popular homeschool curricula
- Import lesson plans, track completion

---

## Technical Requirements

### Data Model

```
Child
├── id, name, birthdate, avatar
├── Categories[]
│   ├── id, name, icon, color
│   └── Skills[]
│       ├── id, name, tracking_type
│       ├── milestones[]
│       └── entries[]
│           ├── timestamp
│           ├── type (activity|photo|note|milestone|counter)
│           ├── value
│           └── media_urls[]
└── Goals[]
    ├── skill_id, target_value, target_date
    └── progress
```

### Sync & Storage
- Local-first architecture (works offline)
- Cloud sync when connected
- End-to-end encryption for family data
- Photo storage: compressed originals, CDN delivery

### Performance
- App launch: <2 seconds
- Entry logging: <500ms to confirm
- Report generation: <10 seconds for term report

---

## Design Requirements

### Visual Style
- Warm, approachable, slightly playful
- Soft pastels (matching report card aesthetic)
- Hand-drawn accents and illustrations
- Avoid clinical/institutional feel

### Accessibility
- Dynamic type support
- VoiceOver compatible
- High contrast mode
- One-handed operation for quick logging

---

## MVP Scope (v1.0)

### Included
- [ ] Single child profile
- [ ] All 8 categories with predefined skills
- [ ] Quick log: activity tap, photo, text note, counter
- [ ] Milestone tracking
- [ ] Category timelines
- [ ] Weekly summary (auto-generated)
- [ ] PDF report export (basic)
- [ ] Local data storage

### Not Included (v1.x+)
- Multiple children
- Family sharing
- Advanced analytics
- Curriculum integrations
- Voice notes
- Custom categories/skills

---

## Success Metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| DAU/MAU ratio | >40% (high engagement) |
| Entries per active user per week | >10 |
| Report exports per user per month | >1 |
| Retention (30-day) | >50% |
| NPS | >50 |

---

## Monetization (Future)

### Freemium Model
- **Free tier**: 1 child, basic tracking, weekly summaries
- **Premium ($4.99/mo or $39.99/yr)**:
  - Unlimited children
  - Family sharing
  - Advanced reports & analytics
  - Curriculum integrations
  - Priority support

### No Ads Ever
- Children's data is sacred—no advertising, no data selling

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Too complex for busy parents | Ruthless simplicity in MVP; 30-second logging principle |
| Guilt from "not logging enough" | Positive framing; celebrate what IS logged, no shame |
| Data loss anxiety | Local-first + cloud backup; clear export options |
| Privacy concerns | E2E encryption; transparent privacy policy; no third-party analytics on child data |
| Competition from generic note apps | Purpose-built features (milestones, reports) that generic apps can't match |

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Discovery & Design | 4 weeks | User research, wireframes, visual design |
| MVP Development | 10 weeks | Core app (iOS first) |
| Beta Testing | 4 weeks | TestFlight with 50 homeschool families |
| Launch Prep | 2 weeks | App Store assets, marketing site |
| Public Launch | Week 21 | iOS App Store |
| Android | +8 weeks | Google Play launch |

---

## Open Questions

1. Should we include a "share to social" feature for milestone celebrations, or keep everything private?
2. How prescriptive should milestone ages be? Risk of causing anxiety.
3. Partner with specific curricula (exclusive) or stay curriculum-agnostic?
4. Web app priority—is mobile-only acceptable for MVP?

---

## Appendix

### A. Category Schema
See `jk-tracking-categories.json` for complete data model.

### B. Competitive Landscape
- **Brightwheel**: Daycare-focused, not homeschool
- **Seesaw**: Classroom-focused, teacher-centric
- **Day One / Journey**: Generic journaling, no structure
- **Notion / Airtable**: Powerful but requires setup
- **Paper trackers**: No photos, no reports, easy to lose

### C. User Research Quotes
> "I take photos of everything but they just sit in my camera roll. I wish they were organized by what skill she was working on."

> "My husband asks 'what did you do today?' and I blank. We did SO much but I can't remember."

> "I need something for our annual portfolio review but I dread putting it together."

---

*Document version: 1.0*  
*Last updated: December 2025*
