let currentGeneratedUrl = '';
let localHistory = JSON.parse(localStorage.getItem('iqc_history')) || [];
let globalSelectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi waktu sistem saat ini & muat data riwayat lokal
    UI.setSystemTime();
    updateHistoryUI();

    // SINKRONISASI TOMBOL UNTUK MEMBUKA BROWSER FILE / GALERI HP
    if (UI.filePickerBtn && UI.galleryFileInput) {
        UI.filePickerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.galleryFileInput.click();
        });
    }
    
    // PANTAU JIKA USER SELESAI MEMILIH GAMBAR DARI PERANGKAT
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

    // 1. ENGINE UTAMA - RUN GENERATOR CHAT
    UI.btnGenerate.addEventListener('click', async () => {
        const text = UI.messageInput.value.trim();
        const time = UI.timeInput.value.trim() || "12:00";

        if (!text) {
            UI.messageInput.focus();
            return;
        }

        UI.showLoading("MENGECEK KOMPONEN FILE...");
        let uploadedImageUrl = '';

        // PROSES UNGGAH OTOMATIS JIKA USER MEMILIH FOTO PROFIL/PESAN DARI GALERI
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
                    // Konversi URL tmpfiles menjadi link direct download (dl) agar bisa diakses API Alip
                    uploadedImageUrl = uploadJson.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                }
            } catch (error) {
                console.error("Gagal unggah biner gambar ke peladen cadangan:", error);
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
            
            // Simpan data lengkap termasuk tautan gambar agar riwayat bisa diakses saat offline/API down
            saveToHistory(text, time, targetApiUrl);
        };

        renderImage.onerror = function() {
            UI.showError();
        };
    });

    // 2. SISTEM UNDUH / DOWNLOAD GAMBAR KE PENYIMPANAN
    UI.btnDownload.addEventListener('click', async () => {
        if (!currentGeneratedUrl) return;
        const originalText = UI.btnDownload.innerHTML;
        UI.btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> DOWNLOAD...';

        try {
            const response = await fetch(currentGeneratedUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `IQC_RanggaCode_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch {
            window.open(currentGeneratedUrl, '_blank');
        } finally {
            UI.btnDownload.innerHTML = originalText;
        }
    });

    // 3. FITUR BAGIKAN PAKET LENGKAP (GAMBAR + TEKS AJAKAN + URL WEBSITE)
    UI.btnShare.addEventListener('click', async () => {
        if (!currentGeneratedUrl) return;
        
        const originalText = UI.btnShare.innerHTML;
        UI.btnShare.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PACKING...';

        try {
            // Mengunduh biner asli dari API agar bisa dikirim sebagai file nyata di WhatsApp
            const response = await fetch(currentGeneratedUrl);
            const blob = await response.blob();
            
            const fileToShare = new File([blob], `IQC_Chat_${Date.now()}.png`, { type: blob.type });
            const filesArray = [fileToShare];

            const shareText = `Halo! Lihat nih kuote chat iPhone buatan saya: "${UI.messageInput.value}". Yuk coba bikin versi kamu sendiri, gampang banget tinggal ketik!`;
            const shareUrl = window.location.origin; // Otomatis mendeteksi domain website tempat script berjalan

            const shareData = {
                files: filesArray,
                title: 'IQC PRO V2 - iPhone Quote Chat',
                text: shareText,
                url: shareUrl
            };

            // Memvalidasi dukungan sistem operasi perangkat (Android / iOS)
            if (navigator.canShare && navigator.canShare({ files: filesArray })) {
                await navigator.share(shareData);
            } else {
                throw new Error("Sistem perangkat tidak mendukung transfer kombinasi berkas biner.");
            }
        } catch (error) {
            console.warn("Mengalihkan ke sistem fallback (Salin tautan):", error);
            
            // Mekanisme cadangan aman jika browser/perangkat tidak mendukung Web Share API Level 2
            navigator.clipboard.writeText(currentGeneratedUrl);
            alert('Tautan gambar berhasil disalin! Perangkat Anda belum mendukung fitur kirim gambar langsung dari browser.');
        } finally {
            UI.btnShare.innerHTML = originalText;
        }
    });

    // 4. BAGIKAN TAUTAN PROMO WEBSITE UTAMA
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

    // 5. MENGHAPUS SEMUA LOG DATA RIWAYAT DI BROWSER
    UI.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Hapus seluruh riwayat pembuatan dari browser?')) {
            localHistory = [];
            localStorage.setItem('iqc_history', JSON.stringify(localHistory));
            updateHistoryUI();
        }
    });

    // REKOMENDASI TAG KATA CEPAT (QUICK TAGS)
    UI.tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('neo-tag')) UI.messageInput.value = e.target.innerText;
    });

    UI.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') UI.btnGenerate.click();
    });
});

// MENYIMPAN DATA DATA KE LOCALSTORAGE
function saveToHistory(text, time, savedUrl) {
    // Hindari penyimpanan berganda jika user menekan tombol generate berkali-kali untuk teks yang sama
    if (localHistory.length > 0 && localHistory[0].text === text) return;
    
    localHistory.unshift({ text, time, url: savedUrl });
    if (localHistory.length > 8) localHistory.pop(); // Batasi kapasitas log riwayat maksimal 8 baris data
    localStorage.setItem('iqc_history', JSON.stringify(localHistory));
    updateHistoryUI();
}

// MANAGEMENT RENDER DISPLAY DATA RIWAYAT (AMBIL INSTAN TANPA API RENDER ULANG)
function updateHistoryUI() {
    UI.renderHistory(localHistory, 
        (selectedItem) => {
            // Mengembalikan konfigurasi parameter lama ke kolom input formulir
            UI.messageInput.value = selectedItem.text;
            UI.timeInput.value = selectedItem.time;
            globalSelectedFile = null;
            UI.resetFilePicker();

            // Pengecekan krusial: Jika url gambar tersedia, langsung tampilkan tanpa hit API lagi (Aman dari API Down!)
            if (selectedItem.url) {
                currentGeneratedUrl = selectedItem.url;
                UI.showSuccess(selectedItem.url);
            } else {
                // Skema perlindungan fallback untuk riwayat versi lama sebelum pembaruan script
                UI.btnGenerate.click(); 
            }
        }, 
        (indexToDelete) => {
            localHistory.splice(indexToDelete, 1);
            localStorage.setItem('iqc_history', JSON.stringify(localHistory));
            updateHistoryUI();
        }
    );
}
