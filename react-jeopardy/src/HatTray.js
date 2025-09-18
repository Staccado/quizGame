import React, { useState } from 'react';
import hat from './hat.png';

const HatTray = ({ player, onHatSelect, onHatDragStart, placedHatName }) => {
  const [isHatsTrayOpen, setIsHatsTrayOpen] = useState(false);

  // Helper to resolve hat asset by name; falls back to default `hat.png`
  const getHatAsset = (hatName) => {
    try {
      // Try common locations; adjust if a dedicated folder exists
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`./hats/${hatName}.png`);
    } catch (e1) {
      try {
        // Fallback to root if hats are placed alongside other images
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require(`./${hatName}.png`);
      } catch (e2) {
        return hat;
      }
    }
  };

  const allHats = Array.from({ length: 10 }, (_, i) => `hat${i + 1}`);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        zIndex: 10000,
      }}
    >
      <div
        onClick={() => setIsHatsTrayOpen(!isHatsTrayOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setIsHatsTrayOpen(!isHatsTrayOpen); }}
        style={{
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '10px 12px',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: 600,
        }}
      >
        {isHatsTrayOpen ? 'Close Hats' : 'Hats'}
      </div>

      {isHatsTrayOpen && (
        <div
          style={{
            width: 220,
            maxHeight: '60vh',
            overflowY: 'auto',
            backgroundColor: '#111827',
            padding: 12,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            marginTop: 8,
          }}
        >
          <div style={{ color: 'white', marginBottom: 8, fontWeight: 700 }}>Select a Hat</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {allHats.map((hatName) => {
              const isUnlocked = !!(player && player.hatsUnlocked && player.hatsUnlocked.includes(hatName));
              const imgSrc = getHatAsset(hatName);
              return (
                <div key={hatName} style={{ textAlign: 'center' }}>
                  <img
                    src={imgSrc}
                    alt={hatName}
                    draggable={isUnlocked}
                    onDragStart={(e) => onHatDragStart(e, hatName, isUnlocked)}
                    onClick={() => {
                      if (!isUnlocked) return;
                      onHatSelect(hatName);
                    }}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: 'contain',
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      opacity: isUnlocked ? 1 : 0.5,
                      cursor: isUnlocked ? 'grab' : 'not-allowed',
                      border: placedHatName === hatName ? '2px solid #10b981' : '2px solid transparent',
                      borderRadius: 8,
                      backgroundColor: placedHatName === hatName ? 'rgba(16,185,129,0.1)' : 'transparent',
                    }}
                  />
                  <div style={{ color: '#e5e7eb', fontSize: 12, marginTop: 4 }}>{hatName}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HatTray;
