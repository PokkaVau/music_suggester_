// utils.js

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const sanitizeInput = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

const moodKeywords = {
    happy: ['happy', 'joy', 'excited', 'good', 'great', 'awesome', 'fun', 'upbeat', 'energetic', 'glad'],
    sad: ['sad', 'down', 'depressed', 'lonely', 'cry', 'tears', 'heartbreak', 'gloomy', 'upset'],
    chill: ['chill', 'relax', 'calm', 'peace', 'lofi', 'study', 'sleep', 'vibes', 'tired'],
    angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'frustrated', 'rock', 'metal', 'annoyed']
};

const detectMood = (text) => {
    text = text.toLowerCase();
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            return mood;
        }
    }
    return null; // Return null if no clear mood is detected
};

const storage = {
    getFavorites: () => {
        const favs = localStorage.getItem('vibetunez_favorites');
        return favs ? JSON.parse(favs) : [];
    },
    saveFavorite: (video) => {
        const favs = storage.getFavorites();
        if (!favs.find(f => f.videoId === video.videoId)) {
            favs.push(video);
            localStorage.setItem('vibetunez_favorites', JSON.stringify(favs));
        }
    },
    removeFavorite: (videoId) => {
        let favs = storage.getFavorites();
        favs = favs.filter(f => f.videoId !== videoId);
        localStorage.setItem('vibetunez_favorites', JSON.stringify(favs));
    },
    isFavorite: (videoId) => {
        const favs = storage.getFavorites();
        return favs.some(f => f.videoId === videoId);
    }
};

// Mock data generator for testing without an API key or running locally
const getMockData = (mood) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const results = [];
            for(let i = 1; i <= 8; i++) {
                results.push({
                    videoId: `mock_${mood}_${i}`,
                    title: `Awesome ${mood.charAt(0).toUpperCase() + mood.slice(1)} Track ${i}`,
                    channelTitle: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes Channel`,
                    thumbnail: `https://picsum.photos/seed/${mood}${i}/320/180`
                });
            }
            resolve(results);
        }, 1200); // Simulate network delay
    });
};

const fetchYouTubeVideos = async (mood) => {
    try {
        // Call our secure Vercel Serverless Function
        const response = await fetch(`/api/youtube?mood=${encodeURIComponent(mood)}`);
        
        if (!response.ok) {
            console.warn(`Backend returned ${response.status}. Using mock data for local testing.`);
            return getMockData(mood);
        }
        
        const data = await response.json();
        return data.items;
        
    } catch (error) {
        // If fetch fails completely (e.g. running via simple file:// or python server), use mock data
        console.warn("Backend not accessible. Using mock data.");
        return getMockData(mood);
    }
};
