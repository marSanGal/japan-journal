# Trip Development Guide

How to develop Japan Journal on the go — edit code from a tablet, push to the repo, and deliver updates to the phone over the air without rebuilding.

## Architecture

The app is a **production APK** — a fully standalone build with no dev server dependency. The JS bundle inside can be replaced over the air using **EAS Update**. You edit code on the tablet, push an update, and the phone downloads the new bundle on next app launch.

No Metro, no tunnel, no localhost, no cable. Just internet on the phone.

Data lives in AsyncStorage on the phone and is never affected by code updates.

## Before the Trip (One-Time Setup)

### 1. Install dependencies and configure updates

```bash
npm install
npx expo install expo-updates
```

Add `expo-updates` to the plugins list in `app.json` if not already present.

### 2. Build the production APK

```bash
npx eas build --profile production --platform android
```

This uses the `production` profile in `eas.json` which produces a standalone `.apk` with `channel: "production"` for OTA updates. The build runs on EAS servers — no local Android SDK required.

Download the finished APK from the EAS dashboard or CLI output link and install it on the phone.

### 3. Set up Termux on the tablet

Termux turns an Android tablet into a portable dev machine.

```bash
# Inside Termux
pkg update && pkg upgrade
pkg install nodejs-lts git openssh

# Clone the repo
git clone <your-repo-url> jp
cd jp
npm install
```

### 4. Verify OTA updates work

From the tablet (or any machine with the repo):

```bash
eas update --channel production --message "test update"
```

Open the app on the phone. It should download the new bundle on launch. If you see the change, OTA delivery is working.

## Daily Workflow

### Using the app (no coding)

Open the app on the phone. Log entries, sync with your partner, generate chapters — everything works offline. Data auto-backs up to `backup.json` in the app's document directory (at most once per hour, triggered by any entry or narrative change).

### Making code changes

1. Open Termux on the tablet
2. Edit files (`cd jp`, use `vi`, `nano`, or any editor)
3. Commit and push:

```bash
git add -A && git commit -m "day 3: fix entry sorting" && git push
```

4. Push the update to the phone:

```bash
eas update --channel production --message "day 3: fix entry sorting"
```

5. Reopen the app on the phone — it downloads the new bundle automatically

That's it. No Metro server, no tunnel, no cable. The phone just needs an internet connection when launching the app to pick up the update.

### Quick reference

```bash
# edit → commit → push → update (one-liner)
git add -A && git commit -m "description" && git push && eas update --channel production --message "description"
```

## Backup & Restore

### Automatic backup

The app writes a full JSON backup to the device's document directory whenever entries or narratives change (debounced, at most once per hour). The last backup timestamp is visible in Settings.

### Manual export

In **Settings → Export Backup**, the app serializes all state to JSON, writes it to a temp file, and opens the Android share sheet. Send it to yourself via email, messaging, or save to cloud storage.

### Manual import

In **Settings → Import Backup**, pick a previously exported JSON file. The app validates and restores all state (config, days, entries, narratives, collections, custom categories).

### What's included in a backup

- Trip configuration (names, dates, traveler setup)
- All day entries across every category
- Narratives / chapters
- Custom categories
- Collections
- Narrator persona setting
- Past archived trips

## Troubleshooting

### Update not showing on the phone

- The app checks for updates on launch. Force-close the app and reopen it.
- Make sure the phone has internet when launching.
- Confirm the update went through: `eas update:list` shows recent updates.
- Check that the channel matches: the APK was built with `--profile production` (`channel: "production"`), so push updates to the `production` channel.

### App crashes after an update

The update likely uses a native module that isn't in the APK. Roll back:

```bash
eas update:rollback --channel production
```

Then rebuild the APK with the new native dependency and try again.

### App crashes on launch (before any update)

Rebuild the APK:

```bash
npx eas build --profile production --platform android
```

### Termux tips

- **Prevent sleep**: Termux notification → "Acquire wakelock"
- **Split pane**: Swipe from left edge → "New session" for a second terminal
- **Clipboard**: Long-press to paste into Termux
- **SSH key for GitHub**: `ssh-keygen -t ed25519` then add the public key to your GitHub account — avoids typing passwords on every push

### Build profile reference

| Profile | Command | Output | Use case |
|---|---|---|---|
| `production` | `eas build --profile production --platform android` | Standalone `.apk` with OTA channel | Main app for the trip |
| `development` | `eas build --profile development --platform android` | `.apk` with dev client | Local dev only (requires Metro) |
| `preview` | `eas build --profile preview --platform android` | `.apk` without OTA | One-off build to share with others |

## When to Rebuild the APK

You only need to rebuild when the **native layer** changes:

- Adding a package that includes native code (e.g., `react-native-maps` — already included)
- Changing `app.json` fields that affect the native build (package name, permissions, splash screen)
- Upgrading Expo SDK

Everything else — `.ts`, `.tsx`, `.js` changes, styles, components, screens, business logic, Zustand store changes, OpenAI prompt tweaks, pure-JS npm packages — is delivered via `eas update` without rebuilding.
