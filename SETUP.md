# Profesora — getting it onto your iPhone

No Mac needed. The app is built in Expo's cloud (EAS) and installed via TestFlight
using your Apple Developer account. Total first-time setup: roughly an hour, most
of it waiting for builds and Apple processing.

## 0. What you need
- Node.js 20+ installed (nodejs.org, LTS installer)
- Your Apple Developer account login
- A GitHub account (optional but recommended — for keeping the code safe)
- ~15 minutes for the Azure key (step 4)

## 1. Unzip and install
```bash
unzip spanish-teacher.zip
cd spanish-teacher
npm install
```

(Optional, recommended) put it on GitHub:
```bash
git init && git add -A && git commit -m "Profesora walking skeleton"
# create an empty repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/spanish-teacher.git
git push -u origin main
```

## 2. Create a free Expo account and log in
Sign up at https://expo.dev, then:
```bash
npm install -g eas-cli
eas login
eas init      # links this project to your Expo account (say yes to create)
```

## 3. Build for your iPhone
```bash
eas build --platform ios --profile preview
```
- First run, EAS asks to log in to your **Apple Developer account** and offers to
  create the signing certificates for you — say yes to everything. It registers the
  bundle ID `com.rossmcfarlane.spanishteacher` automatically.
- The build runs in Expo's cloud (~10–20 min). You get a link to watch it.

When it finishes:
```bash
eas submit --platform ios --latest
```
This uploads the build to App Store Connect. Then on your iPhone:
1. Install **TestFlight** from the App Store.
2. In App Store Connect (appstoreconnect.apple.com) → your app → TestFlight →
   add yourself as an internal tester (first upload can take ~10–30 min to process).
3. Open TestFlight on the phone → install **Profesora**.

## 4. Get your Azure Speech key (the voice)
1. https://portal.azure.com → create a free account if you don't have one.
2. "Create a resource" → search **Speech** (Azure AI services | Speech) → Create.
3. Region: **Australia East** (closest = lowest voice latency). Pricing tier: **Free (F0)**.
4. After it deploys: Resource → **Keys and Endpoint** → copy **Key 1**.
5. In the app: ⚙︎ Settings → paste the key, region `australiaeast` → **Test voice** → Save.

Free tier gives 0.5M characters of neural TTS per month — far more than lessons use.

## 5. (Optional) LLM key for free-talk mode
Lesson 1 is fully scripted and needs no LLM. To unlock "Free talk":
- Anthropic: https://console.anthropic.com → API keys → create (starts `sk-ant-`), or
- OpenAI: https://platform.openai.com → API keys (starts `sk-`).
Paste into Settings. The app auto-detects the provider from the key. Set a low
monthly spend cap in the provider's console ($5 is plenty).

## Using it
- Tap the mic, speak, tap again when done (or wait — it auto-stops on silence).
- Say **"repeat"**, **"slower"**, or **"translate"** any time — handled instantly, no AI call.
- Say **"next"** to skip a step you're stuck on.
- Progress is saved on the phone; the lesson resumes where you left off.

## When something breaks
- **"Azure rejected the key"** → key or region wrong; region must be the lowercase
  id like `australiaeast`, not "Australia East".
- **Recognition never hears you** → iOS Settings → Profesora → allow Microphone
  and Speech Recognition.
- **Build fails in EAS** → send me the build log URL; that's my job, not yours.

## What's deliberately NOT in this build (next iterations)
Pronunciation scoring drills (Azure Pronunciation Assessment) · lessons 2–10 ·
spaced-repetition warm-up/closing rounds · the animated avatar (placeholder circle
for now) · tap-a-word-to-explain subtitles · exact karaoke word timings from the
content pipeline (current timing is estimated) · progress export/backup.
