# Calorie Tracker with AI

A fully featured, local-first Calorie Tracker and Meal Planner powered by AI.

This application was built as an alternative to mainstream health apps that lock essential features behind premium subscriptions. It uses the **File System Access API** to read and write your data directly to a `.json` file on your local machine. This keeps your data entirely within your control and provides full access to all features without any artificial paywalls.

## Features

- **Local-First Architecture**: Operates directly on a local JSON file. No backend servers required.
- **Comprehensive Logging**: Track meals (calories, protein, carbs, fats), body weight, and water intake completely for free.
- **Block-Based Meal Planner**: A custom-built block editor for drafting upcoming meals with interactive checkboxes, markdown styling, and seamless multiline text.
- **AI-Powered Insights**: Integrates directly with Google's Gemini AI. Feed your raw JSON data to the AI (via your own API key) for highly personalized analysis of your dietary patterns.
- **Data Visualization**: Granular Recharts breaking down your macro-nutrient splits and caloric distribution over the course of the day.
- **Dark Mode**: Built-in native dark mode interface.

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

## Design Philosophy

This project was built to provide a fully capable health tracker without the premium subscriptions common in modern apps. By storing the entire diet history in a standard, human-readable JSON file, the data remains portable and entirely owned by the user. You can manually edit your past logs, parse the data with scripts, or back it up via Git.
