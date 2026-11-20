# Security Bootcamp
Welcome to the CompTIA Security+ Bootcamp! This repository is designed to help students develop essential cybersecurity knowledge, gain practical technical skills, and prepare for the CompTIA Security+ SY0-701 certification exam.

## SEC+ 701 CTF (study game)

**Start here:** https://alexander-maldonado-pelayo.github.io/Security-Bootcamp/ (an interactive koi-pond homepage: tap the water to feed the koi)

**Jump straight into the game:** https://alexander-maldonado-pelayo.github.io/Security-Bootcamp/ctf.html

A capture-the-flag game covering all five SY0-701 domains:

- **5 machines**, one per boot camp day (Mon–Fri). Take the user flag, then the root flag.
- **Hands-on challenges** (PBQ-style: matching, ordering, drag-to-zone, log analysis).
- **Command-line labs** in a practice shell.
- **Boss fight**: a timed mock exam scored 100–900. Hit 750 and you're exam ready.

Progress is saved in your own browser only (nothing is uploaded). Clearing site data or switching devices starts you fresh.

The whole game is a single file, [`ctf.html`](ctf.html); the homepage is [`index.html`](index.html). It runs in any current Chrome, Edge, Firefox or Safari, and you can also download it and open it offline.

## Turning in lab flags

The **Submit** section of the game sends lab flags to the instructor's Google Sheet, where each one is marked ✅ or ❌ and added to a gradebook (score out of 8). Students type their full name, click **Fill in my lab flags** (or paste them), and press **Submit for grading**.

### Instructor setup (one time, about 5 minutes)

1. Create a blank Google Sheet, e.g. "SEC+ CTF Gradebook".
2. In the Sheet, open **Extensions → Apps Script**. Delete what's there and paste in your **private copy** of the grader, the one with the answer key filled in. [`grading/Code.gs`](grading/Code.gs) in this repo is the same script with the key left blank, so it's safe to be public.
3. Click **Deploy → New deployment**, choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then **Deploy** and approve the permissions prompt.
4. Copy the **Web app URL** (it ends in `/exec`). Open it in a browser: you should see `"answerKeyComplete":true`.
5. In `ctf.html`, set `const SUBMIT_URL = '...';` to that URL and commit it to `main`. The site redeploys on its own.

Submissions appear in the **Submissions** tab; the **Gradebook** tab updates with every submission.

> Never commit the answer key. This repo is public and GitHub Pages publishes every file in it.
