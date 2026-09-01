# Tinkerer's Calorie Tracker

A highly experimental, local-first Calorie Tracker and Meal Planner built to be completely transparent, hackable, and fundamentally yours.

Instead of hiding your health data inside an opaque SQLite database or a locked-down cloud service, this application uses the **File System Access API** to directly read and write a raw, human-readable `.json` file on your hard drive. You maintain absolute control over your data. If you want to manually edit your past logs in a text editor, run Python scripts against your dietary history, or back it up via Git, you can. 

## Features

- **Local-First Architecture**: The app strictly operates on a local JSON file of your choosing. No backends, no telemetry, no tracking.
- **Daily Logging**: Track meals (calories, protein, carbs, fats), body weight, and water intake.
- **Block-Based Meal Planner**: A custom-built, Notion-style block editor for drafting upcoming meals. Supports interactive checkboxes, markdown styling, and seamless multiline paragraphs.
- **AI-Powered Insights**: Integrates directly with Google's Gemini AI. The AI runs completely client-side (via API key) and is fed your raw JSON context (including future meal plans) to provide highly personalized, data-driven analysis of your dietary patterns.
- **Data Visualization**: Granular charts breaking down your macro-nutrient splits and caloric distribution over the course of the day using Recharts.
- **Dark Mode**: Essential for late-night tinkering.

## How it Works Under the Hood

### The JSON Data Engine
When you launch the app, it requests permission to mount a specific `.json` file (e.g., `calories-tracker.json`) from your local file system. 

The application loads this entire file into memory as a unified state tree:
```json
{
  "profile": { "height": "...", "weight": "...", "age": "...", "gender": "..." },
  "logs": {
    "2026-09-01": {
      "meals": [{ "name": "Eggs", "calories": 210, "protein": 18, "time": "08:30" }],
      "weight": 75.5,
      "water": 4
    }
  },
  "plannerNotes": {
    "2026-09-02": [
      { "id": "uuid", "type": "checkbox", "content": "Prep chicken", "checked": false }
    ]
  },
  "chatHistory": []
}
```
Every time you interact with the UI, the app mechanically writes the updated state back to the disk. 

### The Planner Editor
The Planner avoids bloated third-party `contenteditable` libraries. It is built as a reactive array of blocks. When a block is focused, it surfaces a native `<textarea>` allowing you to type raw markdown. When blurred, it gracefully falls back to rendered HTML. This ensures the data structure remains exceptionally clean and parsable.

## Setup & Execution

### Prerequisites
- Node.js (v18+)
- A modern browser that supports the File System Access API (Chrome, Edge).

### Installation
1. Clone the repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Configure API Keys**: Create a new file in the root directory named `config.js`. You will store your Gemini API key here. The file should look exactly like this:
   ```javascript
   // config.js
   const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
   ```
   *(Note: `config.js` is ignored by git so your keys remain private).*
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Setting Up Your Database (First Launch)
Because this app runs locally without a backend, you must manually create the file where it stores your data.

1. **Create an empty JSON file**: Anywhere on your computer (preferably *outside* the project folder, like on your Desktop or in your Documents), create a file named `calories-tracker.json`.
2. **Initialize the file**: Open `calories-tracker.json` in a text editor (like Notepad or VS Code) and add an empty JSON object so the app can read it. It must contain exactly this:
   ```json
   {}
   ```
   Save and close the file.
3. **Connect the App**: Open the tracker in your browser. You will be prompted to select a sync file. Click the button, browse to where you saved `calories-tracker.json`, and grant the browser permission to read and write to it.
4. **Important Note on Hot-Reloading**: Do not save your `calories-tracker.json` inside the `d:\codih\calorie-tracker\` source folder! If you do, Vite will detect the file changing every time you log a meal, causing the browser to aggressively force-refresh the page and drop your file permissions.

## Experimentation Notes

This project is designed to be dismantled. 
- Want to intercept the AI prompts? Check `pages/InsightsPage.jsx` where the unified JSON context is flattened and fed to the LLM. 
- Want to manipulate the block-editor mechanics? `components/PlannerEditor.jsx` manages the raw key-down events and focus states.

Break it, inspect the failures, and go one layer deeper.
