# SeqView — Rough Design Document

## NOTES
- This is a rough design, open to modification as needed
- This is a personal project with a quick turnaround time in mind, do not go for perfection
- I (user) am not a bioinformatician, so you (assistant) must guide me with design decisions
- I (user) am not a JS dev, so you (assistant) must guide me with JS decisions and code.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Full-stack React, API routes, easy Vercel deploy |
| Styling | Tailwind CSS | Fast iteration, utility-first |
| Database | Supabase (PostgreSQL) | Free tier, real-time capable, easy setup |
| Deployment | Vercel | Zero-config for Next.js |
| Package Manager | pnpm | Fast, disk-efficient |

## Overview

A web platform for viewing, annotating, and sharing biological sequences. Users can paste DNA/RNA sequences, translate them to proteins, add annotations to mark regions of interest, comment on specific positions or annotations, and share their work via URL.

**Target users:** Researchers, biotech teams, collaborators who need to discuss sequence data.

**Inspiration:** Benchling's sequence viewer (but simpler).

---

## Core Concepts Reference

| Term | Definition |
|------|------------|
| Sequence | A string of nucleotides (A, T, G, C for DNA; A, U, G, C for RNA) |
| Translation | Converting nucleotides → Protein using codon table (3 nucleotides = 1 amino acid) |
| Codon | 3-nucleotide unit that maps to one amino acid (e.g., AUG → Methionine) |
| Reading Frame | Starting offset for translation (0, 1, or 2). Frame 1 skips first base, etc. |
| Stop Codon | Codons that signal end of protein: UAA, UAG, UGA (or TAA, TAG, TGA in DNA) |
| Annotation | A labeled region on a sequence (start, end, label, color) |
| Comment | Discussion attached to an annotation or position |
| FASTA | Common file format: `>name\nATGCGATCG...` |

---

## Data Model (Conceptual)

```
Sequence
├── id, name, nucleotides, type (DNA/RNA - auto-detected)
├── view_slug (for read-only public URLs)
├── edit_token (for edit access - separate secret URL)
├── created_at
│
├── Annotations[]
│   ├── id, sequence_id, start, end
│   ├── label, color, type (optional: gene, promoter, CDS, etc.)
│   │
│   └── Comments[]
│       └── id, annotation_id, author, text, created_at
│
└── Comments[] (sequence-level)
    └── id, sequence_id, position (optional), author, text, created_at
```

**Key decisions:**
- **Auto-detect DNA vs RNA**: If sequence contains U → RNA, if contains T → DNA
- **Two-URL model**: `/view/{slug}` for read-only, `/edit/{token}` for editing (no auth needed)
- **Sequence limit**: 100,000 bases max (covers most genes, some small genomes)
- **No strand field**: Removed from initial scope (no reverse complement support yet)

Keep it normalized — sequences, annotations, and comments in separate tables with foreign keys.

---

## Development Stages

### Stage 1: Static Viewer ✅ COMPLETE

**Goal:** Display a sequence with position markers. No database, no persistence.

**Scope:**
- Text input for pasting sequence
- Validate input: allow A, T, G, C (DNA) or A, U, G, C (RNA)
- Auto-detect type: presence of T → DNA, presence of U → RNA
- Reject mixed T+U sequences (invalid)
- Enforce max length: 100,000 bases
- Display sequence in rows (60 bases per row, standard convention)
- Show position numbers (1, 61, 121, ...)
- Color-code bases (A=green, T/U=red, G=yellow, C=blue — common convention)
- Dark theme styling

**Out of scope:** Translation, annotations, saving, sharing.

**Done when:** You can paste `ATGCGATCGATCGATGCGATCGATCGATGCGATCGATCGATGCGATCGATCGATGCGATCGATCGATGCGATCGATCG` and see it formatted nicely with colored bases.

---

### Stage 2: Translation ✅ COMPLETE

**Goal:** Show protein translation below the sequence.

**Scope:**
- Implement full codon table (64 codons → amino acids, client-side)
  - For DNA: treat T as if it were U (standard practice)
  - For RNA: use directly
- Translate sequence in reading frames 0, 1, 2
- Display amino acids aligned below codons (one letter codes: M, A, K, etc.)
- Show stop codons distinctly (* in red/bold)
- Handle orphan bases: Frames 1/2 show orphan bases at start (grayed out, not translated)
- Toggle to show/hide translation
- Dropdown to switch reading frames (0, 1, 2)

**Out of scope:** Reverse complement, 6-frame translation, ORF detection.

**Done when:** You see `ATG` with `M` (Methionine/Start) below it, aligned properly. Can switch frames and see orphan bases handled correctly.

---

### Stage 3: Annotations (Local Only) ✅ COMPLETE

**Goal:** Create and display annotations on the sequence.

**Scope:**
- **Selection methods:**
  - Drag selection: Click and drag across bases to select region
  - Click selection: Click start position, then click end position (alternative method)
- Form to add: label (required), color (picker with 8 presets), type (optional dropdown: gene, promoter, CDS, misc)
- Display annotations as Benchling-style colored bars below sequence rows (not highlighting bases)
- Lane packing: Non-overlapping annotations appear on same line; overlapping ones stack vertically
- List annotations in a sidebar panel
- Edit annotations: Change label, color, type
- Delete annotations: Remove via sidebar
- Click annotation in sidebar → scroll/jump to that region with temporary highlight
- Store in React state (no persistence yet)

**Out of scope:** Database persistence, overlapping annotation resolution (last annotation wins).

**Done when:** You can drag-select bases 10-50, label it "Promoter", see it as a colored bar below the sequence, edit it, and delete it.

---

### Stage 4: Persistence

**Goal:** Save sequences and annotations to a database.

**Scope:**
- Set up Supabase project + database tables
- Create sequence → generates view_slug + edit_token
- Save annotations linked to sequence
- Load sequence + annotations on page load via slug
- Basic CRUD for annotations (edit, delete) — requires edit_token

**Out of scope:** Auth, comments.

**Done when:** Refresh the page and your data is still there.

---

### Stage 5: Sharing

**Goal:** Share a sequence via URL with two access levels.

**Scope:**
- Two URLs per sequence:
  - **View URL**: `/view/{slug}` — read-only, safe to share publicly
  - **Edit URL**: `/edit/{token}` — full edit access, share only with collaborators
- "Copy view link" and "Copy edit link" buttons
- Edit page shows both links; View page only shows view link
- Short, URL-safe slugs (nanoid, ~10 chars)

**Out of scope:** Permissions beyond view/edit, private sequences, expiring links.

**Done when:** You can send a view URL to someone and they see your annotated sequence (read-only). Edit URL allows changes.

---

### Stage 6: Comments

**Goal:** Add discussion layer.

**Scope:**
- Add comment on an annotation
- Add comment on a position (click base → comment)
- Display comments in sidebar or popover
- Author field (simple text input, no auth)
- Timestamp

**Out of scope:** Threading, replies, resolve/unresolve.

**Done when:** You can add a comment saying "Check this region" on an annotation.

---

### Stage 7: Polish & Deploy

**Goal:** Production-ready.

**Scope:**
- Error handling throughout
- Loading states
- Mobile responsiveness (basic)
- Deploy to Vercel
- Test with real sequence data
- README with instructions

**Nice to have if time:**
- FASTA file upload
- Export annotations as JSON/CSV
- Keyboard shortcuts
- Dark mode

---

## API Shape (Rough, open to modification)

```
# Sequences
GET    /api/sequences/:slug           → { sequence, annotations, comments }
POST   /api/sequences                 → { view_slug, edit_token }

# Annotations (require edit_token in body/header)
POST   /api/annotations               → { annotation }
PATCH  /api/annotations/:id           → { annotation }
DELETE /api/annotations/:id           → { success }

# Comments (require edit_token for edit pages, optional author)
POST   /api/comments                  → { comment }
```

**Note:** Edit operations validate the `edit_token` matches the sequence. View operations only need the `view_slug`.

---

## File Structure Suggestion

```
seqview/
├── app/
│   ├── layout.tsx              # Root layout (fonts, global styles)
│   ├── page.tsx                # Home page (paste sequence form)
│   ├── view/
│   │   └── [slug]/
│   │       └── page.tsx        # Read-only sequence viewer
│   ├── edit/
│   │   └── [token]/
│   │       └── page.tsx        # Editable sequence viewer
│   └── api/
│       ├── sequences/
│       │   └── route.ts        # POST: create sequence
│       ├── sequences/[slug]/
│       │   └── route.ts        # GET: fetch sequence
│       ├── annotations/
│       │   └── route.ts        # POST: create annotation
│       ├── annotations/[id]/
│       │   └── route.ts        # PATCH, DELETE annotation
│       └── comments/
│           └── route.ts        # POST: create comment
│
├── components/
│   ├── SequenceViewer.tsx      # Main sequence display component
│   ├── SequenceInput.tsx       # Paste/input form
│   ├── SequenceRow.tsx         # Single row of bases + annotation track
│   ├── CodonGroup.tsx          # Codon triplet with amino acid below
│   ├── Base.tsx                # Single nucleotide base
│   ├── TranslationControls.tsx # Toggle + reading frame selector
│   ├── AnnotationTrack.tsx     # Benchling-style annotation bars below sequence
│   ├── AnnotationForm.tsx      # Create/edit annotation modal
│   ├── AnnotationList.tsx      # Sidebar list of annotations
│   ├── CommentPanel.tsx        # Comments sidebar/popover (TODO)
│   └── ShareLinks.tsx          # Copy link buttons (TODO)
│
├── lib/
│   ├── supabase.ts             # Supabase client setup
│   ├── codonTable.ts           # DNA/RNA → Amino acid mapping
│   ├── sequenceUtils.ts        # Validation, type detection, formatting
│   └── slugs.ts                # Nanoid generation for slugs/tokens
│
├── types/
│   └── index.ts                # TypeScript types (Sequence, Annotation, etc.)
│
├── public/                     # Static assets
├── tailwind.config.ts
├── next.config.js
├── package.json
└── README.md
```

---

## Checklist

- [ ] URL is accessible publicly
- [x] Can paste/input a sequence
- [x] Sequence displays with position numbers
- [x] Translation works (all three frames: 0, 1, 2)
- [x] Can create annotations (drag or click to select region, add label/color)
- [x] Can edit annotations (change label, color, type)
- [x] Can delete annotations
- [ ] Annotations persist across refresh
- [ ] Can add comments
- [ ] Can share via URL
- [x] Doesn't crash on edge cases (empty input, invalid characters)

---

## Notes

- Start ugly, make it work, then make it pretty
- Document everything relevant in the README.md file
- Test with real sequences (Google "example DNA sequence FASTA")
- If stuck on UI, focus on functionality first


## Exact task

Build a sequence viewing, annotating, and sharing platform — add the ability to translate sequences, annotate them with labels, and add comments. Take inspiration from Benchling’s interface. Send over a URL where we can try and test this platform.
