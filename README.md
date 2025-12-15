# SeqView

A web platform for viewing, annotating, and sharing biological sequences. Paste DNA/RNA sequences, translate them to proteins, add annotations, and collaborate through comments.

**Live Demo:** [SeqView](https://seq-view.vercel.app/)

## Features

- **Sequence Viewing**: Display DNA/RNA sequences with color-coded bases and position markers
- **Translation**: Translate sequences to proteins in three reading frames (0, 1, 2)
- **Annotations**: Mark regions of interest with labels, colors, and types (gene, promoter, CDS, misc)
- **Comments**: Add discussion threads to annotations
- **Sharing**: Two-tier access model with view-only and edit URLs
- **Persistence**: All data saved to Supabase database

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Deployment**: Vercel

## Usage

### Creating a Sequence

1. Paste a DNA or RNA sequence (A, T, G, C for DNA; A, U, G, C for RNA)
2. Optionally add a name for the sequence
3. Click "View Sequence"
4. You'll be redirected to the edit page with a unique edit token

### Viewing Sequences

- **View URL**: Share this URL for read-only access
- **Edit URL**: Share this URL with collaborators who need to make changes

### Adding Annotations

1. Click and drag across bases to select a region
2. Fill in the annotation form:
   - **Label** (required): Name for the annotation
   - **Color**: Choose from 8 preset colors
   - **Type** (optional): gene, promoter, CDS, or misc
3. Annotations appear as colored bars below the sequence

### Adding Comments

1. Click the chevron icon next to an annotation to expand comments
2. Enter your name (defaults to "Anonymous")
3. Type your comment
4. Click "Add Comment"

### Translation

- Toggle translation on/off with the switch
- Select reading frame (0, 1, or 2) from the dropdown
- Amino acids appear below codons, with stop codons highlighted

## Project Structure

```
SeqView/
├── app/
│   ├── api/              # API routes
│   ├── edit/[token]/     # Edit page
│   ├── view/[slug]/      # View-only page
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utilities (Supabase, translation, etc.)
└── types/                # TypeScript definitions
```

## API Endpoints

### Sequences
- `GET /api/sequences/:slug` - Get sequence by view slug
- `GET /api/sequences/edit/:token` - Get sequence by edit token
- `POST /api/sequences` - Create new sequence

### Annotations
- `POST /api/annotations` - Create annotation (requires `x-edit-token` header)
- `PATCH /api/annotations/:id` - Update annotation (requires `x-edit-token` header)
- `DELETE /api/annotations/:id` - Delete annotation (requires `x-edit-token` header)

### Comments
- `GET /api/annotations/:id/comments` - Get comments for annotation
- `POST /api/comments` - Create comment (requires `x-edit-token` header)
- `DELETE /api/comments/:id` - Delete comment (requires `x-edit-token` header)

## Limitations

- Maximum sequence length: 100,000 bases
- No authentication (edit tokens provide access control)
- Comments are annotation-level only (no position-level comments)
- No reverse complement support
- No FASTA file upload (paste sequences directly)


