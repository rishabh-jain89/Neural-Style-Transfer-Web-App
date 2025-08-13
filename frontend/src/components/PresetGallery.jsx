const presetStyles = [
    { name: 'Starry Night', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
    { name: 'The Scream', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/589px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg' },
    { name: 'The Great Wave', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/800px-Tsunami_by_hokusai_19th_century.jpg' },
    { name: 'Composition VII', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/613px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg' },
];

function PresetGallery({ onSelect, selectedUrl }) {
    return (
        <div className="w-full mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Or Select a Preset Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {presetStyles.map(style => (
                    <div key={style.name} onClick={() => onSelect(style.url)} className="cursor-pointer group">
                        <img
                            src={style.url}
                            alt={style.name}
                            className={`w-full h-32 object-cover rounded-lg shadow-md transition-all duration-200 ${selectedUrl === style.url ? 'ring-4 ring-blue-500' : 'ring-2 ring-transparent group-hover:ring-blue-400'}`}
                        />
                        <p className="text-center text-sm mt-2 font-medium text-gray-600">{style.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PresetGallery;