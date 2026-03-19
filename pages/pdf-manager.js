// PDF Manager Frontend JavaScript

const API_BASE = 'http://localhost:5000/api/pdf'; // Update with your backend URL

// Handle file selection
document.getElementById('pdfFile').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No file selected';
    document.getElementById('fileName').textContent = fileName;
});

// Handle PDF Upload
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];
    const uploadBtn = document.getElementById('uploadBtn');
    const messageDiv = document.getElementById('uploadMessage');
    
    if (!file) {
        showMessage(messageDiv, 'Please select a PDF file', 'error');
        return;
    }

    // Disable button and show loading
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = 'Uploading<span class="loading"></span>';

    try {
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showMessage(messageDiv, `✓ ${data.message}`, 'success');
            
            // Store the uploaded PDF info in localStorage
            const uploadedPdfs = JSON.parse(localStorage.getItem('uploadedPdfs') || '[]');
            uploadedPdfs.unshift({
                publicId: data.data.publicId,
                fileName: data.data.fileName,
                url: data.data.url,
                size: data.data.size,
                uploadedAt: data.data.uploadedAt
            });
            localStorage.setItem('uploadedPdfs', JSON.stringify(uploadedPdfs.slice(0, 10))); // Keep last 10
            
            // Reset form
            fileInput.value = '';
            document.getElementById('fileName').textContent = '';
            
            // Refresh PDF list
            displayUploadedPdfs();
        } else {
            showMessage(messageDiv, `✗ ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showMessage(messageDiv, `✗ Error uploading PDF: ${error.message}`, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = 'Upload PDF';
    }
});

// Handle PDF Loading
document.getElementById('loadPdfBtn').addEventListener('click', async function() {
    const publicId = document.getElementById('publicIdInput').value.trim();
    const messageDiv = document.getElementById('viewMessage');

    if (!publicId) {
        showMessage(messageDiv, 'Please enter a Public ID', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${publicId}`);
        const data = await response.json();

        if (data.success) {
            displayPdf(data.data.url, publicId);
            showMessage(messageDiv, '✓ PDF loaded successfully', 'success');
        } else {
            showMessage(messageDiv, `✗ Error loading PDF: ${data.message}`, 'error');
        }
    } catch (error) {
        console.error('Load error:', error);
        showMessage(messageDiv, `✗ Error loading PDF: ${error.message}`, 'error');
    }
});

// Display PDF in viewer
function displayPdf(url, publicId) {
    const viewerSection = document.getElementById('viewerSection');
    const iframeContainer = document.getElementById('iframeContainer');
    const downloadLink = document.getElementById('downloadLink');

    iframeContainer.innerHTML = `<iframe src="${url}" title="PDF Viewer"></iframe>`;
    downloadLink.href = url;
    downloadLink.download = `${publicId}.pdf`;
    
    viewerSection.style.display = 'block';
    viewerSection.scrollIntoView({ behavior: 'smooth' });
}

// Display uploaded PDFs from localStorage
function displayUploadedPdfs() {
    const uploadedPdfs = JSON.parse(localStorage.getItem('uploadedPdfs') || '[]');
    const pdfList = document.getElementById('pdfList');

    if (uploadedPdfs.length === 0) {
        pdfList.innerHTML = '<p style="color: #999; text-align: center;">No PDFs uploaded yet</p>';
        return;
    }

    pdfList.innerHTML = uploadedPdfs.map((pdf, index) => `
        <div class="pdf-item">
            <div class="pdf-info">
                <div class="pdf-name">📄 ${escapeHtml(pdf.fileName)}</div>
                <div class="pdf-id">ID: ${pdf.publicId}</div>
            </div>
            <div class="pdf-actions">
                <button class="btn btn-secondary" onclick="loadPdfFromList('${pdf.publicId}', '${escapeHtml(pdf.url)}')">
                    👁️ View
                </button>
                <button class="btn btn-secondary" onclick="downloadPdf('${pdf.url}', '${escapeHtml(pdf.fileName)}')">
                    ⬇️ Download
                </button>
            </div>
        </div>
    `).join('');
}

// Load PDF from list
function loadPdfFromList(publicId, url) {
    document.getElementById('publicIdInput').value = publicId;
    displayPdf(url, publicId);
}

// Download PDF
function downloadPdf(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            element.className = 'message';
        }, 3000);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayUploadedPdfs();
});
