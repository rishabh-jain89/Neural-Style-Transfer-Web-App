import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ImageUploader from './components/ImageUploader';
import PresetGallery from './components/PresetGallery';

const API_URL = "http://localhost:8000";

function App() {
    const [contentImage, setContentImage] = useState(null);
    const [styleImage, setStyleImage] = useState(null);
    const [outputImage, setOutputImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resolution, setResolution] = useState(512);
    const [styleIntensity, setStyleIntensity] = useState(50);
    const [contentPreview, setContentPreview] = useState(null);
    const [stylePreview, setStylePreview] = useState(null);
    const [selectedPresetUrl, setSelectedPresetUrl] = useState(null);

    const pollingIntervalRef = useRef(null);

    useEffect(() => {
        return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
    }, []);

    const handleContentSelect = (file) => {
        if (file) {
            setContentImage(file);
            setContentPreview(URL.createObjectURL(file));
        }
    };

    const handleStyleSelect = (file) => {
        if (file) {
            setStyleImage(file);
            setStylePreview(URL.createObjectURL(file));
            setSelectedPresetUrl(null);
        }
    };

    const handlePresetSelect = async (url) => {
        setStatusMessage('Downloading preset style...');
        try {
            const response = await axios.get(url, { responseType: 'blob' });
            const filename = url.split('/').pop();
            const file = new File([response.data], filename, { type: response.headers['content-type'] });
            setStyleImage(file);
            setStylePreview(URL.createObjectURL(file));
            setSelectedPresetUrl(url);
            setStatusMessage('');
        } catch (error) {
            console.error("Failed to download preset", error);
            setStatusMessage('Error: Could not download preset style.');
        }
    };

    const handleStylize = async () => {
        if (!contentImage || !styleImage) {
            alert("Please upload or select both a Content and a Style image.");
            return;
        }
        setIsLoading(true);
        setStatusMessage('1/4: Preparing assets...');
        setOutputImage(null);

        const formData = new FormData();
        formData.append("content_image", contentImage);
        formData.append("style_image", styleImage);
        formData.append("resolution", resolution);

        const minLog = Math.log(1e4);
        const maxLog = Math.log(1e7);
        const scale = (maxLog - minLog) / 99;
        const styleWeight = Math.round(Math.exp(minLog + scale * (styleIntensity - 1)));
        formData.append("style_weight", styleWeight);

        try {
            setStatusMessage('2/4: Uploading images...');
            const response = await axios.post(`${API_URL}/stylize/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const { task_id } = response.data;
            setStatusMessage('3/4: Processing on server... This may take a minute.');
            pollStatus(task_id);
        } catch (error) {
            console.error("Error starting stylization:", error);
            setStatusMessage('Error: Could not start the process. Check API connection.');
            setIsLoading(false);
        }
    };

    const pollStatus = (taskId) => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/status/${taskId}`);
                const task = response.data;
                if (task.status === 'complete') {
                    setOutputImage(`${API_URL}${task.url}`);
                    setStatusMessage('4/4: Done! ✨');
                    setIsLoading(false);
                    clearInterval(pollingIntervalRef.current);
                } else if (task.status === 'failed') {
                    setStatusMessage('Task failed on the server. Please try again.');
                    setIsLoading(false);
                    clearInterval(pollingIntervalRef.current);
                }
            } catch (error) {
                console.error("Error polling status:", error);
                setStatusMessage('Error checking status. Stopping updates.');
                setIsLoading(false);
                clearInterval(pollingIntervalRef.current);
            }
        }, 3000);
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get(outputImage, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'stylized_image.jpg');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Could not download the image.", error);
            alert("Failed to download the image.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Neural Image Styling</h1>
                    <p className="text-gray-500 mt-2">Combine the content of one image with the style of another.</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center mb-6">
                    <ImageUploader title="Content Image" onImageSelect={handleContentSelect} imagePreview={contentPreview} />
                    <ImageUploader title="Style Image (Upload)" onImageSelect={handleStyleSelect} imagePreview={stylePreview} />
                </div>

                <PresetGallery onSelect={handlePresetSelect} selectedUrl={selectedPresetUrl} />

                <div className="w-full max-w-md mx-auto mb-6">
                    <label htmlFor="intensity" className="font-semibold text-gray-700 mb-2 block text-center">Style Intensity</label>
                    <input id="intensity" type="range" min="1" max="100" value={styleIntensity} onChange={(e) => setStyleIntensity(e.target.value)} disabled={isLoading} />
                </div>

                <div className="flex justify-center items-center mb-6 space-x-3">
                    <label htmlFor="resolution" className="font-semibold text-gray-700">Output Resolution:</label>
                    <select id="resolution" value={resolution} onChange={(e) => setResolution(parseInt(e.target.value, 10))} disabled={isLoading} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm">
                        <option value="128">Very Low (128px)</option>
                        <option value="256">Low (256px)</option>
                        <option value="512">Medium (512px)</option>
                        <option value="1024">High (1024px)</option>
                    </select>
                </div>

                <div className="text-center mb-6">
                    <button onClick={handleStylize} disabled={isLoading || !contentImage || !styleImage} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all">
                        {isLoading ? 'Stylizing...' : 'Stylize'}
                    </button>
                </div>

                {(isLoading || statusMessage) && (
                    <div className="flex flex-col items-center justify-center p-4">
                        {isLoading && <div className="spinner"></div>}
                        <p className="mt-4 text-gray-600 font-medium">{statusMessage}</p>
                    </div>
                )}

                {outputImage && !isLoading && (
                    <div className="text-center p-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Result</h2>
                        <img src={outputImage} alt="Stylized result" className="max-w-full md:max-w-lg mx-auto rounded-lg shadow-xl cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsModalOpen(true)} />
                        <button onClick={handleDownload} className="inline-block mt-6 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all">
                            Download Image
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={() => setIsModalOpen(false)}>
                    <img src={outputImage} alt="Stylized result enlarged" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                    <button className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300" onClick={() => setIsModalOpen(false)}>&times;</button>
                </div>
            )}
        </div>
    );
}

export default App;