const UI = {
    messageInput: document.getElementById('messageInput'),
    timeInput: document.getElementById('timeInput'),
    galleryFileInput: document.getElementById('galleryFileInput'),
    filePickerBtn: document.getElementById('filePickerBtn'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),
    
    btnGenerate: document.getElementById('generateBtn'),
    btnDownload: document.getElementById('downloadBtn'),
    btnShare: document.getElementById('shareBtn'),
    btnShareApp: document.getElementById('shareAppBtn'),
    successActions: document.getElementById('successActions'),
    
    imgResult: document.getElementById('resultImage'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loaderText'),
    placeholder: document.getElementById('placeholder'),
    container: document.getElementById('resultContainer'),
    tagsContainer: document.getElementById('tagsContainer'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    setSystemTime() {
        const now = new Date();
        this.timeInput.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },

    showLoading(customMessage = "SEDANG MERENDER GAMBAR...") {
        this.btnGenerate.disabled = true;
        this.btnGenerate.innerHTML = '<i class="fas fa-hammer fa-spin"></i> RUNNING...';
        this.loaderText.innerText = customMessage;
        this.successActions.style.display = 'none';
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
        this.btnGenerate.innerHTML = '<i class="fas fa-terminal"></i> RUN GENERATOR';
        this.successActions.style.display = 'grid';
    },

    showError() {
        this.loader.style.display = 'none';
        this.placeholder.style.display = 'block';
        this.placeholder.innerHTML = '<i class="fas fa-bomb" style="color:#ff3333"></i><p style="color:#ff3333; font-weight:900;">API TIMEOUT / ERROR</p>';
        this.btnGenerate.disabled = false;
        this.btnGenerate.innerHTML = '<i class="fas fa-redo"></i> COBA LAGI';
    },

    resetFilePicker() {
        this.galleryFileInput.value = '';
        this.fileNameDisplay.innerText = 'Tidak ada foto dipilih';
        this.filePickerBtn.style.background = 'var(--neo-cyan)';
    },

    renderHistory(items, onLoadItem, onDelItem) {
        if (items.length === 0) {
            this.historyList.innerHTML = '<p class="empty-history">Belum ada data riwayat.</p>';
            this.clearHistoryBtn.style.display = 'none';
            return;
        }

        this.historyList.innerHTML = '';
        this.clearHistoryBtn.style.display = 'block';

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <div class="h-text">${item.text}</div>
                    <div class="h-time">Jam: ${item.time}</div>
                </div>
                <div class="history-actions">
                    <button class="history-btn load" data-index="${index}"><i class="fas fa-folder-open"></i></button>
                    <button class="history-btn del" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            div.querySelector('.load').addEventListener('click', () => onLoadItem(item));
            div.querySelector('.del').addEventListener('click', () => onDelItem(index));
            this.historyList.appendChild(div);
        });
    }
};
