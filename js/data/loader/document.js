import 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
import 'https://cdnjs.cloudflare.com/ajax/libs/encoding-japanese/2.0.0/encoding.min.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

export default class DocumentLoader {
	static load(data) {
		return new Promise(resolve => {
			const reader = new FileReader()
			reader.readAsArrayBuffer(data)
			reader.onload = () => {
				if (data.type === 'application/pdf') {
					pdfjsLib
						.getDocument({
							data: reader.result,
							cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
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

	static segment(text) {
		return text.split(/[ -@\[-`{-~\s]+/)
	}

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
