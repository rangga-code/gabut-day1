let currentGeneratedUrl = '';

document.addEventListener('DOMContentLoaded', () => {
    // Set waktu otomatis perangkat saat pertama dibuka
    UI.setSystemTime();

    // Event handler klik tombol generate
    UI.btnGenerate.addEventListener('click', () => {
        const text = UI.messageInput.value.trim();
        const time = UI.timeInput.value.trim() || "12:00";
        const imageUrl = UI.imageInput.value.trim();

        if (!text) {
            UI.messageInput.focus();
            return;
        }

        UI.showLoading();

        // Bangun target URL dari modul api.js
        const targetApiUrl = buildAlipIqcUrl(text, time, imageUrl);

        // Render Gambar via Object Image JavaScript (Pre-loading)
        const renderImage = new Image();
        renderImage.src = targetApiUrl;
        renderImage.crossOrigin = "Anonymous";

        renderImage.onload = function() {
            currentGeneratedUrl = targetApiUrl;
            UI.showSuccess(targetApiUrl);
        };

        renderImage.onerror = function() {
            UI.showError();
        };
    });

    // Event handler klik tombol download
    UI.btnDownload.addEventListener('click', async () => {
        if (!currentGeneratedUrl) return;
        UI.btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SAVING...';

        try {
            const response = await fetch(currentGeneratedUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = `IQC_ALIP_${Date.now()}.png`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            window.open(currentGeneratedUrl, '_blank');
        } finally {
            UI.btnDownload.innerHTML = '<i class="fas fa-download"></i> SIMPAN GAMBAR';
        }
    });

    // Event handler pengisian cepat klik tag contoh teks
    UI.tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('neo-tag')) {
            UI.messageInput.value = e.target.innerText;
        }
    });

    // Jalankan generate lewat enter pada keyboard
    UI.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') UI.btnGenerate.click();
    });
});
