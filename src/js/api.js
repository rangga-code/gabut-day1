const CONFIG_API = {
    endpoint: "https://ranggacodeapi.vercel.app/api/maker/iqc",
    apikey: "RANGGACODE-API" 
};

function buildAlipIqcUrl(text, time, imageUrl) {
    let url = `${CONFIG_API.endpoint}?apikey=${encodeURIComponent(CONFIG_API.apikey)}`;
    url += `&text=${encodeURIComponent(text)}`;
    url += `&time=${encodeURIComponent(time)}`;
    if (imageUrl) url += `&imageUrl=${encodeURIComponent(imageUrl)}`;
    return url;
}
