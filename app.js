/**
 * Main Application Logic (app.js)
 * 
 * This file handles all the user interactions (clicks, typing), updates the DOM (HTML),
 * and manages the state of the application.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cache DOM Elements
    // Grabbing references to HTML elements once so we don't have to search the DOM repeatedly
    const moodButtons = document.querySelectorAll('.mood-btn');
    const moodInput = document.getElementById('mood-input');
    const videoGrid = document.getElementById('video-grid');
    const favoritesGrid = document.getElementById('favorites-grid');
    const statusContainer = document.getElementById('status-container');
    const statusText = document.getElementById('status-text');
    const resultsTitle = document.getElementById('results-title');
    const noFavoritesMsg = document.getElementById('no-favorites-msg');
    const homeBtn = document.getElementById('home-btn');
    const body = document.body;

    // Track the currently active mood to prevent redundant API calls
    let currentMood = null;

    // 2. Initialize the UI on first load
    // Draw the favorites from localStorage immediately
    renderFavorites();

    // Setup Home button to act as a page refresh
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // 3. Setup Event Listeners for the Emoji Buttons
    moodButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mood = e.target.getAttribute('data-mood');
            setActiveButton(e.target);
            moodInput.value = ''; // Clear text input when an emoji is clicked
            handleMoodChange(mood);
        });
    });

    // 4. Setup Event Listeners for the Text Input Box
    
    // Listen for the 'Enter' key to force a custom search
    moodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = sanitizeInput(e.target.value.trim());
            if (text.length > 0) {
                const detectedMood = detectMood(text);
                if (detectedMood) {
                    setActiveButton(document.querySelector(`[data-mood="${detectedMood}"]`));
                    handleMoodChange(detectedMood);
                } else {
                    // If no predefined mood matches, perform a custom search with the exact text
                    setActiveButton(null);
                    handleMoodChange(text);
                }
            }
        }
    });

    // Listen to every keystroke, but 'debounce' it so we only trigger logic 
    // after the user STOPS typing for 600 milliseconds.
    moodInput.addEventListener('input', debounce((e) => {
        const text = sanitizeInput(e.target.value.trim());
        if (text.length > 2) {
            const detectedMood = detectMood(text);
            if (detectedMood) {
                setActiveButton(document.querySelector(`[data-mood="${detectedMood}"]`));
                handleMoodChange(detectedMood);
            }
        }
    }, 600));

    // --- Core Functions ---

    /**
     * Visually highlights the active mood button
     */
    function setActiveButton(activeBtn) {
        moodButtons.forEach(btn => btn.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    /**
     * The main orchestrator function. It handles theme switching and fetching data.
     */
    async function handleMoodChange(mood) {
        if (currentMood === mood) return; // Prevent duplicate requests for the same mood
        currentMood = mood;

        // Change the CSS variable theme on the body tag
        body.setAttribute('data-theme', mood);

        // Reset UI for loading state
        resultsTitle.classList.add('hidden');
        videoGrid.innerHTML = '';
        showLoader();

        try {
            // Fetch data from our backend
            const videos = await fetchYouTubeVideos(mood);
            hideLoader();
            renderVideos(videos);
        } catch (error) {
            hideLoader();
            showError("Oops! Something went wrong while fetching music.");
        }
    }

    // --- UI Helper Functions ---

    function showLoader() {
        statusContainer.classList.remove('hidden');
        statusContainer.querySelector('.loader').classList.remove('hidden');
        statusText.textContent = 'Finding the perfect tracks...';
    }

    function hideLoader() {
        statusContainer.classList.add('hidden');
    }

    function showError(msg) {
        statusContainer.classList.remove('hidden');
        statusText.textContent = msg;
        statusContainer.querySelector('.loader').classList.add('hidden'); // Hide animation bars
    }

    /**
     * Factory function to create a Video Card DOM element
     * @param {Object} video - The video data object
     * @param {boolean} isFavorite - Whether this card should render a "Save" or "Remove" button
     */
    function createVideoCard(video, isFavorite = false) {
        const card = document.createElement('div');
        card.className = 'video-card fade-in';
        
        // Build the HTML structure of the card
        card.innerHTML = `
            <a href="${video.videoId.startsWith('mock') ? '#' : `https://www.youtube.com/watch?v=${video.videoId}`}" 
               target="${video.videoId.startsWith('mock') ? '_self' : '_blank'}" 
               rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; flex-grow: 1;">
                <img src="${video.thumbnail}" alt="Thumbnail for ${video.title}" class="video-thumbnail" loading="lazy">
                <div class="video-info">
                    <h3 class="video-title">${sanitizeInput(video.title)}</h3>
                    <p class="channel-name">${sanitizeInput(video.channelTitle)}</p>
                </div>
            </a>
            <div class="card-actions">
            </div>
        `;

        const actionsContainer = card.querySelector('.card-actions');
        
        // Create the initial Save/Remove button
        const btn = document.createElement('button');
        if (isFavorite) {
            btn.className = 'remove-btn';
            btn.innerHTML = '🗑️ Remove';
            btn.addEventListener('click', (e) => handleFavoriteToggle(e, video, false, btn));
        } else {
            btn.className = 'save-btn';
            btn.innerHTML = '❤️ Save';
            btn.addEventListener('click', (e) => handleFavoriteToggle(e, video, true, btn));
        }
        actionsContainer.appendChild(btn);

        /**
         * Inline helper to toggle favorites when the button is clicked.
         * It updates localStorage, re-renders the favorites grid, and swaps the button visually.
         */
        function handleFavoriteToggle(e, vid, willBeFav, currentBtn) {
            e.preventDefault(); // Prevent the click from bubbling up to the anchor tag (which would open YouTube)
            e.stopPropagation();
            
            // Update storage
            if (willBeFav) {
                storage.saveFavorite(vid);
            } else {
                storage.removeFavorite(vid.videoId);
            }
            
            // Re-render the favorites section immediately to reflect the change
            renderFavorites(); 
            
            // Swap the button from "Save" to "Remove" (or vice versa) inline
            const newBtn = document.createElement('button');
            if (willBeFav) {
                newBtn.className = 'remove-btn';
                newBtn.innerHTML = '🗑️ Remove';
                newBtn.addEventListener('click', (ev) => handleFavoriteToggle(ev, vid, false, newBtn));
            } else {
                newBtn.className = 'save-btn';
                newBtn.innerHTML = '❤️ Save';
                newBtn.addEventListener('click', (ev) => handleFavoriteToggle(ev, vid, true, newBtn));
            }
            
            // If we are clicking "Remove" inside the actual favorites grid, remove the whole card
            if (card.parentElement && card.parentElement.id === 'favorites-grid') {
                card.remove();
                if (storage.getFavorites().length === 0) {
                    noFavoritesMsg.classList.remove('hidden'); // Show empty state message
                }
            } else {
                // Otherwise, just swap the button on the card
                currentBtn.replaceWith(newBtn);
            }
        }

        return card;
    }

    /**
     * Loops through an array of video data and renders cards into the main grid
     */
    function renderVideos(videos) {
        videoGrid.innerHTML = '';
        if (videos.length === 0) {
            showError("No tracks found for this mood.");
            return;
        }
        
        resultsTitle.classList.remove('hidden');
        
        videos.forEach(video => {
            // Check if this specific video is already favorited to render the correct button state
            const isFav = storage.isFavorite(video.videoId);
            const card = createVideoCard(video, isFav);
            videoGrid.appendChild(card);
        });
    }

    /**
     * Reads favorites from localStorage and renders them into the favorites section
     */
    function renderFavorites() {
        const favs = storage.getFavorites();
        favoritesGrid.innerHTML = '';
        
        if (favs.length === 0) {
            noFavoritesMsg.classList.remove('hidden');
        } else {
            noFavoritesMsg.classList.add('hidden');
            favs.forEach(video => {
                const card = createVideoCard(video, true);
                favoritesGrid.appendChild(card);
            });
        }
    }
});
