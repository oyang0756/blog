---
name: pptx
description: Create and edit PowerPoint presentations using pptxgenjs and python-pptx. Covers design principles, layout options, typography, and QA process.
---

# PPTX Skill

Create and edit PowerPoint presentations using pptxgenjs and python-pptx.

## Quick Reference

- **Read/analyze**: `python -m markitdown presentation.pptx`
- **Edit templates**: See `editing.md`
- **Create from scratch**: See `pptxgenjs.md`

## Design Principles

1. **Pick bold, topic-specific color palettes** (avoid generic blue)
2. **Use dark/light contrast** with "sandwich" structure
3. **Commit to ONE visual motif** across all slides

## Layout Options

- Two-column layouts
- Icon + text rows
- Grid layouts
- Large stat callouts

## Typography

- Use interesting font pairings (not default fonts)
- Titles: 36-44pt, Body: 14-16pt

## QA Process

1. Content check with `markitdown`
2. **Use subagents** for visual inspection
3. Convert to images via PDF for inspection

## Common Mistakes to Avoid

- Text-only slides
- Accent lines under titles
- Low contrast elements
- Repeated layouts

## Key Files

- `pptxgenjs.md` — Creating presentations with pptxgenjs
- `editing.md` — Editing existing templates
