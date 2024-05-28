import { Audio } from 'expo-av';

export const startRecording = async (setRecording) => {
  console.log('Starting recording..');
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to record audio not granted');
      return;
    }
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    setRecording(recording);
  } catch (error) {
    console.error('Failed to start recording', error);
  }
};

export const stopRecording = async (recording, setRecording, setBase64Audio) => {
  console.log('Stopping recording..');
  setRecording(undefined);
  await recording.stopAndUnloadAsync();
  const uri1 = recording.getURI(); // Get the URI of the recorded audio
  console.log('Recording stopped and stored at', uri1);

  // Convert the recorded audio file to base64
  try {
    const response = await fetch(uri1);
    const audioBlob = await response.blob();
    const reader = new FileReader();
    await new Promise((resolve, reject) => {
      reader.onload = () => resolve();
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
    const base64Audio = reader.result.split(',')[1];
    setBase64Audio(base64Audio);
  } catch (error) {
    console.error('Error converting audio to base64:', error);
  }
};
