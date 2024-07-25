document.addEventListener('DOMContentLoaded', () => {
    fetch('files.json')
        .then(response => response.json())
        .then(files => {
            const fileList = document.getElementById('file-list');
            files.forEach(({ directory, file }) => {
                const fileContainer = document.createElement('div');
                fileContainer.className = 'file-container';

                const fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = `${file}`;
                fileContainer.appendChild(fileName);

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const viewButton = document.createElement('a');
                viewButton.className = 'btn view-btn';
                viewButton.textContent = 'View';
                viewButton.href = `${directory}/${file}`;
                viewButton.target = '_blank';
                buttonContainer.appendChild(viewButton);

                const downloadButton = document.createElement('a');
                downloadButton.className = 'btn download-btn';
                downloadButton.textContent = 'Download';
                downloadButton.href = `${directory}/${file}`;
                downloadButton.download = file;
                buttonContainer.appendChild(downloadButton);

                fileContainer.appendChild(buttonContainer);
                fileList.appendChild(fileContainer);
            });
        })
        .catch(error => console.error('Error fetching file list:', error));
});