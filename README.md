# Thomas Tucker — portfolio

A single glass profile card. To change what it says, edit `settings.js` and refresh the page.

## Edit your info

Open `settings.js`.

- Change the words inside the quotes.
- To hide something, leave it empty (`""` or `[]`) or delete that line.
- A tab disappears when its section has nothing to show. Projects stays hidden until you add one.
- Items show in the order you list them.
- Keep a comma between items. A comma after the last item is fine.
- Save, then refresh.

Your phone number is not in this file on purpose. Leave it that way.

## Add your photo

1. Save a square photo as `assets/photo.jpg` (about 400 pixels wide, under 60 KB).
2. In `settings.js`, change `photo` to `"assets/photo.jpg"`.

Until that file is there, the card shows a TT monogram.

## Add a public resume

Do not upload `Thomas Tucker - Resume.pdf` from the Career folder. That file includes your phone number.

1. Export a copy with the phone number removed.
2. Save it as `assets/Thomas-Tucker-Resume.pdf`.
3. In `settings.js`, set `resume` to `"assets/Thomas-Tucker-Resume.pdf"`.

The Download resume button appears after that.

Fill in `linkedin`, `github`, and the school name and year the same way, when you have them.

## Preview on your computer

Double-click `index.html`. You can also open this folder in a browser from a local address. If the page says it could not read `settings.js`, you are usually missing a comma or a quote. Press F12, open Console, and it will point at the line.

## Publish on GitHub Pages

1. Go to [https://github.com/signup](https://github.com/signup) and create a free account. The username you pick becomes your web address: `https://USERNAME.github.io`.
2. After you are signed in, go to [https://github.com/new](https://github.com/new).
3. Repository name: type your username, then `.github.io`. Example: if your username is `thomastucker`, the repository name is `thomastucker.github.io`.
4. Choose Public. Leave the README and license boxes unchecked. Click Create repository.
5. On the new repository page, click **Add file**, then **Upload files**.
6. Open the `portfolio` folder on your computer. Select everything inside it (`index.html`, `settings.js`, `app.js`, `styles.css`, `favicon.svg`, `README.md`, and the `assets` folder). Do not upload the `portfolio` folder itself, and do not upload the original resume from the Career folder.
7. Click **Commit changes**.
8. Open **Settings** at the top of the repository, then **Pages** in the left sidebar.
9. Under Build and deployment, set Source to **Deploy from a branch**. Set Branch to **main** and folder to **/ (root)**. Click Save.
10. Wait about a minute, then open `https://USERNAME.github.io`.

If Pages only offers GitHub Actions and not “Deploy from a branch”, use the Actions option it suggests for a static site, with the same files already on `main`. The address is still `https://USERNAME.github.io`.

## Edit it later

1. Open the repository on github.com.
2. Click `settings.js`.
3. Click the pencil icon.
4. Change the text, then click **Commit changes**.
5. Refresh the site. GitHub usually updates it within a minute.

## Link preview

LinkedIn, iMessage, and Slack do not read `settings.js`. After the site is live, open `index.html` on GitHub (pencil icon) and replace every `USERNAME` in the block marked `LINK PREVIEW` with your GitHub username. The preview image is `assets/og-image.jpg`.
