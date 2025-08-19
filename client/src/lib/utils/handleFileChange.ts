export const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImageSrc: React.Dispatch<React.SetStateAction<string | null>>
) => {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(event.target.files[0]);
    }
};
