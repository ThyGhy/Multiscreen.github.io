document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('videoContainer');
    const addVideoButton = document.getElementById('addVideoButton');
    const videoUrlInput = document.getElementById('videoUrl');

    // Function to save videos to localStorage
    function saveVideos() {
        const videoContainers = document.querySelectorAll('.video-container iframe');
        const videos = Array.from(videoContainers).map(iframe => iframe.src);
        localStorage.setItem('videos', JSON.stringify(videos));
    }

    // Function to load videos from localStorage
    function loadVideos() {
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        videos.forEach(url => addVideo(url));
    }

    // Function to extract video ID from YouTube URL
    function extractVideoID(url) {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
        return null;
    }

    // Function to add a video to the grid
    function addVideo(url) {
        const videoID = extractVideoID(url);
        if (videoID) {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoID}`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-video';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                videoContainer.remove();
                saveVideos();
            });
            
            videoContainer.appendChild(iframe);
            videoContainer.appendChild(removeButton);
            document.getElementById('videoContainer').appendChild(videoContainer);
            saveVideos();
        } else {
            alert('Invalid YouTube URL');
        }
    }

    // Add video button click event
    addVideoButton.addEventListener('click', () => {
        const url = videoUrlInput.value.trim();
        if (url) {
            addVideo(url);
            videoUrlInput.value = '';
        }
    });

    // Load videos on page load
    loadVideos();
});
