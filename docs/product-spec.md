# Product specification

## Goal

Help a studio team move from product photographs and a creative brief to reviewed fashion imagery without having to understand model parameters. Preserve human control over quality and publication.

## Scope and state model

The prototype includes overview, production library, casting, reference assets, production queue, review, brand direction and design system views. This implementation uses plain HTML, CSS and JavaScript with no build or package dependency. A server integration can retain these interaction contracts in React/Next.js or another stack.

Production: `draft → generating → review → approved | changes`.

Exceptions: `generating → failed → generating`; `generating → blocked → revised draft`; `generating → draft` on cancellation. The safety-block recovery creates a revised production, preserving the original blocked item. All generation results require a separate human approval.

Normal simulation completes in about 12 seconds. The slow scenario completes in about 35 seconds and changes its guidance after 8 seconds. Simulated failure and safety checks resolve after 12 seconds. Timestamp-based progression survives navigation and page refresh. Refreshing does not recreate image outputs for a completed job.

## Roles

| Action | Administrator | Producer | Operator | ORDRE visitor |
| --- | --- | --- | --- | --- |
| View studio and reference library | Yes | Yes | Yes | Yes |
| Create/retry/cancel production | Yes | Yes | Yes | No |
| Select casting direction | Yes | Yes | Yes | No |
| Inspect pending outputs | Yes | Yes | Yes | No |
| Request changes | Yes | Yes | Yes | No |
| Approve outputs | Yes | Yes | No | No |
| Edit shared brand direction | Yes | No | No | No |
| View/export approved decisions | Yes | Yes | Yes | Yes |

Role switching is a preview mechanism, not an authorization boundary. Production must enforce permissions on the server. Visitors see only approved cards in the production and review views; queue and activity in this concept remain sample demonstration surfaces and must be scoped server-side in a deployed multi-tenant service.

## Core acceptance criteria

1. A new production cannot advance without a name and a plain-language brief. Validation identifies the next action and focuses the relevant field.
2. Product input accepts up to four JPG, PNG or WebP files, each no larger than 5 MB. Invalid selection explains the accepted formats and limits. A sample collection allows completion without uploading a file.
3. Casting selection is explicit and represented with both a visible check and `aria-pressed`.
4. Output intent is selected before submission. No real processing is implied: the final step clearly identifies simulation and sample imagery.
5. Creating a production adds one queue item and one production card. Successful simulated completion adds exactly one review record, never an automatic approval.
6. Slow output explains that the work is retained and that the user may continue browsing.
7. Interrupted generation offers retry with the same brief. A safety-blocked request offers a revised neutral brief; it does not offer a bypass of a safety policy.
8. Approval requires all three product-fidelity checks and an eligible role. Missing checks produce an inline message. Requesting changes requires a written note.
9. Human decisions capture reviewer role, decision time and note. Approved decisions can be downloaded as CSV.
10. Shared brand edits are limited to the Administrator interface. Subsequent briefs inherit the edited direction.
11. All visible statuses use text in addition to colour. Dialogs use native modal focus containment. Buttons, inputs and links have labels, with visible keyboard focus and reduced-motion handling.
12. The interface adapts to phone, tablet and desktop widths. Sidebar navigation becomes a menu on narrow screens.

## Design tokens

The CSS custom properties in `dist/styles.css` define canvas, surface, text, secondary text, border, emphasis and semantic colours. Themes replace tokens at the root rather than duplicating components. Editorial headlines use Georgia; interface text uses DM Sans with a system fallback. The main spacing rhythm is 4/8/12/16/24/32/40 pixels. Motion is restrained and disabled under `prefers-reduced-motion`.

## Quality signals

Sample percentages communicate confidence and focus attention; they do not establish measured accuracy. A production integration should distinguish colour consistency, geometry, material, branding and image artefacts. Confidence should be calibrated against human assessments and never replace a product reference comparison.

## Data and enterprise readiness

This prototype stores non-upload demo state in browser `localStorage` and keeps selected files in memory. No real authorization, team persistence or EU-residency controls exist. Production requires tenant isolation, role enforcement, encrypted object storage, retention policies, licensed model consent, regional processing controls, vendor reviews, versioned assets and immutable decision events.

## Verification limits

The initial delivery includes JavaScript syntax checks and structural/source checks. The managed execution environment blocked listening on a local port. Browser interaction and responsive visual checks must be completed on an available hosted build; no formal accessibility certification or real-user test is claimed.
