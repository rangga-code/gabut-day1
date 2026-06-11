let currentBlobUrl = '';

// Inisialisasi Event Listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // Klik tombol generate
    UI.btnGenerate.addEventListener('click', async () => {
        const messageText = UI.messageInput.value.trim();
        if (!messageText) {
            UI.messageInput.focus();
            return;
        }

        UI.showLoading();

        // Menyusun data payload JSON
        const payload = {
            sender: UI.senderInput.value.trim() || "other",
            message: messageText,
            imageUrl: UI.imageInput.value.trim() || "",
            timestamp: UI.timeInput.value.trim() || "12.00",
            time: UI.timeInput.value.trim() || "12.00",
            status: {
                carrierName: UI.carrierInput.value.trim() || "INDOSAT",
                batteryPercentage: parseInt(UI.batteryInput.value) || 100,
                signalStrength: 4,
                wifi: true
            },
            backgroundUrl: UI.bgInput.value.trim() || "",
            readStatus: true,
            emojiStyle: "apple"
        };

        try {
            const blobData = await fetchIqcImage(payload);
            
            // Bersihkan memori blob lama jika ada
            if (currentBlobUrl) window.URL.revokeObjectURL(currentBlobUrl);
            
            currentBlobUrl = window.URL.createObjectURL(blobData);
            UI.showSuccess(currentBlobUrl);
        } catch (err) {
            UI.showError("Koneksi API Gagal / Server Down");
        }
    });

    // Klik tombol download/save gambar
    UI.btnDownload.addEventListener('click', () => {
        if (!currentBlobUrl) return;
        const a = document.createElement('a');
        a.href = currentBlobUrl;
        a.download = `IQC_NEO_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Fitur Quick Tag untuk merubah isi form dengan cepat
    UI.tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('neo-tag')) {
            UI.messageInput.value = e.target.innerText;
        }
    });

    // Jalankan generate lewat tombol Enter
    UI.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') UI.btnGenerate.click();
    });
});
