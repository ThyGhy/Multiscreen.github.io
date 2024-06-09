document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    loadDarkMode();
    
    document.getElementById('addVideoButton').addEventListener('click', addVideoFromInput);
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    document.getElementById('settingsButton').addEventListener('click', openSettings);
    document.getElementById('closeSettingsButton').addEventListener('click', closeSettings);
});

function addVideoFromInput() {
    const url = document.getElementById('videoUrl').value;
    addVideo(url);
    saveVideos();
}

function addVideo(url) {
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert("Invalid YouTube URL");
        return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');
    videoContainer.appendChild(iframe);

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-video');
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', () => {
        videoContainer.remove();
        saveVideos();
    });

    videoContainer.appendChild(removeButton);
    document.getElementById('videoContainer').appendChild(videoContainer);
}

function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function saveVideos() {
    const videoContainers = document.querySelectorAll('.video-container iframe');
    const videoUrls = Array.from(videoContainers).map(iframe => iframe.src);
    localStorage.setItem('videos', JSON.stringify(videoUrls));
}

function loadVideos() {
    const videoUrls = JSON.parse(localStorage.getItem('videos')) || [];
    videoUrls.forEach(url => addVideo(url));
}

function toggleDarkMode() {
    const isDarkMode = document.getElementById('darkModeToggle').checked;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkMode() {
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').checked = false;
    }
}

function openSettings() {
    document.getElementById('settingsDialog').showModal();
}

function closeSettings() {
    document.getElementById('settingsDialog').close();
}
