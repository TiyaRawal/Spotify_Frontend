const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function UploadImage(file) {

    console.log(import.meta.env.VITE_CLOUD_NAME);
    console.log(import.meta.env.VITE_UPLOAD_PRESET);

    let formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    let response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
    });

    let data = await response.json();
    console.log(data);

    return data.secure_url;
}