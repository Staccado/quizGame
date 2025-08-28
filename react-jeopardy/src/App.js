import React, { useState, useEffect, useContext, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from './cropImage'; // I will create this helper function in a separate file
import { JeopardyPodium } from './podium';
import socket from './socket';
import { SocketContext } from './SocketContext';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PlayerView from './PlayerView';
import AdminView from './AdminView';
import DrawingBoard from './drawing';
import AudioManager from './audiomanager';
import './App.css';

const HomePage = () => {
  const socket = useContext(SocketContext);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || 'Your Name');

  // Add useEffect to emit playerName when it changes
  useEffect(() => {
    if (socket && playerName.trim()) {
      socket.emit('setDisplayName', playerName);
    }
  }, [playerName, socket]); // Depend on playerName and socket

  const onCropComplete = useCallback(async (c) => {
    setCroppedAreaPixels(c);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        c
      );
      setPreviewUrl(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc]);


  function readFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  }

  const handleConfirm = () => {
    if (!previewUrl) return;
    fetch(previewUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          const data = base64data.split(',')[1];
          socket.emit('uploadImage', { name: 'croppedImage.jpeg', data });
          setIsSaved(true);
        };
        reader.readAsDataURL(blob);
      });
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };


  useEffect(() => {
    const handleImageUploaded = (data) => {
      const playerName = localStorage.getItem('playerName') || 'Player';
      localStorage.setItem(`playerImage_${playerName}`, data.imageUrl);
    };

    socket.on('imageUploaded', handleImageUploaded);

    return () => {
      socket.off('imageUploaded', handleImageUploaded);
    };
  }, [socket]);

  return (
    <div className='home-nav'>
      <h1>Welcome to Jeopardy!</h1>
      <div>
        <label htmlFor="playerNameInput">Your Display Name:</label>
        <input id="playerNameInput" type="text" value={playerName} onChange={(e) => {setPlayerName(e.target.value); localStorage.setItem('playerName', e.target.value);}} placeholder="Enter Your Name" />
      </div>
      <div>
        <label htmlFor="playerImageInput">Choose Profile Image:</label>
        <input id="playerImageInput" type="file" onChange={onFileChange} accept="image/*" />
      </div>
      {imageSrc && (
        <div>
          <ReactCrop // for the preview window
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={onCropComplete}
            aspect={4 / 3}
          >
            <img src={imageSrc} />
          </ReactCrop>
        </div>
      )}
      {previewUrl &&
        <div className="podium-preview-container">
          <h3>Podium Preview:</h3>
          <JeopardyPodium 
            playerImage={previewUrl} 
            name={playerName}
            score={12345}
          />
          <button onClick={handleConfirm}>Confirm</button>
          {isSaved && <p>Saved!</p>}
        </div>
      }
      <br />
      <Link to="/player">Go to Player View</Link>
      <br />
      <Link to="/admin">Go to Admin View</Link>
      <Link to="/drawing">Go to Drawing</Link>
    </div>
  );
};

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
          <Route path="/drawing" element={<DrawingBoard/>}/>
        </Routes>
      </BrowserRouter>
      <AudioManager />
    </SocketContext.Provider>
  );
}

export default App;
