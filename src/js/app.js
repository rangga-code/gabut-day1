let currentGeneratedUrl = '';
let localHistory = JSON.parse(localStorage.getItem('iqc_history')) || [];

document.addEventListener('DOMContentLoaded', () => {
    UI.setSystemTime();
    updateHistoryUI();

    // 1. GENERATE EVENT
    UI.btnGenerate.addEventListener('click', () => {
        const text = UI.messageInput.value.trim();
        const time = UI.timeInput.value.trim() || "12:00";
        const imageUrl = UI.imageInput.value.trim();

        if (!text) {
            UI.messageInput.focus();
            return;
        }

        UI.showLoading();
        const targetApiUrl = buildAlipIqcUrl(text, time, imageUrl);

        const renderImage = new Image();
        renderImage.src = targetApiUrl;
        renderImage.crossOrigin = "Anonymous";

        renderImage.onload = function() {
            currentGeneratedUrl = targetApiUrl;
            UI.showSuccess(targetApiUrl);
            
            // Simpan Data Valid ke LocalStorage History
            saveToHistory(text, time, imageUrl);
        };

        renderImage.onerror = function() {
            UI.showError();
        };
    });

    // 2. DOWNLOAD IMAGE EVENT
    UI.btnDownload.addEventListener('click', async () => {
        if (!currentGeneratedUrl) return;
        UI.btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i>...';

        try {
            const response = await fetch(currentGeneratedUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `IQC_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch {
            window.open(currentGeneratedUrl, '_blank');
        } finally {
            UI.btnDownload.innerHTML = '<i class="fas fa-download"></i> SIMPAN';
        }
    });

    // 3. SHARE HASIL IMAGE/LINK EVENT
    UI.btnShare.addEventListener('click', async () => {
        if (!currentGeneratedUrl) return;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Hasil iPhone Quoted Chat Saya',
                    text: `Lihat kuote chat iPhone palsu yang saya buat di IQC PRO: "${UI.messageInput.value}"`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Batal membagikan:', err);
            }
        } else {
            // Fallback jika browser lama tidak punya Web Share API
            navigator.clipboard.writeText(currentGeneratedUrl);
            alert('Link hasil gambar chat berhasil disalin ke papan klip!');
        }
    });

    // 4. AJAKAN SHARE WEBSITE EVENT
    UI.btnShareApp.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'IQC PRO V2 - iPhone Quote Generator',
                text: 'Bikin screenshot chat iPhone palsu estetik jadi gampang banget disini! Coba sekarang gratis.',
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link website berhasil disalin! Bagikan ke teman atau grup kamu sekarang.');
        }
    });

    // 5. CLEAR ALL HISTORY EVENT
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Hapus seluruh riwayat pembuatan dari browser?')) {
            localHistory = [];
            localStorage.setItem('iqc_history', JSON.stringify(localHistory));
            updateHistoryUI();
        }
    });

    // QUICK TAGS HANDLER
    UI.tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('neo-tag')) UI.messageInput.value = e.target.innerText;
    });

    UI.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') UI.btnGenerate.click();
    });
});

// LOGIKA MANAJEMEN DATA LOCAL STORAGE
function saveToHistory(text, time, imageUrl) {
    // Hindari duplikasi teks yang sama berturut-turut
    if (localHistory.length > 0 && localHistory[0].text === text) return;

    localHistory.unshift({ text, time, imageUrl });
    if (localHistory.length > 10) localHistory.pop(); // Batasi hanya maksimal 10 riwayat terbaru
    localStorage.setItem('iqc_history', JSON.stringify(localHistory));
    updateHistoryUI();
}

function updateHistoryUI() {
    UI.renderHistory(localHistory, 
        (selectedItem) => {
            // Callback memuat data riwayat kembali ke kolom form input
            UI.messageInput.value = selectedItem.text;
            UI.timeInput.value = selectedItem.time;
            UI.imageInput.value = selectedItem.imageUrl;
            UI.btnGenerate.click();
        }, 
        (indexToDelete) => {
            // Callback menghapus baris riwayat tertentu
            localHistory.splice(indexToDelete, 1);
            localStorage.setItem('iqc_history', JSON.stringify(localHistory));
            updateHistoryUI();
        }
    );
}
