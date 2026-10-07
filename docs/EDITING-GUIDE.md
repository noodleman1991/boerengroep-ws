# Editing guide

The site content is managed in the admin panel at `/admin` on the site's own address.

## Logging in

Open `https://<site address>/admin` and log in with your email and password. Use "Forgot password"
on the login screen if you need a new one. You only see the content of your own organisation.

## Pages

- **Title** is shown in the browser tab and in menus that link to the page.
- **Slug** is the last part of the page address, in the language you are editing. Use lowercase
  letters, numbers and hyphens. The home page has the slug `home`.
- **Parent** places the page under another page. A page with the slug `history` under the page
  `about-us` gets the address `/about-us/history`.
- **Path** shows the full address. It is filled in for you.
- **Blocks** are the sections of the page, from top to bottom. Add, reorder and remove them with the
  controls on each block.

### Two languages

Use the language selector at the top of the edit screen to switch between English and Dutch. Title,
slug and blocks are separate per language, so the Dutch page can have a different address and
different sections. A page with no Dutch version shows the English content to Dutch visitors.

### Changing an address

When you change a slug, pages underneath it move with it. Old links stop working unless you add a
redirect: go to Settings, Redirects, and add the old address as "From" and the new one as "To".
Only site admins can add redirects.

## Drafts and preview

"Save draft" keeps your changes private. "Publish" makes them public. Live Preview, at the top of a
page's edit screen, shows the page as it will look, including unpublished changes.

## Events, newsletters, vacancies and past events

Each of these is written in one language. Set **Language** to English or Dutch, or leave it empty to
show the item in both. The **Slug** is the last part of the item's address. Do not change the slug
of an item that has already been shared.

## Images and files

Upload under Content, Media, or directly from any image field. Give every image an alt text.

## Menus, footer and theme

Site admins find these under Settings, Site settings. A menu item can point to a page, which keeps
working when that page's address changes, or to a manual URL. Fill in **Label** per language.

## Things that work differently from the old editor

- Changes are saved to a database, not to GitHub. There is no waiting for a rebuild: a published
  change appears on the site within seconds.
- Icons and background colours on page sections are typed as text for now. Copy the value from an
  existing section, for example `bg-[#44AD39]/10` for a light green background.
- The address of a newsletter, event recap or vacancy is its slug. Capital letters are allowed
  there because existing addresses contain them.

## Who to ask

Your site admin can add editors and reset access.
