# Editing Pages & Menus - Complete Guide

A practical guide for editors working on the Boerengroep website.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding How the Site Works](#understanding-how-the-site-works)
3. [Editing Pages](#editing-pages)
4. [Working with Navigation Menus](#working-with-navigation-menus)
5. [Understanding Translations](#understanding-translations)
6. [Managing Redirects](#managing-redirects)
7. [Common Scenarios](#common-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### How to access the editor

1. Open your browser and go to: `https://www.boerengroep.nl/admin`
2. Log in with your TinaCMS account
3. You'll see the dashboard with different content types listed on the left

### What you'll see

```
Left Sidebar:
├── Events          (calendar events)
├── Pages           (main website pages)
├── Tags            (content tags)
├── Speakers        (event speakers)
├── Vacancies       (job postings)
├── Newsletter      (newsletter articles)
├── Global          (site settings, menus, footer)
├── PastEvent       (archived events)
├── Author          (content authors)
└── Redirects       (URL redirects)
```

---

## Understanding How the Site Works

### The bilingual setup

This website runs in two languages:
- **English** (`/en/...`) - Default language
- **Dutch** (`/nl/...`) - Dutch version

Every page needs **two versions** - one in English and one in Dutch.

### How URLs work

When someone visits the site:
- `boerengroep.nl` → automatically redirects to `/en` or `/nl` based on browser language
- `boerengroep.nl/en/about-us` → English "About Us" page
- `boerengroep.nl/nl/over-ons` → Dutch "Over Ons" page (same content, different language)

### The two places where text lives

| What                                   | Where             | Who edits it    |
| -------------------------------------- | ----------------- | --------------- |
| Page content (articles, descriptions)  | TinaCMS Pages     | Content editors |
| Menu labels, button text, UI elements  | Translation files | Developers      |

**Important:** Menu labels currently use a translation key system. This means the actual text displayed comes from translation files, not directly from TinaCMS.

---

## Editing Pages

### Finding a page to edit

1. Click **Pages** in the left sidebar
2. You'll see folders organized by language:
   ```
   Pages/
   ├── en/                    ← English pages
   │   ├── home.mdx
   │   ├── contact.mdx
   │   ├── about-us/
   │   │   ├── index.mdx     ← This is /en/about-us
   │   │   ├── history.mdx   ← This is /en/about-us/history
   │   │   └── ...
   │   └── ...
   └── nl/                    ← Dutch pages
       ├── home.mdx
       ├── contact.mdx
       └── ...
   ```

3. Click on a file to open it

### Editing page content

Once you open a page, you'll see:

- **Page Title** - The main heading
- **URL Slug (English)** - The URL path (e.g., `about-us`)
- **URL Slug (Dutch)** - The Dutch URL path (e.g., `over-ons`)
- **Body** - Rich text content
- **Sections** - Visual blocks you can add (hero images, features, etc.)

### Creating a new page

**Example: Creating a "Partners" page**

**Step 1: Create the English version**

1. Go to **Pages** → navigate to `en/` folder
2. Click the **+** or "Create new" button
3. Fill in:
   - **Page Title**: `Our Partners`
   - **URL Slug (English)**: `partners`
   - **URL Slug (Dutch)**: `partners` (or `onze-partners` if you want a Dutch URL)
4. Add your content
5. Click **Save**

**Step 2: Create the Dutch version**

1. Navigate to `nl/` folder
2. Create a new file with the same structure
3. Fill in the Dutch content
4. Save

Now you have:
- `/en/partners` → English version
- `/nl/partners` (or `/nl/onze-partners`) → Dutch version

### Page URL structure

The URL is determined by the **folder structure** and **filename**:

| File location             | URL                    |
| ------------------------- | ---------------------- |
| `en/contact.mdx`          | `/en/contact`          |
| `en/about-us/index.mdx`   | `/en/about-us`         |
| `en/about-us/history.mdx` | `/en/about-us/history` |
| `en/news/newsletter.mdx`  | `/en/news/newsletter`  |

---

## Working with Navigation Menus

### How the menu system works

The navigation menu is configured in **Global** → **Header** → **Navigation Menu**.

**Current system:** Each menu item has:
- `href` - The URL path (like `/about-us`)
- `label` - A translation key (like `about-us`)

The `label` is NOT the text shown to users. It's a **key** that looks up the actual text from translation files.

### Example: Current menu item

```json
{
  "href": "/about-us",
  "label": "about-us"
}
```

This `label: "about-us"` looks up text from:
- `messages/en.json` → finds `"about-us": "About Us"` → shows "About Us"
- `messages/nl.json` → finds `"about-us": "Over Ons"` → shows "Over Ons"

### Editing an existing menu item

1. Go to **Global** in the sidebar
2. Click to open the global settings
3. Expand **Header** → **Navigation Menu**
4. Click on the item you want to edit
5. Change the `href` (URL) if needed
6. Save

**Note:** To change the displayed text, you need to edit the translation files (see Translation section below).

### Adding a new menu item

**Option A: Using an existing translation key**

If the translation already exists:

1. Open **Global** → **Header** → **Navigation Menu**
2. Click **+ Add Navigation Menu**
3. Fill in:
   - **Link to Page**: Select your page (if available)
   - **Manual URL**: `/your-page-url`
   - **Translation Key (legacy)**: Use existing key like `contact`
4. Save

**Option B: Using direct labels (new system)**

For new items, you can use the direct label fields:

1. Click **+ Add Navigation Menu**
2. Fill in:
   - **Manual URL**: `/partners`
   - **English Label**: `Partners`
   - **Dutch Label**: `Partners`
3. Save

### Adding dropdown items

1. Open the parent menu item
2. Find **Dropdown Menu Items**
3. Click **+ Add**
4. Configure the same way as main menu items
5. Save

### Current menu structure (for reference)

```
About Us
├── What is Boerengroep?
├── History
├── Who are we?
└── Network

Activities
├── Calendar
├── Past Events
├── Farm Experience Internship
├── Reclaim the Seeds
├── Soup Kitchen
└── Open Meetings

Vacancies
├── Volunteers
├── Board
├── Coordinator
└── Internships

News
├── Newsletter
└── Friends News

Inspringtheater

Library
├── Podcast
├── Picture & Video Gallery
├── Archive
└── Agroecology Network

Contact
```

---

## Understanding Translations

### The two types of text on the site

#### Type 1: Page Content (you edit in TinaCMS)

This is the main content of pages - paragraphs, headings, descriptions. You edit this directly in TinaCMS when you open a page.

**Example:** The text describing what Boerengroep does on the About page.

#### Type 2: UI Text (in translation files)

This is repeated text that appears throughout the site:
- Menu labels
- Button text ("Read more", "Submit", "Back")
- Form labels
- Error messages
- Footer text

**These live in two files:**
- `messages/en.json` - English text
- `messages/nl.json` - Dutch text

### How translation files work

**File: `messages/en.json`** (simplified example)
```json
{
  "navigation": {
    "items": {
      "home": "Home",
      "about-us": "About Us",
      "contact": "Contact",
      "activities": "Activities"
    }
  },
  "buttons": {
    "read-more": "Read more",
    "submit": "Submit",
    "back": "Back"
  },
  "footer": {
    "copyright": "© Stichting Boerengroep"
  }
}
```

**File: `messages/nl.json`** (same structure, Dutch text)
```json
{
  "navigation": {
    "items": {
      "home": "Home",
      "about-us": "Over Ons",
      "contact": "Contact",
      "activities": "Activiteiten"
    }
  },
  "buttons": {
    "read-more": "Lees meer",
    "submit": "Verzenden",
    "back": "Terug"
  },
  "footer": {
    "copyright": "© Stichting Boerengroep"
  }
}
```

### How to add a new menu label translation

**Scenario:** You want to add a "Partners" menu item.

**Step 1:** Open `messages/en.json` and add the new key:

```
Before:
"home": "Home",
"about-us": "About Us",
"contact": "Contact"

After:
"home": "Home",
"about-us": "About Us",
"partners": "Partners",     <-- ADD THIS LINE
"contact": "Contact"
```

**Step 2:** Open `messages/nl.json` and add the Dutch version:

```
Before:
"home": "Home",
"about-us": "Over Ons",
"contact": "Contact"

After:
"home": "Home",
"about-us": "Over Ons",
"partners": "Partners",     <-- ADD THIS LINE
"contact": "Contact"
```

**Step 3:** In TinaCMS, set the menu item's `label` to `partners`

Now the menu will show:
- English site → "Partners"
- Dutch site → "Partners"

### Who can edit translation files?

**Currently:** Translation files require code access. Contact a developer to add new translations.

**Workaround:** Use the new **English Label** and **Dutch Label** fields in menu items to bypass the translation system for menu text.

---

## Managing Redirects

Redirects ensure old URLs don't break when you rename or move pages.

### When do you need a redirect?

- You change a page's URL slug
- You delete a page but want the old URL to go somewhere
- You reorganize the site structure
- You fix a typo in a URL

### Creating a redirect

1. Go to **Redirects** in the left sidebar
2. Click **Create New**
3. Fill in:
   - **From URL**: The old URL (e.g., `/en/old-page`)
   - **To URL**: The new URL (e.g., `/en/new-page`)
   - **Permanent Redirect**: Check this box (recommended for moved content)
   - **Note**: Optional description (e.g., "Page renamed Jan 2024")
4. Click **Save**

### Example: Renaming a page

**Scenario:** You want to change `/en/about-us/team` to `/en/about-us/our-team`

**Step 1:** Create the redirect FIRST

```
From URL: /en/about-us/team
To URL: /en/about-us/our-team
Permanent: Yes
Note: Renamed team page to our-team
```

**Step 2:** Update the page URL in TinaCMS

**Step 3:** Update any menu links pointing to the old URL

### Adding multiple redirects over time

Yes! You can create as many redirects as needed. Each redirect is a separate entry.

**Example: Multiple redirects for one page that moved twice**

```
Redirect 1:
From: /en/team
To: /en/about-us/team
Note: Moved to about-us section (2023)

Redirect 2:
From: /en/about-us/team
To: /en/about-us/our-team
Note: Renamed to our-team (2024)
```

Both old URLs will now reach the current page.

### Redirect best practices

1. **Create redirects BEFORE changing URLs** - This prevents broken links
2. **Use permanent redirects** for content that has moved for good
3. **Add notes** explaining why the redirect exists
4. **Don't delete old redirects** - Keep them for historical URLs
5. **Check both languages** - If you rename `/en/team`, also handle `/nl/team`

### Viewing all redirects

Go to **Redirects** in TinaCMS to see all existing redirects. Each shows:
- The source URL
- The destination URL
- Whether it's permanent
- Any notes

---

## Common Scenarios

### Scenario 1: Add a completely new page

1. Create the English page in `en/` folder
2. Create the Dutch page in `nl/` folder
3. Add translation for menu label (or use direct labels)
4. Add to navigation menu in Global settings
5. Save everything

### Scenario 2: Rename a page URL

1. Create redirect from old URL to new URL
2. Change the URL slug on the page
3. Update any menu items pointing to it
4. Save everything

### Scenario 3: Remove a page from menu but keep it live

1. Go to **Global** → **Navigation Menu**
2. Delete the menu item (or remove from submenu)
3. Don't delete the actual page
4. The page is still accessible via direct URL

### Scenario 4: Add an external link to the menu

1. Go to **Global** → **Navigation Menu**
2. Add new item
3. Leave **Link to Page** empty
4. Set **Manual URL** to `https://instagram.com/boerengroep`
5. Fill in labels
6. Save

### Scenario 5: Change a menu item's displayed text

**If using translation keys:**
1. Find the `label` value (e.g., `about-us`)
2. Edit `messages/en.json` and change the text
3. Edit `messages/nl.json` and change the Dutch text
4. Commit the changes (requires developer access)

**If using direct labels:**
1. Open the menu item in TinaCMS
2. Change **English Label** and **Dutch Label** directly
3. Save

---

## Troubleshooting

### Page shows 404

- Check that both EN and NL versions exist
- Verify the URL slug matches the file path
- Make sure the page was saved and deployed

### Menu item not showing

- Check that the item was saved in Global settings
- Verify the translation key exists in `messages/` files
- Check if there are required fields missing

### Redirect not working

- Redirects only work after the site rebuilds (1-2 minutes)
- Check that the "From URL" starts with `/`
- Make sure you saved the redirect

### Changes not appearing on the live site

- Wait 1-2 minutes for the site to rebuild
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear your browser cache
- Check if the save was successful in TinaCMS

---

## Quick Reference

### File locations

| What                    | Location                    |
| ----------------------- | --------------------------- |
| English pages           | `content/pages/en/`         |
| Dutch pages             | `content/pages/nl/`         |
| English translations    | `messages/en.json`          |
| Dutch translations      | `messages/nl.json`          |
| Global settings (menus) | `content/global/index.json` |
| Redirects               | `content/redirects/`        |

### URL patterns

| English URL           | Dutch URL                | Notes           |
| --------------------- | ------------------------ | --------------- |
| `/en/about-us`        | `/nl/over-ons`           | Different paths |
| `/en/contact`         | `/nl/contact`            | Same paths      |
| `/en/news/newsletter` | `/nl/nieuws/nieuwsbrief` | Nested paths    |

### Need help?

- TinaCMS documentation: https://tina.io/docs
- Check the `tina/` folder for how content types are defined
- Contact a developer for translation file changes
