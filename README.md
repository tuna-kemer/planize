# Planize

A small personal planner for tasks, notes and vision boards that stays in sync across my devices.

**Live app:** https://tuna-kemer.github.io/planize/

## Why

I wanted one simple planner that I fully control: it keeps my tasks, notes and vision boards in one place, works without internet, and shows the same data on every device I use.

## Features

- Tasks, notes and vision boards
- Sync across devices with Firebase Firestore
- Works offline; changes sync when the connection returns
- Email and password sign-in
- Installable as an app (PWA)

## How it is built

- One HTML file with plain JavaScript. No framework, no build step.
- Local first: the app reads and writes the device's own storage, and Firestore mirrors each item. If two devices change the same item, the later change wins and the replaced version is kept so it can be restored.
- Firebase Authentication and Firestore for sign-in and sync, GitHub Pages for hosting.
- A service worker keeps the app available without internet.

## Privacy

The app code is public, but the data is not. It is stored in Firebase behind security rules, so only the account owner can read or write it.

## Status

In development. Built for my own use.

## License

MIT. See [LICENSE](LICENSE).
