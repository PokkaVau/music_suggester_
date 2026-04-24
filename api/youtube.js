
/**
 * Vercel Serverless Function: /api/youtube
 * 
 * This file acts as a secure backend proxy to fetch data from the YouTube Data API.
 * By keeping this logic on the server, the YouTube API Key is never exposed to the client's browser.
 * 
 * @param {Object} req - The incoming HTTP request from the client
 * @param {Object} res - The outgoing HTTP response to the client
 */
export default async function handler(req, res) {
    // 1. Extract the 'mood' parameter from the URL query string (e.g., /api/youtube?mood=happy)
    const { mood } = req.query;

    // 2. Validate input: Ensure the mood parameter is provided
    if (!mood) {
        return res.status(400).json({ error: 'Mood query parameter is required' });
    }

    // 3. Retrieve the secure API key from Vercel's Environment Variables
    // Note: This key is configured in the Vercel Dashboard and is completely invisible to the public
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: 'YouTube API Key is not configured' });
    }

    // 4. Map the simple mood keyword to a highly specific YouTube search query
    // If the input isn't a predefined mood, it uses the input directly as a custom search query
    const getMoodQuery = (m) => {
        const queries = {
            happy: "happy songs playlist 2024",
            sad: "sad songs playlist emotional",
            chill: "lofi chill beats to relax study",
            angry: "hard rock heavy metal playlist"
        };
        return queries[m] || m; 
    };

    const query = getMoodQuery(mood);
    const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
    
    // 5. Construct the YouTube API URL
    // Parameters:
    // - part=snippet: Fetches basic details like title and thumbnails
    // - q={query}: The actual search term
    // - type=video: Only return videos (not channels or playlists)
    // - videoCategoryId=10: Restrict results to the 'Music' category
    // - maxResults=8: Fetch 8 results to fit beautifully in our grid
    const url = `${BASE_URL}?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=8&key=${YOUTUBE_API_KEY}`;

    try {
        // 6. Make the HTTP request to YouTube
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`YouTube API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 7. Format the raw YouTube data into a clean, minimal object for the frontend
        // This reduces the payload size and keeps our frontend code clean
        const formattedData = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url
        }));

        // 8. Send the successful, formatted data back to the frontend
        res.status(200).json({ items: formattedData });
        
    } catch (error) {
        // 9. Handle any unexpected errors (network failure, API quota exhausted, etc.)
        console.error("Error fetching from YouTube API", error);
        res.status(500).json({ error: 'Failed to fetch music data' });
    }
}
