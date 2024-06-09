document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('gridContainer');
    const manageLayoutsButton = document.getElementById('manageLayouts');
    const darkModeToggle = document.getElementById('darkMode');
    const addVideoButton = document.getElementById('addVideo');
    const addVideoModal = document.getElementById('addVideoModal');
    const manageLayoutsModal = document.getElementById('manageLayoutsModal');
    const closeModalButtons = document.querySelectorAll('.close-button');
    const addVideoForm = document.getElementById('addVideoForm');
    const saveLayoutForm = document.getElementById('saveLayoutForm');
    const savedLayoutsList = document.getElementById('savedLayoutsList');

    // Initialize dark mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkModeToggle.checked);
    });

    // Load default layout
    loadDefaultLayout();

    manageLayoutsButton.addEventListener('click', () => {
        manageLayoutsModal.style.display = 'block';
        loadSavedLayouts();
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === addVideoModal) {
            addVideoModal.style.display = 'none';
        }
        if (event.target === manageLayoutsModal) {
            manageLayoutsModal.style.display = 'none';
        }
    });

    addVideoButton.addEventListener('click', () => {
        addVideoModal.style.display = 'block';
    });

    addVideoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const videoUrl = document.getElementById('videoUrl').value;
        if (videoUrl) {
            const embedUrl = getEmbedUrl(videoUrl);
            if (embedUrl) {
                addVideo(embedUrl);
                addVideoModal.style.display = 'none';
                addVideoForm.reset();
                saveDefaultLayout();
            } else {
                alert('Invalid YouTube URL.');
            }
        }
    });

    saveLayoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const layoutName = document.getElementById('layoutName').value;
        if (layoutName) {
            saveLayout(layoutName);
            saveLayoutForm.reset();
            loadSavedLayouts();
        }
    });

    function saveLayout(name) {
        const layout = getCurrentLayout();
        localStorage.setItem(`layout_${name}`, JSON.stringify(layout));
        alert('Layout saved!');
    }

    function loadLayout(layout) {
        gridContainer.innerHTML = '';
        layout.forEach(video => {
            addVideo(video.url, video);
        });
    }

    function loadSavedLayouts() {
        savedLayoutsList.innerHTML = '';
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('layout_')) {
                const layoutName = key.replace('layout_', '');
                const listItem = document.createElement('li');
                listItem.textContent = layoutName;
                listItem.appendChild(createLoadButton(layoutName));
                listItem.appendChild(createDeleteButton(layoutName));
                savedLayoutsList.appendChild(listItem);
            }
        });
    }

    function createLoadButton(layoutName) {
        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load';
        loadButton.addEventListener('click', () => {
            const layout = JSON.parse(localStorage.getItem(`layout_${layoutName}`));
            if (layout) {
                loadLayout(layout);
                localStorage.setItem('defaultVideoLayout', JSON.stringify(layout));
                manageLayoutsModal.style.display = 'none';
            }
        });
        return loadButton;
    }

    function createDeleteButton(layoutName) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            localStorage.removeItem(`layout_${layoutName}`);
            loadSavedLayouts();
        });
        return deleteButton;
    }

    function getEmbedUrl(url) {
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        } else if (url.includes('youtube.com/live')) {
            const liveRegex = /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/;
            const liveMatch = url.match(liveRegex);
            if (liveMatch && liveMatch[1]) {
                return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1`;
            }
        }
        return null;
    }

    function addVideo(url, videoData = null) {
        const videoBox = document.createElement('div');
        videoBox.classList.add('video-box');
        videoBox.setAttribute('data-id', Date.now());

        if (videoData) {
            videoBox.style.left = videoData.position.x;
            videoBox.style.top = videoData.position.y;
            videoBox.style.width = videoData.size.width;
            videoBox.style.height = videoData.size.height;
        }

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.allow = 'autoplay; encrypted-media';
        videoBox.appendChild(iframe);

        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            videoBox.remove();
            saveDefaultLayout();
        });
        videoBox.appendChild(removeButton);

        gridContainer.appendChild(videoBox);

        interact(videoBox)
            .draggable({
                onmove: dragMoveListener
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true }
            })
            .on('resizemove', (event) => {
                let target = event.target;
                let x = (parseFloat(target.getAttribute('data-x')) || 0);
                let y = (parseFloat(target.getAttribute('data-y')) || 0);

                // Update the element's style
                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';

                // Translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            });

        saveDefaultLayout();
    }

    function getCurrentLayout() {
        const layout = [];
        document.querySelectorAll('.video-box').forEach(box => {
            const video = {
                id: box.getAttribute('data-id'),
                url: box.querySelector('iframe').src,
                position: {
                    x: box.style.left,
                    y: box.style.top
                },
                size: {
                    width: box.style.width,
                    height: box.style.height
                }
            };
            layout.push(video);
        });
        return layout;
    }

    function saveDefaultLayout() {
        const layout = getCurrentLayout();
        localStorage.setItem('defaultVideoLayout', JSON.stringify(layout));
    }

    function loadDefaultLayout() {
        const defaultLayout = JSON.parse(localStorage.getItem('defaultVideoLayout'));
        if (defaultLayout) {
            loadLayout(defaultLayout);
        }
    }

    function dragMoveListener(event) {
        var target = event.target;
        // Keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Translate the element
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

        // Update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        saveDefaultLayout();
    }
});
