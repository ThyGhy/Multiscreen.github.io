<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>YouTube Multiscreen</title>
	<style>
    	body {
        	font-family: Arial, sans-serif;
        	margin: 0;
        	padding: 0;
        	background-color: #f0f0f0;
    	}
    	.container {
        	width: 100%;
        	display: flex;
        	flex-direction: column;
        	align-items: center;
    	}
    	.header {
        	width: 100%;
        	padding: 20px;
        	text-align: center;
        	background-color: #282c34;
        	color: white;
        	position: relative;
        	display: flex;
        	flex-direction: column;
        	align-items: center;
    	}
    	.input-container {
        	margin-top: 20px;
        	display: flex;
        	align-items: center;
    	}
    	.input-container input {
        	padding: 10px;
        	font-size: 16px;
        	border: 1px solid #ccc;
        	border-radius: 5px;
        	margin-right: 10px;
        	width: 300px;
    	}
    	.add-video {
        	padding: 10px 20px;
        	font-size: 16px;
        	cursor: pointer;
        	border: none;
        	background-color: #007bff;
        	color: white;
        	border-radius: 5px;
    	}
    	.videos {
        	display: flex;
        	flex-wrap: wrap;
        	justify-content: center;
        	width: 100%;
    	}
    	.video-container {
        	position: relative;
        	margin: 10px;
        	background-color: #fff;
        	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        	border-radius: 8px;
        	overflow: hidden;
        	resize: both;
        	width: calc(33% - 20px); /* Adjust width for 3 videos per row */
        	min-width: 200px;
        	min-height: 150px;
        	max-width: 100%;
        	touch-action: none; /* Prevent default touch actions to enable better drag and resize experience */
    	}
    	.video-container iframe {
        	width: 100%;
        	height: 100%;
        	border: none;
    	}
    	.remove-video {
        	position: absolute;
        	top: 10px;
        	right: 10px;
        	padding: 5px 10px;
        	background-color: red;
        	color: white;
        	border: none;
        	cursor: pointer;
        	border-radius: 3px;
    	}
	</style>
</head>
<body>
	<div class="container">
    	<div class="header">
        	<h1>YouTube Multiscreen</h1>
        	<div class="input-container">
            	<input type="text" id="videoUrl" placeholder="Enter YouTube Video URL">
            	<button class="add-video" onclick="addVideo()">Add Video to Grid</button>
        	</div>
    	</div>
    	<div class="videos" id="videoContainer"></div>
	</div>

	<!-- Interact.js CDN -->
	<script src="https://cdn.jsdelivr.net/npm/interactjs@1.10.11/dist/interact.min.js"></script>

	<script>
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
	</script>
</body>
</html>
