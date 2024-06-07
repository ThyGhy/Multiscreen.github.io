document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.querySelector('#videoUrl');
    const addVideoButton = document.querySelector('#addVideoButton');
    const videosContainer = document.querySelector('#videoContainer');
    const settingsDialog = document.querySelector('#settingsDialog');
    const darkModeToggle = document.querySelector('#darkModeToggle');
    const settingsButton = document.querySelector('#settingsButton');
    const closeSettingsButton = document.querySelector('#closeSettingsButton');

    function isValidYouTubeUrl(url) {
        const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
    }

    function getYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/|embed\/)|youtu\.be\/)([^"&?\/ ]{11})/i;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    }

    function addVideo() {
        const url = videoInput.value.trim();
        if (!isValidYouTubeUrl(url)) {
            alert('Please enter a valid YouTube URL.');
            return;
        }

        const videoId = getYouTubeVideoId(url);
        if (!videoId) {
            alert('Unable to extract video ID from the provided URL.');
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        const videoContainer = document.createElement('div');
        videoContainer.classList.add('video-container');
        videoContainer.appendChild(iframe);

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-video');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => videoContainer.remove();

        videoContainer.appendChild(removeButton);
        videosContainer.appendChild(videoContainer);

        videoInput.value = '';
    }

    function openSettings() {
        settingsDialog.showModal();
    }

    function closeSettings() {
        settingsDialog.close();
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    }

    addVideoButton.addEventListener('click', addVideo);
    settingsButton.addEventListener('click', openSettings);
    closeSettingsButton.addEventListener('click', closeSettings);
    darkModeToggle.addEventListener('change', toggleDarkMode);
});
