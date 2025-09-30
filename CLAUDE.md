# Claude Code Instructions

## Development Guidelines

### Code Modification Rules
- Only modify existing code when explicitly requested
- Add new features as separate files/functions
- Preserve all working functionality
- No emojis in generated code/text (keep existing ones)

### Current Project Status
- Phase 1: Complete (UI/Structure)
- Phase 2: Complete (API Integration)
- All core features are stable and working

### Testing Before Changes
```bash
npm run dev          # Test locally
npm run build        # Check build
npm run type-check   # TypeScript validation
```

### Protected Core Files
- `src/lib/score/*` - Recently refactored scoring system
- `src/lib/validation/*` - All validation logic
- `src/components/ui/*` - shadcn/ui components