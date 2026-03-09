# ISAB Website — Content Management Guide

This guide explains how to update the ISAB website without touching any code.
Everything is managed through **Google Drive** and a few shared folders.

---

## How It Works

The website reads content from Google Drive every time a visitor loads the page.
To update anything on the site, you just edit the right file or folder in Drive —
no deployments, no coding, no IT ticket needed.

---

## Folder Structure

Your Google Drive CMS has four main folders:

| Folder | What It Controls |
|---|---|
| `Documents` | Text content: officer list, important links, about/mission text |
| `Officer Photos` | Headshots shown on the Home page |
| `Event Photos` | Gallery page — one sub-folder per event |
| *(root)* | Nothing — only the sub-folders above matter |

---

## Updating the Officer Roster

1. Open the **Documents** folder → find the file named something like `Current Officers` or `Officers`.
2. Edit the document. Each officer is a block separated by `---`. The format is:

```
Name: Amaris Charles
Role: Vice President
Year: Senior
Major: B.A. in Anthropology
Home Country: United States
Country Flag: 🇺🇸
Quote: Your quote here.
---
Name: Next Officer
...
```

3. Save. The website updates automatically on the next page load.

**Rules:**
- Each field must be on its own line with a colon.
- Separate every officer with `---` (three dashes on their own line).
- The `Name` and `Role` fields are required. Everything else is optional.

---

## Updating Officer Photos

1. Open the **Officer Photos** folder in Drive.
2. Upload a photo named after the officer's **first name** (e.g., `Amaris.jpg`, `Ibrahim.jpg`).
3. The site will automatically match the photo to the officer by first name.

**Tips:**
- Square or portrait orientation works best.
- JPG or PNG files are both fine.
- If you upload a new photo with the same name, it replaces the old one automatically.

---

## Adding a New Event to the Gallery

1. Open the **Event Photos** folder in Drive.
2. Create a **new sub-folder**. Name it using this exact format:

```
YYYY-MM-DD Event Name
```

**Examples:**
```
2025-09-15 Fall Welcome Mixer
2025-11-20 International Culture Night
```

The `YYYY-MM-DD` date prefix at the start is what the website uses to show the correct event date and sort events in the right order (newest first). **Without the prefix, the date will be wrong.**

3. Upload all event photos into that new folder.
4. The gallery will appear on the website automatically — no other steps needed.

**Cover image:** The website uses the **first image** in the folder as the cover photo for the gallery card. Rename your best photo so it sorts first alphabetically (e.g., `_cover.jpg` or `00-cover.jpg`).

---

## Removing an Event from the Gallery

Simply **delete the event folder** from the Event Photos folder in Drive.
It will disappear from the website on the next page load.

---

## Updating Important Links

1. Open the **Documents** folder → find the file named something like `Important Links`.
2. Each link block follows this format:

```
Title: ISAB Instagram
URL: https://instagram.com/untisab
Description: Follow us for updates
Icon: instagram
---
Title: Apply to ISAB
URL: https://forms.google.com/...
Description: Officer application form
Icon: users
```

3. Save. Changes appear on the next page load.

**Available icons:** `instagram`, `users`, `link`, `mail`, `calendar`, `globe`

---

## Updating the About / Mission Text

1. Open the **Documents** folder → find the file named something like `About` or `Mission`.
2. Edit the relevant lines:

```
About: Your updated about text here.
Mission: Your updated mission statement here.
```

3. Save. Changes appear on the next page load.

---

## Important Notes

- **Do not rename the four main folders** (Documents, Officer Photos, Event Photos).
  The website finds them by their folder ID, not their name.
- **Do rename event sub-folders** freely — just keep the `YYYY-MM-DD` date prefix.
- Changes take effect on the **next full page load** (not instant — the site caches data).
- If something looks wrong, double-check your formatting matches the examples above.

---

## Quick Reference — Event Folder Naming

| ✅ Correct | ❌ Wrong |
|---|---|
| `2025-04-14 Songkran Festival` | `Songkran Festival` |
| `2025-09-15 Fall Welcome Mixer` | `Fall Welcome Mixer 9-15` |
| `2024-01-30 ISAB Inauguration` | `01/30/2024 ISAB Inauguration` |

---

*Last updated: Spring 2025 — maintained by Ibrahim Abubeker*
