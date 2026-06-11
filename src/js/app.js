let currentGeneratedUrl = '';
let localHistory = JSON.parse(localStorage.getItem('iqc_history')) || [];
let globalSelectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    UI.setSystemTime();
    updateHistoryUI();

    // SINKRONISASI COUPLING TOMBOL UNTUK MEMBUKA GALERI HP (FIXED)
    if (UI.filePickerBtn && UI.galleryFileInput) {
        UI.filePickerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.galleryFileInput.click();
        });
    }
    
    // PANTAU JIKA USER SELESAI MEMILIH GAMBAR
    if (UI.galleryFileInput) {
        UI.galleryFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                globalSelectedFile = e.target.files[0];
                UI.fileNameDisplay.innerText = globalSelectedFile.name;
                UI.filePickerBtn.style.background = 'var(--neo-yellow)';
            } else {
                globalSelectedFile = null;
                UI.resetFilePicker();
            }
        });
    }

    // 1. ENGINE RUN GENERATOR
    UI.btnGenerate.addEventListener('click', async () => {
        const text = UI.messageInput.value.trim();
        const time = UI.timeInput.value.trim() || "12:00";

        if (!text) {
            UI.messageInput.focus();
            return;
        }

        UI.showLoading("MENGECEK KOMPONEN FILE...");
        let uploadedImageUrl = '';

        // PROSES UNGGAH OTOMATIS JIKA ADA GAMBAR DARI GALERI
        if (globalSelectedFile) {
            try {
                UI.showLoading("UPLOADING IMAGE TO SERVER...");
                const formData = new FormData();
                formData.append('file', globalSelectedFile);

                const uploadResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadJson = await uploadResponse.json();
                
                if (uploadJson.data && uploadJson.data.url) {
                    uploadedImageUrl = uploadJson.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                }
            } catch (error) {
                console.error("Gagal unggah biner gambar:", error);
            }
        }

        UI.showLoading("CONNECTING TO RANGGACODE API...");
        const targetApiUrl = buildAlipIqcUrl(text, time, uploadedImageUrl);

        const renderImage = new Image();
        renderImage.src = targetApiUrl;
        renderImage.crossOrigin = "Anonymous";

        renderImage.onload = function() {
            currentGeneratedUrl = targetApiUrl;
            UI.showSuccess(targetApiUrl);
            saveToHistory(text, time);
        };

        renderImage.onerror = function() {
            UI.showError();
        };
    });

    // 2. DOWNLOAD IMAGE
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

    // 3. BAGIKAN HASIL GAMBAR CHAT
    UI.btnShare.addEventListener('click', () => {
        if (!currentGeneratedUrl) return;
        if (navigator.share) {
            navigator.share({
                title: 'Hasil iPhone Quoted Chat Saya',
                text: `Lihat kuote chat iPhone palsu yang saya buat di IQC PRO: "${UI.messageInput.value}"`,
                url: currentGeneratedUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(currentGeneratedUrl);
            alert('Link hasil gambar chat berhasil disalin ke papan klip!');
        }
    });

    // 4. BAGIKAN ALAMAT LINK WEBSITE UTAMA
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

    // 5. HAPUS SEMUA LOG RIWAYAT
    UI.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Hapus seluruh riwayat pembuatan dari browser?')) {
            localHistory = [];
            localStorage.setItem('iqc_history', JSON.stringify(localHistory));
            updateHistoryUI();
        }
    });

    // REKOMENDASI TAGS
    UI.tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('neo-tag')) UI.messageInput.value = e.target.innerText;
    });

    UI.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') UI.btnGenerate.click();
    });
});

function saveToHistory(text, time) {
    if (localHistory.length > 0 && localHistory[0].text === text) return;
    localHistory.unshift({ text, time });
    if (localHistory.length > 8) localHistory.pop();
    localStorage.setItem('iqc_history', JSON.stringify(localHistory));
    updateHistoryUI();
}

function updateHistoryUI() {
    UI.renderHistory(localHistory, 
        (selectedItem) => {
            UI.messageInput.value = selectedItem.text;
            UI.timeInput.value = selectedItem.time;
            globalSelectedFile = null;
            UI.resetFilePicker();
            UI.btnGenerate.click();
        }, 
        (indexToDelete) => {
            localHistory.splice(indexToDelete, 1);
            localStorage.setItem('iqc_history', JSON.stringify(localHistory));
            updateHistoryUI();
        }
    );
}
