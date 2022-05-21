import { BaseData } from './base.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'

export default class DocumentData extends BaseData {
	constructor(manager) {
		super(manager)
	}

	async readDocument(data) {
		return new Promise(resolve => {
			const reader = new FileReader()
			reader.readAsArrayBuffer(data)
			reader.onload = () => {
				if (data.type === 'application/pdf') {
					pdfjsLib
						.getDocument({
							data: reader.result,
							cMapUrl: '//mozilla.github.io/pdf.js/web/cmaps/',
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

	segment(text) {
		return text.split(/[ -@\[-`{-~\s]+/)
	}

	ordinal(texts, { ignoreCase = true } = {}) {
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
