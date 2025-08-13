import { useRef } from 'react';

function ImageUploader({ title, onImageSelect, imagePreview }) {
    const fileInputRef = useRef(null);
    const handleBoxClick = () => { fileInputRef.current.click(); };

    return (
        <div className="w-full md:w-1/2 p-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">{title}</h3>
            <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all" onClick={handleBoxClick}>
                {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" /> : <span>Click to upload</span>}
            </div>
            <input type="file" accept="image/png, image/jpeg" className="hidden" ref={fileInputRef} onChange={(e) => onImageSelect(e.target.files[0])} />
        </div>
    );
}

export default ImageUploader;