import Constants from 'expo-constants';

const { manifest } = Constants;
const { extra } = manifest;

export const API_KEY = extra?.apiKey; // Adjust according to how you structure your app
