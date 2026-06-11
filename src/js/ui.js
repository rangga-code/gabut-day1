const UI = {
    messageInput: document.getElementById('messageInput'),
    carrierInput: document.getElementById('carrierInput'),
    batteryInput: document.getElementById('batteryInput'),
    timeInput: document.getElementById('timeInput'),
    senderInput: document.getElementById('senderInput'),
    imageInput: document.getElementById('imageInput'),
    bgInput: document.getElementById('bgInput'),
    
    btnGenerate: document.getElementById('generateBtn'),
    btnDownload: document.getElementById('downloadBtn'),
    imgResult: document.getElementById('resultImage'),
    loader: document.getElementById('loader'),
    placeholder: document.getElementById('placeholder'),
    container: document.getElementById('resultContainer'),
    tagsContainer: document.getElementById('tagsContainer'),

    showLoading() {
        this.btnGenerate.disabled = true;
        this.btnGenerate.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> PROSES DATA...';
        this.btnDownload.style.display = 'none';
        this.imgResult.style.display = 'none';
        this.placeholder.style.display = 'none';
        this.loader.style.display = 'block';
        this.container.classList.remove('active');
    },

    showSuccess(blobUrl) {
        this.imgResult.src = blobUrl;
        this.loader.style.display = 'none';
        this.imgResult.style.display = 'block';
        this.container.classList.add('active');
        
        this.btnGenerate.disabled = false;
        this.btnGenerate.innerHTML = '<i class="fas fa-sync"></i> RE-GENERATE';
        this.btnDownload.style.display = 'flex';
    },

    showError(msg) {
        this.loader.style.display = 'none';
        this.placeholder.style.display = 'block';
        this.placeholder.innerHTML = `<i class="fas fa-triangle-exclamation" style="color:#ff3333"></i><p style="color:#ff3333; font-size:0.85rem; margin-top:5px;">${msg}</p>`;
        
        this.btnGenerate.disabled = false;
        this.btnGenerate.innerHTML = '<i class="fas fa-redo"></i> RETRY';
    }
};
