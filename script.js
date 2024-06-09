
document.addEventListener('DOMContentLoaded', loadVideos);

function addVideo() {
    const videoUrl = document.getElementById('videoUrl').value;
    if (videoUrl) {
        const videoID = getYouTubeID(videoUrl);
        if (videoID) {
            addVideoToDOM(videoID);
            saveVideos();
            document.getElementById('videoUrl').value = ''; // Clear the input field
        } else {
            alert("Invalid YouTube URL");
        }
    }
}

function removeVideo(button) {
    const videoContainer = button.parentElement;
    videoContainer.remove();
    saveVideos();
}

function getYouTubeID(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function addVideoToDOM(videoID) {
    const videoContainer = document.createElement("div");
    videoContainer.className = "video-container";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoID}`;
    iframe.allowFullscreen = true;
    const removeButton = document.createElement("button");
    removeButton.className = "remove-video";
    removeButton.innerText = "Remove";
    removeButton.onclick = function() {
        removeVideo(removeButton);
    };
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(removeButton);
    document.getElementById("videoContainer").appendChild(videoContainer);

    makeInteractable(videoContainer);
}

function makeInteractable(element) {
    interact(element)
        .draggable({
            listeners: {
                start(event) {
                    element.style.zIndex = 9999;  // Bring the element to the front while dragging
                },
                move(event) {
                    let { x, y } = event.target.dataset;
                    x = (parseFloat(x) || 0) + event.dx;
                    y = (parseFloat(y) || 0) + event.dy;

                    event.target.style.transform = `translate(${x}px, ${y}px)`;
                    Object.assign(event.target.dataset, { x, y });
                },
                end(event) {
                    element.style.zIndex = "";  // Reset the z-index after dragging
                    saveVideos();
                }
            }
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: false },
            listeners: {
                move(event) {
                    let { x, y } = event.target.dataset;
                    x = (parseFloat(x) || 0) + event.deltaRect.left;
                    y = (parseFloat(y) || 0) + event.deltaRect.top;

                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`,
                        transform: `translate(${x}px, ${y}px)`
                    });

                    Object.assign(event.target.dataset, { x, y });
                },
                end() {
                    saveVideos();
                }
            }
        });
}

function saveVideos() {
    const videoContainers = document.querySelectorAll(".video-container");
    const videoData = Array.from(videoContainers).map(container => {
        const iframe = container.querySelector("iframe");
        return {
            id: getYouTubeID(iframe.src),
            width: container.style.width,
            height: container.style.height,
            x: container.dataset.x || 0,
            y: container.dataset.y || 0
        };
    });
    console.log("Saving videos:", videoData);  // Debugging log
    localStorage.setItem('videos', JSON.stringify(videoData));
}

function loadVideos() {
    const savedVideos = JSON.parse(localStorage.getItem('videos') || '[]');
    console.log("Loading videos:", savedVideos);  // Debugging log
    savedVideos.forEach(video => {
        const videoContainer = document.createElement("div");
        videoContainer.className = "video-container";
        videoContainer.style.width = video.width;
        videoContainer.style.height = video.height;
        videoContainer.style.transform = `translate(${video.x}px, ${video.y}px)`;
        videoContainer.dataset.x = video.x;
        videoContainer.dataset.y = video.y;
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${video.id}`;
        iframe.allowFullscreen = true;
        const removeButton = document.createElement("button");
        removeButton.className = "remove-video";
        removeButton.innerText = "Remove";
        removeButton.onclick = function() {
            removeVideo(removeButton);
        };
        videoContainer.appendChild(iframe);
        videoContainer.appendChild(removeButton);
        document.getElementById("videoContainer").appendChild(videoContainer);

        makeInteractable(videoContainer);
    });
}
