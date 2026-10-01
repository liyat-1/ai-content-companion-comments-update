# Upgrade the campaign editor and AI panel

## Goal
Bring the campaign editor close to the supplied reference: a clean, full editing workspace on the left and a contextual preview/AI workspace on the right, without changing campaign logic or copy generation.

## Build
- Recompose the editor into a near-full-screen, balanced split workspace with a compact header, clear Text/Email controls, and a cleaner active Direct/OTA editing surface.
- Make **Edit with AI** replace the right preview area with a polished standard assistant panel, whether opened directly or from **Improve with AI**.
- Give the AI panel a useful empty state, compact suggestion chips, conversation history, proposal cards, compare/apply/keep actions, attachments, and a persistent composer.
- Keep the existing minimize control; redesign the minimized state as a small docked assistant card that remains visible without covering the editor and restores in one click.
- Add **Compare to previous** beside Edit with AI. Opening it reveals a simple dated-version selector and replaces the right preview with the selected historical content.
- Let users restore the selected previous Text or Email content into the draft, with an explicit confirmation and the normal Save changes flow; switching back to Current restores the live draft preview without discarding edits.
- Preserve separate Direct/OTA and Text/Email content, existing promotions/media, unsaved-change protection, and the historical-performance context passed from Results V2.

## Verification
- Check direct editor entry and Improve with AI entry.
- Verify preview → AI → minimized → restored → preview transitions.
- Verify previous-version selection, dynamic historical preview, restore action, and return to current content for both Text and Email.
- Check desktop and narrow layouts, keyboard focus, overflow, console errors, and the latest build status.

## Technical details
- Keep history as demo/editor data only; no backend or persistence changes.
- Reuse the existing `CampaignEditor`, `AiEditPanel`, preview components, semantic tokens, and design-system buttons.
- Add a small typed historical-version source mapped by campaign, audience, and channel so restoration updates only the currently selected content.
