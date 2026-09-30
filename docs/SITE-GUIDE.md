# BORJSS — what every page does

99 pages. One line each.

| Part | Pages | Who sees it |
|---|---|---|
| Public site | 44 | Anyone |
| Sign-in | 5 | Anyone |
| Portal | 50 | Signed-in users, by role |

---

## Public site — 44 pages

### Home and search

| Page | What it does |
|---|---|
| `/` | Landing page — hero, founder, current issue, recent articles |
| `/search` | Searches articles, issues, news and policies. Weighted scoring |

### Articles and issues

| Page | What it does |
|---|---|
| `/articles` | All published articles. Filter by section, type, year |
| `/articles/[slug]` | One article — abstract, authors, references, downloads |
| `/issues` | Archive of every issue |
| `/issues/current` | The latest issue |
| `/issues/[issueId]` | One issue and its table of contents |

### About the journal

| Page | What it does |
|---|---|
| `/about` | What the journal is |
| `/about/aims-scope` | What subjects it publishes — the ten sections |
| `/about/editorial-board` | Who runs it |
| `/about/journal-information` | ISSN, frequency, publisher, licence |
| `/about/history` | How the journal started |
| `/indexing` | Where the journal is indexed and archived |
| `/contact` | Contact form |

### For authors

| Page | What it does |
|---|---|
| `/for-authors/guidelines` | How to prepare a manuscript |
| `/for-authors/how-to-submit` | How to submit — for visitors who are not signed in |
| `/for-authors/submission-process` | What happens after you submit |
| `/for-authors/templates` | Manuscript templates |
| `/apc` | What publishing costs, and waivers |

### For reviewers

| Page | What it does |
|---|---|
| `/for-reviewers/guidelines` | How to review for the journal |
| `/for-reviewers/become-a-reviewer` | Application form |

### News

| Page | What it does |
|---|---|
| `/announcements` · `/announcements/[slug]` | Calls for papers, notices |
| `/news` · `/news/[slug]` | Journal news |
| `/events` · `/events/[slug]` | Conferences, workshops |

### Policies — 17 pages

Each is a commitment to authors. `/policies/…`

| Page | Covers |
|---|---|
| `peer-review` | Double-blind review, timelines, appeals |
| `publication-ethics` | COPE basis, misconduct, sanctions |
| `research-ethics` | Ethics approval, consent, vulnerable participants |
| `research-integrity` | Method reporting, data and image integrity |
| `authorship` | Who counts as an author, author order, disputes |
| `conflict-of-interest` | Financial and non-financial interests |
| `reviewer-ethics` | Confidentiality, the AI prohibition, tone |
| `editorial-independence` | Publisher does not influence decisions |
| `plagiarism` | Screening, self-plagiarism, what happens when found |
| `open-access` | Free to read, how it is paid for, self-archiving |
| `copyright` | Authors keep copyright |
| `licensing` | CC BY 4.0, what readers may do |
| `ai-policy` | AI cannot be an author; what must be disclosed |
| `retraction-correction` | Corrections, expressions of concern, retractions |
| `complaints-appeals` | How to appeal a decision, how to complain |
| `data-availability` | Data statements, where to deposit |
| `privacy` | What the site collects — written against the code |

---

## Sign-in — 5 pages

| Page | What it does |
|---|---|
| `/login` | Sign in |
| `/register` | Create an account |
| `/forgot-password` | Ask for a reset link |
| `/reset-password` | Set a new password |
| `/verify-email` | Confirm an email address |

---

## Portal — 50 pages

One portal for everyone. Your roles decide what you see.

### Everyone

| Page | What it does |
|---|---|
| `/dashboard` | Your counts, what needs attention, recent activity |
| `/profile` | Your details |
| `/profile/orcid` | Link your ORCID iD |
| `/profile/notifications` | Which emails you get |

### Author — your own manuscripts

| Page | What it does |
|---|---|
| `/submissions` | Your manuscripts, filterable |
| `/submissions/[id]` | One manuscript — status, files, reviewers' progress |
| `/submissions/[id]/revisions` | Revision history |
| `/submissions/[id]/messages` | Messages with the editorial office |
| `/submissions/[id]/decision` | The decision letter. Says "Reviewer 2", never a name |

### Submission wizard — 6 steps

| Page | Asks for |
|---|---|
| `/submissions/new` | Type, section, title, eligibility |
| `.../[draftId]/upload` | Manuscript, title page, cover letter |
| `.../[draftId]/metadata` | Title, abstract, keywords, funding |
| `.../[draftId]/contributors` | Authors in order, one corresponding |
| `.../[draftId]/declarations` | Ethics, AI, data statements |
| `.../[draftId]/review` | Check everything, then submit |

### Reviewer

| Page | What it does |
|---|---|
| `/reviews` | Your invitations and reviews |
| `/reviews/[id]` | One task — abstract, files, accept or decline |
| `/reviews/[id]/submit` | The review form — six scores, comments, declarations |

### Editor

| Page | What it does |
|---|---|
| `/editorial/queue` | Every manuscript. Sorted by what has waited longest |
| `/editorial/[id]` | One manuscript, editor's view — author names visible |
| `/editorial/[id]/reviewers` | Pick reviewers. Shows matches and conflicts |
| `/editorial/[id]/decision` | Read the reports, write the decision |
| `/editorial/[id]/production` | Has it reached production, which issue |
| `/editorial/reviewers-db` | The reviewer pool — expertise, turnaround, availability |
| `/editorial/issues` | Issues being assembled |
| `/editorial/issues/new` | Plan a new issue |
| `/editorial/issues/[id]` | One issue and its running order |
| `/editorial/issues/[id]/edit` | Change it |

### Production

| Page | What it does |
|---|---|
| `/production` | The production queue. Sorted by stalled longest |
| `/production/[id]/copyedit` | Copyediting checklist |
| `/production/[id]/galleys` | Typeset files — every version kept |
| `/production/[id]/proofread` | Proof corrections, one by one |

### Admin

| Page | What it does |
|---|---|
| `/admin/users` | All accounts. Edit, suspend, delete |
| `/admin/users/new` · `/[id]` · `/[id]/edit` | Create, view, edit an account |
| `/admin/roles` | The 12 roles and what each may do |
| `/admin/announcements` | Manage announcements, news and events |
| `/admin/announcements/new` · `/[kind]/[slug]/edit` | Write or edit a post |
| `/admin/statistics` | Submissions, acceptance rate, turnaround |
| `/admin/doi` | DOI register — which articles are deposited |

### Settings

| Page | What it does |
|---|---|
| `/admin/settings/journal` | Journal identity — ISSN, publisher, contact |
| `/admin/settings/sections` | Subject sections. Add, rename, remove |
| `/admin/settings/review-forms` | The criteria reviewers score on |
| `/admin/settings/email-templates` | The 15 emails the portal promises |
| `/admin/settings/policies` | All 17 policies and when each was reviewed |

### Super admin only

| Page | What it does |
|---|---|
| `/admin/audit-log` | Who did what. An admin cannot see their own log |
| `/admin/integrations` | Crossref, ORCID, plagiarism — what is connected |

---

## Three things worth knowing

**Double-blind.** Authors never see reviewer names — the portal shows
"Reviewer 2". Reviewers never see author names. This is built into the data,
not just hidden on each screen.

**One portal, not four.** An author who is also a reviewer and an editor signs
in once and sees all three.

**Nothing saves yet.** Every form works and validates, but there is no database
yet. Each screen says so, and gives the email address that does work today.
