# Polish V2 recommendations and performance-led AI editing

## Build
- Verify the recommendation review popup at desktop and narrow widths, then correct any remaining duplicate navigation, duplicate actions, overflow, or density issues.
- Keep the compact but detailed “Creative shift / Why this direction” and selected-date-versus-recommendation performance comparison.
- Restore filled highlights for added recommendation text using a softer contrasting color that remains readable over blue message surfaces; keep removed historical words struck through.
- Make every unreviewed card clearly say “Pending Review” with the existing tilted accent treatment, while reviewed cards retain their settled appearance.
- Add a small card-level performance signal, including a clear declining state for underperforming campaigns such as 15 Months+.
- Complete the remaining V2 refinements: use the familiar assistant presentation, keep the opening month-neutral while explaining year-round fallback, remove duplicate AI update controls, and ensure all 11 invite campaigns appear in Results.

## Improve with AI flow
- Change “Improve with AI” so it closes the comparison and opens that exact campaign in the full campaign editor.
- Open the editor with its AI panel already active on the relevant channel/audience rather than changing recommendation content in place.
- Prefill the AI conversation with a concise explanation of what the stronger historical version did well, a question about applying that approach to the current Directful recommendation, and focused suggestion chips based on the winning idea, tone, offer, or CTA.
- Keep the current Directful recommendation as the editable baseline. AI suggestions remain reviewable, show why they were written, and support Apply changes plus See changes / Hide changes before saving.

## Validation
- Exercise announcement → all-suggestions review → card-specific review → underperformance → Improve with AI → editor/AI suggestion → compare/apply.
- Check desktop and narrow layouts, all 11 Results cards, labels and card status visuals, plus browser console/runtime/build diagnostics.

## Technical notes
- Extend the existing editor and AI panel with optional initial context/actions rather than creating a second editing experience.
- Keep all changes in the existing V2 presentation and demo-state layer; no new persistence or backend work.
