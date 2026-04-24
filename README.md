# 🎵 VibeTunez - Mood-Based Music Recommender

VibeTunez is a modern, Gen-Z styled web application that recommends YouTube music videos based on how you feel. Built with a stunning Glassmorphism UI, dynamic animated gradients, and completely Vanilla JavaScript—no external frameworks required!

## ✨ Features

- **Mood Detection**: Select an emoji or type a phrase like "I feel lonely today" and the app will intelligently detect your vibe using debounced input matching.
- **Dynamic Themes**: The entire application's aesthetic (background gradients, glowing colors, shadows) changes instantly to match your mood.
- **Custom Searches**: Looking for something specific? Just type your favorite artist or genre and hit Enter!
- **Favorites System**: Save your favorite tracks securely in your browser using `localStorage`.
- **Secure Architecture**: The YouTube API key is hidden entirely behind a Vercel Serverless Function, preventing malicious scraping.
- **Development Mode**: If an API key isn't present, the app automatically falls back to a simulated Mock Data Engine, allowing you to develop the UI without consuming your API quota.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), Semantic HTML5, Custom CSS3
- **Design**: CSS Variables, Flexbox/CSS Grid, Glassmorphism aesthetics, FontAwesome
- **Backend/Hosting**: Vercel Serverless Functions (`Node.js`)
- **External API**: YouTube Data API v3

## 🚀 How to Run Locally

If you want to run this project on your own machine without setting up an API key, it works out of the box using mock data!

1. Clone the repository:
   ```bash
   git clone https://github.com/PokkaVau/your-repo-name.git
   ```
2. Open the project folder.
3. Start a simple local server (e.g., using VS Code Live Server, or Python):
   ```bash
   python -m http.server 8000
   ```
4. Navigate to `http://localhost:8000` in your browser. The app will notice the Vercel backend isn't running and automatically serve you mock data!

## 🌐 How to Deploy to Vercel (Production)

This app is pre-configured to deploy seamlessly to Vercel while keeping your API key 100% safe.

1. Push this code to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Before hitting Deploy, open the **Environment Variables** section.
4. Add a new variable:
   - **Key**: `YOUTUBE_API_KEY`
   - **Value**: Your actual Google Cloud API Key
5. Click **Deploy**! Vercel will automatically convert the `api/youtube.js` file into a secure backend endpoint.

> **Security Note:** Even though the key is hidden on the server, you should always go to your Google Cloud Console and add an "HTTP Referrer Restriction" to lock the key down to your specific Vercel URL.

## 🤝 Let's Connect

Feel free to connect with me online:
- **GitHub**: [PokkaVau](https://github.com/PokkaVau)
- **LinkedIn**: [Md Zayed Iqbal](https://www.linkedin.com/in/md-zayed-iqbal-372852254/)
- **Facebook**: [PokkaVau](https://www.facebook.com/PokkaVau)
