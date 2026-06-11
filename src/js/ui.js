const UI = {
    messageInput: document.getElementById('messageInput'),
    timeInput: document.getElementById('timeInput'),
    imageInput: document.getElementById('imageInput'),
    
    btnGenerate: document.getElementById('generateBtn'),
    btnDownload: document.getElementById('downloadBtn'),
    imgResult: document.getElementById('resultImage'),
    loader: document.getElementById('loader'),
    placeholder: document.getElementById('placeholder'),
    container: document.getElementById('resultContainer'),
    tagsContainer: document.getElementById('tagsContainer'),

    setSystemTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.timeInput.value = `${hours}:${minutes}`;
    },

    showLoading() {
        this.btnGenerate.disabled = true;
        this.btnGenerate.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> CREATING...';
        this.btnDownload.style.display = 'none';
        this.imgResult.style.display = 'none';
        this.placeholder.style.display = 'none';
        this.loader.style.display = 'block';
        this.container.classList.remove('active');
    },

    showSuccess(srcUrl) {
        this.imgResult.src = srcUrl;
        this.loader.style.display = 'none';
        this.imgResult.style.display = 'block';
        this.container.classList.add('active');
        
        this.btnGenerate.disabled = false;
        this.btnGenerate.innerHTML = '<i class="fas fa-sync"></i> RE-GENERATE';
        this.btnDownload.style.display = 'flex';
    },

    showError() {
        this.loader.style.display = 'none';
        this.placeholder.style.display = 'block';
        this.placeholder.innerHTML = '<i class="fas fa-triangle-exclamation" style="color:#ff3333"></i><p style="color:#ff3333; font-size:0.85rem; margin-top:5px;">Gagal mengambil data dari API Alip</p>';
        
        this.btnGenerate.disabled = false;
        this.btnGenerate.innerHTML = '<i class="fas fa-redo"></i> COBA LAGI';
    }
};
