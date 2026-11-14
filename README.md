# COSMO CLASS - Planet X Hunter 🚀

**Built by a 12-year-old from Sri Lanka for NASA Space Apps Challenge 2026**

> Is there a ninth planet beyond Neptune?
> COSMO CLASS is an interactive, student-built investigation platform that shows how a search for a distant Planet X candidate could be explored using SPHEREx-inspired data.

**This is an educational simulation. It does not claim a real discovery of Planet X.**

---

## ✨ What It Does

### 1. Blink Comparator
Compare two sky-survey epochs (March vs September) like Clyde Tombaugh did when he found Pluto. Spot the moving red dot against stationary stars. Inspired by WiseView.

### 2. Browse 102 Infrared Bands
Explore all 102 SPHEREx bands from 0.75 μm to 5.00 μm. Keyboard controls, timelapse, and audio sonar for accessibility.

### 3. Experiment Lab
Tune detection threshold, observation range (1-100 AU), motion sensitivity, and bandpass filters. Watch 12 raw triggers get filtered to 4 confirmed candidates, with 67% noise reduction.

### 4. 6-Stage AI Pipeline
Ingestion → Calibration → Motion Detection → False-Positive Pruning → Ranking → Human Review. AI helps, but a human scientist always makes the final decision.

### 5. 11-Tool Ecosystem
3D Planets, Audio Learning, Code Editor, Quizzes, Rocket Game, Ad Genie Chatbot, and more - for students, teachers, and curious minds.

---

## 📊 Data & Sources

This project is an educational simulation inspired by NASA data.

We studied how real SPHEREx data is accessed using the official [SPHEREx Tutorial Notebooks](https://caltech-ipac.github.io/irsa-tutorials/tutorials/spherex/spherex_intro.html), which show how to use Python to explore SPHEREx spectral images.

The real data archive is the [NASA/IPAC Infrared Science Archive (IRSA) for SPHEREx](https://irsa.ipac.caltech.edu/Missions/spherex.html).

Our Blink Comparator design was inspired by [WiseView](https://byw.tools/wiseview), a tool used in the Backyard Worlds: Planet 9 project to find moving objects.

We use [Gaia Data Release 3](https://archives.esac.esa.int/gaia) to identify known stars and filter them out.

**NASA does not endorse this project.** This project uses NASA-inspired data for education only.

---

## 🛠️ Built With

- Google AI Studio (App Builder)
- React + Vite + TypeScript
- Tailwind CSS - Claymorphism UI
- Web Audio API for Sonar Accessibility

**AI Disclosure:** This website was built with Google AI Studio, with student design, verification, and testing.

---

## 🚀 How To Run Locally
npm run build

```bash
npm install
npm run dev
