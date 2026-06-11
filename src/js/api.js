const API_URL = 'https://brat.siputzx.my.id/v2/iphone-quoted';

// Menggunakan CORS proxy alternatif jika direct request gagal
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchIqcImage(payload) {
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    };

    try {
        // Percobaan 1: Kirim request langsung ke server API utama
        let response = await fetch(API_URL, config);
        
        // Jika gagal karena masalah CORS atau Server, beralih ke Percobaan 2 lewat Proxy
        if (!response.ok) {
            console.warn("Direct request gagal, mencoba lewat CORS Proxy...");
            response = await fetch(CORS_PROXY + encodeURIComponent(API_URL), config);
        }

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        // Convert response binary ke Blob
        return await response.blob();
    } catch (error) {
        console.error("Gagal menembak API V2:", error);
        throw error;
    }
}
