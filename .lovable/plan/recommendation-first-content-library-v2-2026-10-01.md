# Recommendation-first Content Library V2

## What will change

- Keep the refreshed-content announcement as the opening screen, but make it more visual and inviting.
- Make “See what Directful recommends” open one complete campaign recommendation immediately, not an all-campaign overview.
- Let people move between campaign timings from the top navigation while staying in the same detailed review.
- Add Direct/OTA and Email/Text controls. Each selection will show its own realistic content preview.
- Style email comparisons like inbox messages and text comparisons like phone conversations.
- Turn the old “Previous content” area into selectable publication history, defaulted to the exact version Directful replaced.
- Make the change explanation more expressive by comparing the old direction with the new direction.
- Keep performance metrics, add property adoption, and provide clear Review, Edit content, and Close actions.

## Technical details

- Extend the campaign mock data in the existing V2 refresh screen with audience- and channel-specific copy plus dated history entries.
- Preserve the current edit and history behavior: selecting an older version creates a new current version and never deletes history.
- Keep the implementation within the existing V2 frontend and session-based demo state.
- Verify the complete flow at desktop and narrow widths, including switching campaigns, audiences, channels, history versions, and opening the editor.