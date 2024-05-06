export default class AudioLoader {
	/**
	 * Load audio data
	 * @param {Blob} data Audio data
	 * @returns {Promise<AudioBuffer>} Loaded AudioBuffer
	 */
	static load(data) {
		return new Promise(resolve => {
			const reader = new FileReader()
			reader.readAsArrayBuffer(data)
			reader.onload = () => {
				const audioCtx = new AudioContext()
				audioCtx.decodeAudioData(reader.result).then(resolve)
			}
		})
	}
}
