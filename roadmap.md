## Events page restyle (calendar reference)

- [x] Add pastel event-chip tokens (light + dark) for Holiday / Local event / Seasonal
- [x] Rebuild Events & Holidays: left rail (mini calendar, category legend, calendars), Today header, filled today circle, pastel chips
- [x] Verify desktop and narrow widths, no console errors

# Roadmap

- [x] Channel strategy: manage mode, selectable cards, floating panel, Apply/Done
- [x] Card edit metadata (who/when) moved to bottom row with tooltip
- [x] Media: folder create/rename/delete, media rename, upload, drag & drop, filters
- [x] Media picker: folder sidebar, search, realistic image/video/document thumbnails
- [x] Email editor: compact Template + Layout cards with a side layout library
- [x] Verified in preview (strategy, folders, layout library) — no console errors
- [x] Add a clear media section to email with image and video support
- [x] Redesign video thumbnails and polish folder-specific upload areas
- [x] Verify media polish in the preview at desktop and narrow widths — no console errors
- [x] Polish all marketing pages with a cohesive professional visual system
- [x] Add varied realistic media assets to the built-in media library
- [x] Show real imagery in template and layout selection, matching the email preview
- [x] Verify all marketing routes at desktop and mobile widths

## Marketing Messages product model and polish

- [x] Reframe campaign pages under Marketing Messages with section navigation, Copy from, and compact complimentary-text banner
- [x] Add global guest-type promotions with campaign-level overrides and a searchable promotion selector
- [x] Add global and campaign-level revert confirmations with the requested scope guarantees
- [x] Rebuild campaign cards around purpose, strategy, per-channel customization, promotion, Test, Edit content, and overflow actions
- [x] Add the contextual Edit automated content confirmation before opening each campaign editor
- [x] Convert the campaign editor to explicit draft/save behavior with unsaved-change protection and active-campaign save confirmation
- [x] Keep Direct/OTA and Text/Email content independent, with channel-level Default/Customized status
- [x] Restrict media attachments to Text and retain searchable folders plus in-editor upload/drop
- [x] Preserve content through layout changes and protect customized content during template changes
- [x] Stage channel-strategy changes in the floating panel, show dynamic strategy groupings, then commit once with Apply
- [x] Polish the centralized Media area, including safe folder deletion and live folder updates in campaign media pickers
- [x] Align Drip Campaign with the three supported channel strategies and Directful Marketing Messages branding
- [x] Verify every marketing page and critical workflow at desktop and mobile widths

## Marketing Messages workflow refinement

- [x] Replace campaign enable text with card toggles and keep the bulk enable/disable action state-aware
- [x] Simplify cards to campaign identity, strategy, updater avatar/date, and primary actions
- [x] Restore the compact channel-strategy panel with Select all and capped invite chips per strategy
- [x] Rebuild promotion management around invite/audience selection plus staged promotion assignment
- [x] Move campaign promotion controls into the Direct/OTA editor sections
- [x] Simplify the edit warning and retain the closable editor overlay with unsaved-change protection
- [x] Keep media Text-only; polish upload, scrolling, sizing, and remove folder filters from the picker
- [x] Expand content-rich template previews and structure-only layout choices without altering content
- [x] Add PPTX, CSV, XLSX, and other representative media samples
- [x] Polish and verify all marketing pages across desktop and mobile preview sizes

## Promotion assignment rework

- [x] Simple promotion badge on campaign cards
- [x] Replace collapsible promotions page with flat list plus Assign/Edit button
- [x] Full overlay: three automated message sections as drop targets, draggable campaign list, Direct/OTA checkboxes
- [x] Fixed hydration mismatch when saved marketing state differs from the seed (deferred localStorage load)
- [x] Verified badge, assign overlay, add/remove and Direct/OTA toggles at desktop and mobile widths — no console errors

## Collapsible tools section and sharp edges

- [x] Wire the collapsible Manage channel strategy / Manage promo / Text media section into the campaign pages (replaces the old media rail and duplicate header buttons)
- [x] Manage promo panel opens the per-segment promo manager (Direct/OTA rows with searchable change)
- [x] Promotion creation form with code type, discount %, minimum nights, tagline, and validity dates
- [x] Promotion cards show code type, discount, minimum nights, and validity
- [x] Square off remaining pill and large-radius shapes across marketing (max 8px, most 3px)
- [x] Remove superseded MediaDock / PromoDropOverlay / StrategyBar components
- [x] Type check passes; verify tools section, promo creation, and rounding at desktop and mobile widths

## Promotion editor overlay and banner templates

- [x] Pop-up overlay for creating and editing promotions: Details section (code beside code type) plus a Banner design section with a live guest preview
- [x] Five banner layout templates (Ribbon, Ticket, Spotlight, Frame, Minimal) with the eight colour themes
- [x] Logo and background photo slots fed from the media library (demo hotel emblem added under a new Logos folder; uploads supported via the picker)
- [x] Editable banner wording: kicker line, property name, and headline with emoji picker
- [x] Edit and Assign separated on promotion cards; cards show scaled live banner thumbnails
- [x] Verified create/save/reopen, edit-existing, template and colour persistence, logo pick, and mobile width — no console errors

## Promotion workflow and content previews

- [x] Stack campaign tools vertically on desktop and mobile
- [x] Separate promotion maintenance and assignment into tabs
- [x] Add duplicate and safe delete actions for promotions
- [x] Move promotion preview to the bottom of the promotion editor
- [x] Move campaign promotion controls below content with a Change action
- [x] Show attached promotions in text and email previews
- [x] Verify promotion workflows at desktop and mobile widths

## Promotion presentation polish

- [x] Add direct promotion removal inside campaign content editing
- [x] Restyle the edit-content warning with clear warning hierarchy
- [x] Add modern promotion banner templates
- [x] Place promotions naturally before email buttons
- [x] Replace unclear starter promotion wording
- [x] Verify updated workflows and previews

## Promotion banner and editor cleanup

- [x] Convert campaign content editing from a full-screen takeover to a large popup
- [x] Fix promotion chooser layering and restore interaction after selecting, cancelling, or removing
- [x] Show the short offer description across all banner templates
- [x] Add Upgrade card, Schedule card, and Included perks image-led templates
- [x] Add matching template previews to the promotion editor
- [x] Verify the editor and chooser at desktop and mobile widths

## Campaign management and content editor redesign

- [x] Replace the collapsible strategy panel with one launcher button plus direct promo/media buttons with status counts
- [x] Show strategy explanations beneath each drop column with a "What does this mean?" help control in the popup
- [x] Rebuild promo assignment around four user-chosen offer areas with a "Choose promotion" picker
- [x] List campaigns as a draggable horizontal row below the offer areas
- [x] Add Direct/OTA checkboxes on each campaign/offer relationship with conflict notes
- [x] Add All/Direct/OTA global media targets and per-campaign per-audience drops and removals
- [x] Make media helpers audience-scoped while keeping combined campaign summaries
- [x] Replace editor tabs with Direct/OTA audience sections driving the persistent preview
- [x] Move media/promotion (text) and promotion (email) into expandable Advanced settings
- [x] Keep template/layout secondary in email editing; copy fields first
- [x] Add History, Help and Spam check panels to each audience section
- [x] Refresh the phone frame and iMessage preview with frosted-glass chrome
- [x] Verified overlays, drag model, editor panels, and email/text previews via Playwright — no console errors; typecheck clean

## Promotion, media, and editor follow-up

- [x] Add a No promotion assignment column and move unassigned campaigns there
- [x] Replace the separate campaign row with drag-and-drop between assignment columns
- [x] Add assigned-media thumbnails and global bulk removal
- [x] Separate media assignment into Text and Email tabs with Direct and OTA targets
- [x] Move Text and Email to top-level editor tabs with Direct and OTA sections inside
- [x] Rename advanced controls to channel-specific professional wording
- [x] Add emoji insertion to Text and Email content fields
- [x] Match the phone preview more closely to the supplied iPhone 17 Pro Max references
- [x] Verify all updated workflows at desktop and mobile widths
- [x] Mouse-drag verified across offer columns (No promotion → offer 1 → offer 2) with no errors
- [x] Phone-width pass on promo manager and content editor — previews and offer banner render correctly

## Config details, media board, phone polish

- [x] Offer columns show a single "See config details" panel (code type, code, discount, minimum nights, validity, per-guest duration, description) with Change/Clear inside
- [x] Media assignment rebuilt on the promo model: fixed campaign column, file columns with Change file / Browse library, Direct/OTA checkboxes
- [x] Both boards are horizontally scrollable with Add offer / Add file, so the count is not fixed at three
- [x] iPhone preview: composer pinned outside the scroll area, frosted glass, larger; content no longer overflows the frame

## Carried over from the credit pause

- [x] Fix the content editor freezing when closing (X) or saving (confirm dialogs sat behind the editor overlay; raised them above)
- [x] Move Change/Clear out of "See config details" onto the promo side; config shows promo details only; media columns get Change file / Clear column directly
- [x] Verify content editor workflows at desktop and mobile widths
- [x] Open and verify the Directful AI Content page (create, generate, review, approve, publish, tabs, Ask panel, mobile)

## Content Library + AI creative workspace

- [x] Content Library side menu: Create, Published, Performance, A/B Tests, History, Settings
- [x] Create workspace: 12 campaign cards with content preview, search, filters, Create manually / Create with Directful AI
- [x] Immersive AI creation: timeframe first, discoveries, direction chat, plan, live generation, "Your content is ready"
- [x] Three-column review editor with segment switch, Edit with AI, intelligence panel, checklist, approve, publish
- [x] Put "Edit with AI" inside the existing Marketing campaign editor too

## AI Content library refinement

- [x] Replace the attached right-side AI editor with a centered, floating workspace over a softened editor backdrop
- [x] Remove search, filter tabs, and manual-create controls from the Content Library; show campaigns directly
- [x] Add card-level Email/Text and Direct/OTA preview controls, limited to each campaign's actual channels
- [x] Keep all primary actions blue and make AI-authored campaign cards visibly distinct
- [x] Reuse the existing campaign editor structure for Content Library editing and remove the review checklist

## Publishing-first content management

- [x] Make the current, year-round published package the first view, with month navigation and contextual future-month personalization
- [x] Show campaign cards across invites, transactional and in-property, with only Edit content and Test as primary actions
- [x] Make AI creation a package-level monthly planning flow with flexible dates, attachments and review before publication
- [x] Align Published and Performance views with the monthly package mental model and clearly label sample figures
- [x] Verified all Content Library pages (Create, Published, Performance, History, A/B Tests, Settings) at desktop and mobile widths — no console errors

## Calendar-led Content Library and AI creation flow

- [x] Rebuild the published-content landing view around a centered monthly calendar and version selector
- [x] Show live, scheduled, default, and review states directly over the campaign grid
- [x] Make version switching update campaign-card content and version labels
- [x] Rename the primary header action to Edit content and remove package/campaign/availability summary blocks
- [x] Redesign AI creation as a focused assistant workspace with persistent multimodal composer
- [x] Move timeframe, discovered context, plan review, and approval into the conversation body
- [x] Add attachment chips and local file input for documents, spreadsheets, images, and video
- [x] Build generated-content review with dynamic Preview, Edit with AI, Compare, and Content insight modes
- [x] Limit AI edit suggestions to five and simplify personalization controls
- [x] Keep draft Save changes separate from the top-level Publish all action
- [x] Verify calendar, AI planning, review, version switching, and publish flows at desktop and mobile widths
- [x] Keep review guest-segment selection synchronized across Preview, Edit with AI, Compare, and Content insight

## Content release workspace refinement

- [x] Merge the calendar, version controls, personalization prompt, and campaigns into one continuous workspace
- [x] Open Edit content with AI directly in-page and remove the default-content choice popup
- [x] Expand the AI plan with events, holidays, creative direction, media, templates, and performance learning
- [x] Restore a richer generation state and allow publishing the complete timeframe without mandatory review
- [x] Give generated cards channel/audience previews and a single Review action
- [x] Embed AI editing inside the review's dynamic panel instead of opening a second popup
- [x] Verify the complete release flow at desktop and narrow widths

## Publication-led Releases and Results redesign

- [x] Add year-grouped publication history with an unmistakable selected and live publication
- [x] Rebuild Releases around publication details, AI change summary, months, campaigns, and versions
- [x] Rebuild Results around publication-specific KPIs, comparisons, insights, months, and campaigns
- [x] Apply the selected editorial-ledger layout with Directful colors and Roboto
- [x] Verify both pages and their drill-downs at desktop and mobile widths

## Final Content workspace redesign

- [x] Replace campaign AI popup with contextual preview-area editing and a minimizable assistant rail
- [x] Restore campaign-by-campaign AI generation progress and return to optional review/publish

## Meeting-scope Content simplification

- [x] Return Published Content to a focused single-month campaign view
- [x] Simplify Releases to one selected publication, its timeframe, changes, reasons, and included campaigns
- [x] Limit Results to the selected publication and matching prior-year timeframe
- [x] Use click rate, click-to-book, and spam rate with concise AI explanations and external factors
- [x] Remove confidence, voting, unrelated metrics, and extra reporting navigation
- [x] Verify Content, Releases, Results, and publication switching at desktop and mobile widths

## Publication coverage and AI workspace polish

- [x] Clarify year-round fallback and seasonal replacement periods in the publication selector
- [x] Show per-campaign property adoption as one plain-language sentence

## Full AI planning mode

- [x] Open Edit content with AI as a focused full workspace without the Content Library heading
- [x] Minimize AI into a side panel while keeping the calendar and campaigns visible
- [x] Close AI back to the original published-content view and reopen in full mode
- [x] Verify full, minimized, restored, and closed states at desktop and mobile widths
- [x] Restyle full and minimized AI modes from the supplied airy split-workspace references
- [x] Rebuild minimized planning as a purpose-designed assistant rail instead of a compressed full workspace
- [x] Verify publication selection and both AI modes at desktop and mobile widths

## AI panel file testing

- [x] Test every file type (sheet, CSV, Word, slides, PDF, photo, video) in both AI panels, plan cards, apply flow

## Starter screen redesign

- [x] Redesign Content Library opening screen: centered invitation, upcoming events/holidays horizon, two buttons (Localize with AI / Keep current content)
- [x] Constraints: existing Directful color system, Roboto font, reference image two.jpg for layout vibe
- [x] Show 3 design options, implement user's pick (fanned card row)
- [x] Gradient calendar vibe + real event photos on cards; verified both buttons and mobile width — no console errors

## Updated connected Content system

- [x] Add the shared Events & Holidays calendar workspace and calendar-state-aware starter
- [x] Replace fixed monthly packages with exact-date Standard, Event-based, and Seasonal periods
- [x] Align AI planning, generation, review, and publishing around content periods
- [x] Rebuild Published as an active-period timeline
- [x] Merge Releases and performance into connected Results views
- [x] Apply approved terminology and verify the complete workflow

## Connected Content Calendar and Results refresh

- [x] One schedule header: month on top, selected content period below, previous/next controls, Current marked by default
- [x] Visual photo-led "Your content plan" in full and minimized AI planning views
- [x] Events & Holidays rebuilt as a calendar workspace with month navigation, event blocks, side panel, and photo attachment
- [x] Upload modal with drag-and-drop and local-file selection from both entry points, landing on Events & Holidays
- [x] Campaign Results cards with property usage, prior comparison, AI insight, and Use previous version when better
- [x] Verify the refreshed flows at desktop and narrow widths — no console errors

## Events and Results polish with performance-led review

- [x] Refine Events & Holidays calendar presentation and Results hierarchy
- [x] Replace the misleading previous-version toast with sample historical copy review and comparison
- [x] Let AI propose a current, relevant rewrite inspired by the stronger past copy; save only after review
- [x] Verify both pages and the review flow at desktop and narrow widths

## Content Library V2 (separate, simplified)

- [x] Data layer: V2 periods, publish/use-historical actions, seasonal + tone/direction helpers
- [x] Guided AI refresh flow: choose when → how → review plan → generate → review/compare/insight → publish → done/extend
- [x] V2 page: AI-refresh intro (Learn how / Update with AI / Keep current), current-content timer, contextual pusher, month-based published content with content/properties/version dialogs
- [x] V2 results: overview + campaigns, month navigation, AI insight, prior-better card with Improve with AI / Review historical version comparison
- [x] Route /content/v2 with head metadata; Library V2 nav entries (desktop + mobile)
- [x] Typecheck clean; verify in preview, no console errors

## Content Library V2 page completion

- [x] Make AI notice the first screen and reveal the content schedule only after Keep current or AI update
- [x] Rebuild the V2 contents view with V1-style schedule header, campaign cards, property adoption, and history navigation
- [x] Move V2 Results to a separate page and keep metrics there, with review and AI improvement actions
- [x] Retain AI update preferences so subsequent updates reopen with the original choices
- [x] Verify content, Results, and update paths in the preview

## V2 flow and results refinement

- [x] Present the V2 AI flow in the familiar V1 assistant style with recommendations independent of calendar data
- [x] Make the first screen month-neutral and clarify the upcoming year-round fallback, with refresh from that month
- [x] Remove the duplicate Edit AI update control and show all 11 invite campaigns in Results
- [x] Verify the updated notice, month navigation, AI flow, and Results

## V2 performance-led AI editing polish

- [x] Restore compact detailed change rationale and selected-date performance comparison
- [x] Restore filled recommendation highlights with a calmer contrasting treatment
- [x] Add tilted Pending Review states and compact card-level performance indicators
- [x] Open the exact campaign editor with AI active and performance learning prefilled
- [x] Verify review-to-editor handoff, AI suggestions, compare/apply, and narrow layouts
- [x] Use guest recognition and planning timing—not an offer—as the AI's outperformance insight

## V2 recommendation-first review

- [x] Open the focused recommendation detail directly from the announcement instead of a campaign overview
- [x] Add Email/Text previews and Direct/OTA audience controls using campaign-specific content
- [x] Replace previous/next campaign comparison with selectable publication history, defaulting to the replaced version
- [x] Enrich change rationale, performance comparison, property adoption, close, review, and edit actions
- [x] Polish and verify the announcement and recommendation detail at desktop and narrow widths

## Campaign editor and AI panel upgrade

- [ ] Recompose the campaign editor as a balanced split workspace matching the supplied reference
- [ ] Replace the live preview with the standard AI panel and add a compact docked minimized state
- [ ] Add dated previous-version selection, dynamic preview, and selected-channel restoration
- [ ] Verify direct and performance-led entry across desktop and narrow layouts
