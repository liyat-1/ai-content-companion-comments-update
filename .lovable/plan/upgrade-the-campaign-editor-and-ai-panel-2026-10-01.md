# Upgrade the campaign editor and AI panel

## Goal
Bring the campaign editor close to the supplied reference: a clean, near-full-screen editing workspace on the left and a contextual preview or AI workspace on the right, without changing campaign logic or copy generation.

## Build
- Recompose the editor into a balanced split workspace with a compact header, clear Text/Email controls, and a cleaner active Direct/OTA editing surface.
- Make **Edit with AI** replace the right preview area with the same polished assistant panel for both direct editing and **Improve with AI** entry.
- Keep the AI conversation, proposal cards, compare/apply/keep actions, attachments, suggestion chips, and persistent composer.
- Redesign the minimized AI state as a small docked assistant card that remains visible without covering the editor and restores in one click.
- Add **Compare to previous** beside Edit with AI. Use a simple dated-version selector and replace the right preview with the chosen historical content.
- Let users restore only the selected audience/channel version into the draft after explicit confirmation. Returning to Current restores the live draft preview without losing edits.
- Preserve Direct/OTA and Text/Email separation, promotions/media, unsaved-change protection, and performance context from Results V2.

## Verification
- Test direct editor entry and Improve with AI entry.
- Test preview → AI → minimized → restored → preview transitions.
- Test historical selection, dynamic preview, restoration, and return to current content for Text and Email.
- Check desktop and narrow layouts, keyboard focus, overflow, console errors, and current build status.

## Technical details
- History remains demo/editor data only; no backend or persistence changes.
- Reuse the existing editor, AI panel, preview components, semantic tokens, and design-system buttons.
- Add a small typed historical-version source mapped by campaign, audience, and channel so restoration changes only the currently selected content.
