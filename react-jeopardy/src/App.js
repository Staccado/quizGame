import React, { useState, useEffect, useContext, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from './cropImage'; // You have this helper function
import { JeopardyPodium } from './podium';
import socket from './socket';
import { SocketContext } from './SocketContext';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PlayerView from './PlayerView';
import AdminView from './AdminView';
import DrawingBoard from './drawing';
import AudioManager from './audiomanager';

// Import the new CSS file
import './HomePage.css';
import './App.css'; // Keep your original App.css as well

// This is a new component to handle the image cropping UI in a modal
const ImageCropModal = ({ imageSrc, onConfirm, onCancel }) => {
    const [crop, setCrop] = useState();
    const [croppedImageUrl, setCroppedImageUrl] = useState('');
    const [imageDisplayDimensions, setImageDisplayDimensions] = useState(null);

    const onCropComplete = useCallback(async (croppedAreaPixels) => {
        if (imageSrc && croppedAreaPixels.width && croppedAreaPixels.height && imageDisplayDimensions) {
            try {
                const url = await getCroppedImg(imageSrc, croppedAreaPixels, imageDisplayDimensions);
                setCroppedImageUrl(url);
            } catch (e) {
                console.error('Error in onCropComplete:', e);
            }
        }
    }, [imageSrc, imageDisplayDimensions]);

    const handleConfirmClick = () => {
        onConfirm(croppedImageUrl);
    };

    return (
        <div className="crop-modal-overlay">
            <div className="crop-modal-content">
                <h3>Crop Your Profile Picture</h3>
                <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={onCropComplete}
                    aspect={4/3} // Match podium aspect ratio
                    minWidth={50}
                    minHeight={37.5}
                    keepSelection
                >
                    <img 
                        src={imageSrc} 
                        alt="Crop preview" 
                        style={{ maxHeight: '70vh', maxWidth: '90vw' }} 
                        onLoad={(e) => {
                            // Set initial crop to center of image with 4:3 aspect ratio
                            const img = e.target;
                            
                            
                            // Store the display dimensions for use in cropping
                            setImageDisplayDimensions({
                                width: img.width,
                                height: img.height,
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight
                            });
                            
                            // Calculate crop area that maintains 4:3 aspect ratio
                            const imgAspect = img.width / img.height;
                            const targetAspect = 4/3;
                            
                            let cropWidth, cropHeight;
                            
                            if (imgAspect > targetAspect) {
                                // Image is wider than target, crop width
                                cropHeight = img.height * 0.8;
                                cropWidth = cropHeight * targetAspect;
                            } else {
                                // Image is taller than target, crop height
                                cropWidth = img.width * 0.8;
                                cropHeight = cropWidth / targetAspect;
                            }
                            
                            const cropX = (img.width - cropWidth) / 2;
                            const cropY = (img.height - cropHeight) / 2;
                            
                            const initialCrop = {
                                unit: 'px',
                                x: cropX,
                                y: cropY,
                                width: cropWidth,
                                height: cropHeight
                            };
                            
                            setCrop(initialCrop);
                        }}
                    />
                </ReactCrop>
                <button onClick={handleConfirmClick} disabled={!croppedImageUrl}>
                    Confirm Image
                </button>
                <button onClick={onCancel} style={{ marginLeft: '10px', backgroundColor: '#6b7280' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};


const HomePage = () => {
    const socket = useContext(SocketContext);
    // State for the original image selected by the user
    const [sourceImage, setSourceImage] = useState(null);
    // State to hold the final, cropped image URL
    const [finalImage, setFinalImage] = useState(localStorage.getItem('playerImage') || null);
    const [isSaved, setIsSaved] = useState(!!localStorage.getItem('playerImage'));
    const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
    const [gameState, setGameState] = useState(null);
    const [playerRegistered, setPlayerRegistered] = useState(false);

    // When playerName changes, save to localStorage
    useEffect(() => {
        if (playerName.trim()) {
            localStorage.setItem('playerName', playerName);
        }
    }, [playerName]);

    // Register player with server when they have either name or image, then update when both are available
    useEffect(() => {
        if (socket.connected && finalImage) {
            // Only register immediately for image changes, not name changes
            const playerImage = localStorage.getItem('playerImage');
            const playerData = {
                name: playerName.trim() || 'Anonymous Player',
                image: playerImage || "react.png",
                webcam: false
            };

            console.log('Registering/updating player with server (image change):', playerData);
            socket.emit('playerData', playerData);
            
            // Only set registered to true when we have both name and image
            if (playerName.trim() && finalImage) {
                setPlayerRegistered(true);
            }
        }
    }, [finalImage, socket.connected]);

    // Debounced player name registration to prevent sending partial names
    useEffect(() => {
        if (!socket.connected) return;

        const timeoutId = setTimeout(() => {
            // Only send the final name after user stops typing for 500ms
            const playerImage = localStorage.getItem('playerImage');
            const playerData = {
                name: playerName.trim() || 'Anonymous Player',
                image: playerImage || "react.png",
                webcam: false
            };

            console.log('Debounced player name registration:', playerData);
            socket.emit('playerData', playerData);
            
            // Only set registered to true when we have both name and image
            if (playerName.trim() && finalImage) {
                setPlayerRegistered(true);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [playerName, socket.connected, finalImage]);

    // Listen for game state updates
    useEffect(() => {
        if (!socket) return;

        const handleGameTick = (newGameState) => {
            setGameState(newGameState);
        };

        socket.on('gameTick', handleGameTick);

        return () => {
            socket.off('gameTick', handleGameTick);
        };
    }, [socket]);

    // Function to read the file from input
    function readFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    }

    // Handles when a user selects a file
    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Resize large images to prevent cropping issues
            let imageDataUrl = await readFile(file);
            
            // If image is too large, resize it first
            const img = new Image();
            img.src = imageDataUrl;
            await new Promise(resolve => { img.onload = resolve; });
            
            const maxDimension = 1200; // Maximum width or height
            if (img.naturalWidth > maxDimension || img.naturalHeight > maxDimension) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions maintaining aspect ratio
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                let newWidth, newHeight;
                
                if (img.naturalWidth > img.naturalHeight) {
                    newWidth = maxDimension;
                    newHeight = maxDimension / aspectRatio;
                } else {
                    newHeight = maxDimension;
                    newWidth = maxDimension * aspectRatio;
                }
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // Convert back to data URL
                imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            }
            
            setSourceImage(imageDataUrl); // Open the cropping modal
        }
    };

    // This function is called from the modal after the user confirms the crop
    const handleCropConfirm = (croppedImageUrl) => {
        if (!croppedImageUrl) return;

        setFinalImage(croppedImageUrl); // Set the final image for display
        setSourceImage(null); // Close the modal

        // Convert the cropped image URL to blob/base64 and emit to the server
        fetch(croppedImageUrl)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    localStorage.setItem('playerImage', base64data); // Save to local storage
                    const data = base64data.split(',')[1];
                    socket.emit('uploadImage', { name: 'croppedImage.jpeg', data });
                    setIsSaved(true);
                    
                    // Always register player with updated image (even if no name yet)
                    if (socket.connected) {
                        const playerData = {
                            name: playerName.trim() || 'Anonymous Player',
                            image: base64data,
                            webcam: false
                        };
                        console.log('Re-registering player with updated image:', playerData);
                        socket.emit('playerData', playerData);
                    }
                };
                reader.readAsDataURL(blob);
            });
    };

    return (
        <div className='landing-page-container'>
            {/* If a source image is selected, show the crop modal */}
            {sourceImage && (
                <ImageCropModal
                    imageSrc={sourceImage}
                    onConfirm={handleCropConfirm}
                    onCancel={() => setSourceImage(null)}
                />
            )}

            <div className="title-container">
                <h1>Jep or dee ?</h1>
                <h2></h2>
            </div>

            <div className="login-card">
                <div className="input-group">
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter Your Name"
                        aria-label="Enter Your Name"
                    />
                </div>
                <div className="input-group">
                    {/* This is the styled label that the user clicks */}
                    <label htmlFor="playerImageInput" className="upload-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span>{finalImage ? 'Change Picture' : 'Upload Profile Picture'}</span>
                    </label>
                    {/* The actual file input is hidden */}
                    <input
                        id="playerImageInput"
                        type="file"
                        onChange={onFileChange}
                        accept="image/*"
                    />
                </div>
            </div>


            {finalImage && (
                <div className="podium-preview-container">
                    <JeopardyPodium 
                        playerImage={finalImage} 
                        name={playerName || 'Player'} /* Pass the current player name */
                        score={0} /* Score can be a placeholder like 0 */
                    />
                </div>
            )}

            {/* Show the "Start Game" button if both name and image are set */}
            {isSaved && playerName.trim() && (
                <Link to="/player" className="start-game-link">Start Game</Link>
            )}

        </div>
    );
};

// Your App component remains the same
function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player" element={<PlayerView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/drawing" element={<DrawingBoard />} />
        </Routes>
      </BrowserRouter>
      <AudioManager />
    </SocketContext.Provider>
  );
}

export default App;