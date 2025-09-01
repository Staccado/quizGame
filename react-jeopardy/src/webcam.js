import {
  createLocalVideoTrack,
} from 'livekit-client';

export async function startWebcam(room) {
  const localTrack = await createLocalVideoTrack();
  await room.localParticipant.publishTrack(localTrack);
  return localTrack;
}

export async function stopWebcam(room) {
  if (room) {
    room.disconnect();
  }
}