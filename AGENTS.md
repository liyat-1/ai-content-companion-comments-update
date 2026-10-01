<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Content Library cards own their channel/audience preview state so each card only exposes channels the campaign actually sends.
- Campaign-level AI editing replaces the live preview in context and can minimize to a persistent rail without covering or resetting the editor.
- Package AI planning opens as the sole full workspace, then minimizes into a 440px assistant rail beside the calendar; narrower screens stack instead of compressing.
- AI chat transcripts and attachment composers use the installed AI Elements primitives so chat behavior stays consistent.
- Content release data lives in src/lib/releases.ts as one mock source for Content, Releases and Results.
- Releases and Results use one selected publication and its matching prior-period comparison; no unrelated analytics hierarchies. The year-round foundation stays live underneath seasonal publications.
- The Library opens on an events-horizon starter; "Keep current content" reveals the published library, "Localize with AI" opens the full planner.
- Published content navigates by content period: one schedule header with the month on top and the selected period below, previous/next controls, today's period marked Current; no separate timeline box.
- Calendar uploads from the starter and Events & Holidays flow through one CalendarUploadDialog (drag-drop or local file) and land on Events & Holidays.
- Event photos and per-type icons come from src/components/content/eventImages.ts, shared by starter cards, the visual content plan, and the calendar; images are imported statically (never `new URL(..., import.meta.url)`, which breaks SSR/hydration).
- Results campaigns are cards with property usage, prior comparison, an AI insight, and Use previous version only when the prior version performed better.
- Performance-led reuse compares an actual historical copy snapshot with current library copy, then offers an AI-inspired draft for explicit review; never auto-publish a prior version.
- AI refresh direction cards use human-centered editorial poster illustrations with blue, purple, and pink backgrounds so recommendations feel expressive without photography.
- Library V2 opens on the Directful-owned automated invite refresh: announcement → focused recommendation review/edit. Campaign timing stays in top navigation; each recommendation owns Direct/OTA, Email/Text, dated history, performance, and property adoption — why: hoteliers evaluate one complete recommendation instead of scanning an overview.
- Performance-led V2 improvement opens the existing campaign editor with Directful AI active and the stronger historical pattern supplied as context; it never mutates copy inside the comparison popup — why: users explicitly review and apply AI changes in the editing workspace.
