# ISAB Website — Content Management Guide

This guide explains how to update the ISAB website without touching any code.
Everything is managed through **Google Drive** and a few shared folders.

---

## How It Works

The website reads content from Google Drive automatically.
To update anything on the site, you just edit the right file or folder in Drive —
no deployments, no coding, no IT ticket needed.

> **Cache note:** The website caches content for up to **1 hour**. After saving a change,
> it may take up to 60 minutes to appear live. To see it immediately, ask a developer
> to trigger a redeploy on Vercel.

---

## Folder Structure

Your Google Drive CMS has five main folders at the root:

| Folder | What It Controls |
|---|---|
| `Documents` | All text content (officers, links, about/mission, history descriptions) |
| `Officer Photos` | Headshots shown on the Home page |
| `Event Photos` | Gallery page — one sub-folder per event |
| `Board Photos` | Board cover photos shown on the History page |
| *(root)* | Nothing — only the sub-folders above matter |

**Do not rename or move these folders.** The website finds them by their Drive folder ID, not their name.

---

## 1 — Officer Roster

### Updating the Officer List

1. Open the **Documents** folder.
2. Open the document named **`Current Officers`**.
3. Each officer is a block separated by `---` (three dashes on their own line). The format is:

```
Name: Ibrahim Abubeker
Role: President
Year: Junior
Major: B.S. in Computer Science
Home Country: Ethiopia
Country Flag: 🇪🇹
Quote: Something inspiring here.
---
Name: Shiori Yamamoto
Role: Vice President
Year: Senior
Major: B.A. in Communication Studies
Home Country: Japan
Country Flag: 🇯🇵
Quote: Another quote here.
```

4. Save the document. The website updates on the next cache refresh.

**Rules:**
- Each field must be on its own line, with a colon and a space after the field name.
- Separate every officer with `---` on its own line. Do **not** add `---` after the last officer.
- `Name` and `Role` are required. All other fields are optional but strongly recommended.
- The officers appear on the site **in the order they appear in the document** — put the President first.

---

### Updating Officer Photos

1. Open the **Officer Photos** folder in Drive.
2. Upload a photo file named after the officer's **exact first name** as it appears in the document.
   - Example: if the document says `Name: Ibrahim Abubeker`, the photo must be named `Ibrahim.jpg`
   - Example: if the document says `Name: Shiori Yamamoto`, the photo must be named `Shiori.jpg`
3. The site matches photos to officers by first name automatically.

**Tips:**
- JPG files are preferred. PNG also works.
- Square or portrait crops work best (the site crops to a square on display).
- If you upload a replacement photo with the same filename, the old one is overwritten automatically.
- If no matching photo is found, the site shows a placeholder silhouette.

---

## 2 — Event Gallery

### Adding a New Event

1. Open the **Event Photos** folder in Drive.
2. Create a **new sub-folder**. Name it using this exact format:

```
YYYY-MM-DD Event Name
```

**Examples:**
```
2025-09-15 Fall Welcome Mixer
2025-11-20 International Culture Night
2026-02-14 Valentine's Day Art Night
```

The date prefix at the start is required — without it, the event date will be wrong and events may sort in the wrong order.

3. Upload all photos for that event into the new folder.
4. The gallery card appears on the website automatically. No other steps needed.

**Cover image:** The website uses the **first image** in the folder (alphabetical order) as the gallery card cover. To control which photo is the cover, rename your preferred photo so it sorts first — for example, prefix it with `!` or `00_`:

```
00_cover.jpg   ← this will be the cover
01_photo.jpg
02_photo.jpg
```

---

### Removing an Event from the Gallery

Delete the event's sub-folder from the **Event Photos** folder in Drive.
It disappears from the website on the next cache refresh.

---

### Event Folder Naming — Quick Reference

| ✅ Correct | ❌ Wrong |
|---|---|
| `2025-04-14 Songkran Festival` | `Songkran Festival` |
| `2025-09-15 Fall Welcome Mixer` | `Fall Welcome Mixer 9-15` |
| `2024-01-30 ISAB Inauguration` | `01/30/2024 ISAB Inauguration` |
| `2025-11-20 International Culture Night` | `International Culture Night 2025` |

---

## 3 — Important Links

1. Open the **Documents** folder.
2. Open the document named **`Important Links`**.
3. Each link is a block separated by `---`. The format is:

```
Title: ISAB Instagram
URL: https://www.instagram.com/untisab
Description: Follow us for event updates and announcements.
Icon: instagram
---
Title: Apply to ISAB
URL: https://forms.google.com/...
Description: Submit your officer application here.
Icon: users
---
Title: ISAB Canvas Page
URL: https://canvas.unt.edu/...
Description: Access resources and meeting recordings.
Icon: link
```

4. Save. Changes appear on the next cache refresh.

**Available icons:**

| Icon name | Looks like |
|---|---|
| `instagram` | Instagram logo |
| `users` | People / group icon |
| `link` | Chain link |
| `mail` | Envelope |
| `calendar` | Calendar |
| `globe` | Globe / world |

If you enter an unrecognized icon name, the site will show a default link icon.

---

## 4 — About & Hero Text

1. Open the **Documents** folder.
2. Open the document named **`About ISAB`** (or similar).
3. The document contains these fields:

```
Hero Title: ISAB at UNT
Hero Subtitle: Empowering international students to lead, connect, and thrive.
About Text: ISAB (International Student Advisory Board) is a student organization at the
University of North Texas dedicated to advocating for international students...
Mission Statement: To foster a welcoming and empowering environment for all
international students at UNT through advocacy, community, and leadership.
```

4. Edit any field and save. Changes appear on the next cache refresh.

**Notes:**
- `Hero Title` and `Hero Subtitle` appear on the large banner at the top of the Home page.
- `About Text` appears in the About section on the Home page.
- `Mission Statement` appears in the Mission section.
- These fields can be multiple lines — just continue typing after the colon. Only the field name with a colon at the start of a line is treated as a new field.

---

## 5 — History Page

The History page shows board descriptions and board cover photos for each semester.

### Updating Board Descriptions

1. Open the **Documents** folder.
2. Open the document named **`History Content`**.
3. The document starts with a Foundation Story section and then has one block per board, separated by `---`. The format is:

```
# Foundation Story
ISAB was founded in 2023 by a group of international students who wanted to...

---
ID: founding-board-2023
Description: The founding board established ISAB's core mission and held our first
events during the Spring 2023 semester. This was an exciting time of building
community from the ground up.
---
ID: fall-2023-board
Description: The Fall 2023 board grew our membership significantly and launched
several new event series, including International Game Night.
---
ID: spring-2024-board
Description: The Spring 2024 board focused on advocacy and partnered with the
Office of International Affairs on multiple initiatives.
```

4. Save. Changes appear on the next cache refresh.

**Board IDs — do not change these.** They are fixed identifiers that link the description to the correct semester on the History page:

| ID | Semester |
|---|---|
| `founding-board-2023` | Spring 2023 (Founding) |
| `fall-2023-board` | Fall 2023 |
| `spring-2024-board` | Spring 2024 |
| `fall-2024-board` | Fall 2024 |
| `spring-2025-board` | Spring 2025 |

To add a new board, add a new block at the end of the document (with `---` before it) using the appropriate ID from the table above.

---

### Updating Board Cover Photos

Board cover photos are shown in the detail view when a semester is selected on the History page.

1. Open the **Board Photos** folder in Drive.
2. Inside, there is one sub-folder per semester, named like:
   - `2023-founding`
   - `2023-fall`
   - `2024-spring`
   - `2024-fall`
   - `2025-spring`
3. Upload or replace the photo inside the matching sub-folder.
4. The site uses the **first image** in the folder as the board cover photo.

**Tips:**
- Group photos work best for board covers.
- Landscape orientation is recommended (the image fills a wide banner area).
- Do not rename the sub-folders — the site matches them by name.

---

## Troubleshooting

| Problem | What to check |
|---|---|
| Officer not showing up | Make sure `Name:` and `Role:` fields are present and the block is separated by `---` |
| Officer photo not showing | Check that the filename matches the officer's first name exactly (case-sensitive on some systems) |
| Event showing the wrong date | Make sure the folder name starts with `YYYY-MM-DD ` (four-digit year, two-digit month, two-digit day) |
| Gallery card showing wrong cover photo | Rename your preferred cover photo so it sorts first alphabetically |
| History board photo not showing | Check that the Board Photos sub-folder name matches exactly (e.g., `2024-fall`, not `Fall 2024`) |
| Changes not live yet | Wait up to 1 hour for the cache to refresh, or ask a developer to redeploy |
| Formatting looks broken | Re-read the format for that section — even a missing colon or extra space can cause issues |

---

## Important Rules Summary

- **Do not rename** the five main folders (`Documents`, `Officer Photos`, `Event Photos`, `Board Photos`).
- **Do not change** the board `ID:` values in the History Content document.
- **Always use** `YYYY-MM-DD` prefix when naming new event folders.
- **Separate blocks** with `---` on its own line (no extra spaces or text on that line).
- Each field must start at the **beginning of the line** with the field name followed by a colon.

---

*Last updated: Spring 2026 — maintained by Ibrahim Abubeker*
