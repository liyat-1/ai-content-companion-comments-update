# drip campaign edit

You're not just redesigning an editor—you're designing the core authoring experience. The biggest mistake most teams make is building a form that happens to generate an email. The best builders treat the email as the source of truth and the inspector as the control panel.



I would create two distinct design directions so you can evaluate them with users.





---



Prompt 1 — Interactive Live Canvas (Recommended)



> Design a world-class email and SMS campaign builder for a modern AI-native SaaS hospitality platform (Directful). The experience should feel as polished as Figma, Framer, Webflow, Canva, and Linear while remaining simple enough for non-technical hotel marketers.



The primary editing surface is a live interactive canvas. Every visible element on the email is directly selectable.



Core Principles



WYSIWYG without becoming cluttered.



Every click should feel intentional.



Zero ambiguity about what is editable.



Professional enterprise SaaS aesthetics.



Extremely clean visual hierarchy.



Fast editing with minimal cognitive load.





Layout



Three-panel layout:



Left Sidebar



Campaign structure



Sections list



Add Section



Templates



Saved Blocks



Assets



Variables



AI Assistant





Center



Live email canvas



Desktop/Mobile preview



Zoom controls



Background outside email



Scrollable email



Sticky toolbar





Right Sidebar Context-sensitive inspector. Changes depending on selected element.



Canvas Interaction



Hovering a section:



Soft outline



Edit icon



Duplicate



Hide



Delete



Drag handle





Clicking selects the section.



Selected section:



Blue outline



Inspector updates automatically.





Images:



Replace



Upload



Crop



Remove



Resize



Alt text



Alignment



Border radius



Background color



Overlay





Logo:



Replace



Remove



Width



Alignment



Link





Text: Floating inline toolbar:



Font



Size



Weight



Color



Alignment



Bold



Italic



Underline



Link



Merge Tags



AI Rewrite



Undo formatting





Buttons:



Label



URL



Tracking



Background



Text color



Radius



Width



Padding



Hover state



Open in new tab





Divider:



Thickness



Width



Color



Margin





Spacer:



Height





Social icons:



Platform selection



Reorder



Color



Size



Links





Footer:



Address



Unsubscribe



Preferences



Copyright



Company info





Dynamic blocks:



Personalized greeting



Guest name



Hotel name



Stay dates



Loyalty status



Room type



AI content



Conditional visibility





Email Sections



Header Logo Hero Image Video thumbnail Headline Paragraph CTA Two-column Three-column Feature cards Offers Testimonials Countdown Amenities Property gallery Restaurant Spa Events Room upgrade Cross-sell Map Contact Social Footer



Global Toolbar



Undo Redo Auto Save Publish Save Draft Preview Send Test Version History Comments



Keyboard shortcuts: Ctrl/Cmd + Z Ctrl/Cmd + Shift + Z Delete Duplicate Copy Paste



Versioning



Unlimited undo/redo stack. Auto-save every few seconds. Named versions. Restore any version.



Preview



Desktop Mobile Dark Mode Gmail Outlook Apple Mail



AI Features



Rewrite text Improve subject line Improve CTA Shorten Expand Translate Generate image suggestions Improve accessibility



Design it to feel premium, elegant, and incredibly intuitive.









---



Prompt 2 — Structured Builder + Live Preview



> Design a premium enterprise campaign builder where editing happens primarily in structured forms while a live preview updates in real time.



The experience should resemble Linear, Notion, Stripe Dashboard, and modern SaaS products—minimal, highly organized, and predictable.



Layout



Left: Campaign structure.



Right: Inspector/editor.



Center: Read-only live preview.



Clicking a section in the preview simply navigates to and selects the corresponding settings in the editor.



The preview is clearly labeled: Live Preview Updates automatically.



Builder Structure



Campaign Settings Subject Preview Text Sender Name Sender Email Audience Schedule Tracking



Email Content Header Hero CTA Body Offers Gallery Footer



Each section expands into organized property groups.



Every section supports



Visibility toggle Duplicate Move Up Move Down Drag reorder Delete Collapse



Image Fields



Upload Replace Remove Library AI Generate Crop Alt Text



Typography



Font Size Weight Color Spacing Line Height Alignment



Button Settings



Text URL Analytics Variant Colors Radius Shadow Size



Global Theme



Brand Colors Typography Logo Corner Radius Email Width Background Default Button Style Footer Style



Preview



Desktop Mobile Inbox Preview Dark Mode



Toolbar



Undo Redo Save Draft Publish Version History Test Email Accessibility Check Spam Score



Collaboration



Auto-save Presence indicators Comments Change history Draft versions



Build the experience to feel enterprise-grade, scalable, and effortless for both simple and highly complex marketing campaigns.









---



Features I would consider essential



Regardless of which approach you choose, these should be part of the editor from day one:



Undo / Redo with keyboard shortcuts and a generous history stack.



Auto-save with a subtle "Saved just now" status.



Version history to restore previous states.



Drag-and-drop section reordering.



Duplicate any block in one click.



Copy/paste styles between elements.



Responsive preview (desktop, tablet, mobile).



Dark mode preview for email clients that support it.



Accessibility checker (missing alt text, low contrast, heading order).



Personalization tokens with live sample data.



Content validation (missing links, empty buttons, oversized images).



Test send and link checker.



Global theme controls so brand changes update the entire campaign consistently.





Taken together, these capabilities create an editor that feels on par with leading visual builders while still being approachable for hotel marketers and marketing teams.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/abdce451-b105-4b07-a514-cbe45bc14000).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
