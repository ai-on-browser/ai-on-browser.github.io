import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.min.mjs'
import 'https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/2.1.0/encoding.min.js'

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.worker.min.mjs'

export default class DocumentLoader {
	/**
	 * Load text data
	 * @param {Blob} data Plain text or PDF data
	 * @returns {Promise<string>} Loaded string
	 */
	static load(data) {
		return new Promise(resolve => {
			const reader = new FileReader()
			reader.readAsArrayBuffer(data)
			reader.onload = () => {
				if (data.type === 'application/pdf') {
					pdfjs
						.getDocument({
							data: reader.result,
							cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/cmaps/',
							cMapPacked: true,
						})
						.promise.then(async pdf => {
							const pages = pdf.numPages
							let txt = ''
							for (let i = 1; i <= pages; i++) {
								const page = await pdf.getPage(i)
								const text = await page.getTextContent()
								txt += text.items.map(s => s.str).join('')
							}
							resolve(txt)
						})
				} else {
					const codes = new Uint8Array(reader.result)
					const encoding = Encoding.detect(codes)
					const txt = Encoding.convert(codes, {
						to: 'unicode',
						from: encoding,
						type: 'string',
					})
					resolve(txt)
				}
			}
		})
	}

	/**
	 * Split text
	 * @param {string} text text
	 * @returns {string[]} Splitted text
	 */
	static segment(text) {
		return text.split(/[ -@[-`{-~\s]+/)
	}

	/**
	 * Ordinalize texts
	 * @param {string[]} texts Texts
	 * @param {*} config Config
	 * @returns {[string[], number[]]} Containing text and ordinalized texts
	 */
	static ordinal(texts, { ignoreCase = true } = {}) {
		const words = []
		const ord = []
		for (const text of texts) {
			const o = words.indexOf(ignoreCase ? text.toLowerCase() : text)
			if (o < 0) {
				words.push(ignoreCase ? text.toLowerCase() : text)
				ord.push(words.length - 1)
			} else {
				ord.push(o)
			}
		}
		return [words, ord]
	}
}
