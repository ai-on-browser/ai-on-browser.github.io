import fs from 'fs/promises'
import path from 'path'
import { XMLParser } from 'fast-xml-parser'

const basePath = import.meta.dirname

const fetchProgress = async (input, init) => {
	let waitTime = 0.01
	const units = ['B', 'KiB', 'MiB', 'GiB']
	for (let i = 0; i < 100; i++) {
		try {
			const response = await fetch(input, init)
			const total = response.headers.get('content-length')
			let loaded = 0
			let prevPrintTime = 0

			const progressdStream = new TransformStream({
				transform(chunk, controller) {
					controller.enqueue(chunk)
					loaded += chunk.byteLength
					const now = Date.now()
					if (now - prevPrintTime > 1000) {
						prevPrintTime = now
						if (total) {
							console.info(loaded + ' / ' + total + ' bytes')
						} else {
							let uidx = 0
							let val = loaded
							while (val > 1000 && uidx + 1 < units.length) {
								val /= 1024
								uidx++
							}
							console.info(Math.floor(val * 100) / 100 + ' ' + units[uidx])
						}
					}
				},
			})

			return new Response(response.body.pipeThrough(progressdStream))
		} catch {
			await new Promise(resolve => setTimeout(resolve, waitTime * 1000))
			waitTime = Math.min(waitTime * 2, 5)
		}
	}
	return null
}

const getCatalogue = async () => {
	console.log('Fetching catalogue...')
	const res = await fetchProgress('https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc/xml')
	if (!res) {
		throw new Error('Failed to fetch catalogue')
	}
	const catalogues = await res.text()
	const parser = new XMLParser({ ignoreAttributes: false })
	const doc = parser.parse(catalogues, 'application/xml')
	const themes = doc['nt:tree']['nt:branch'][0]

	const getLeafs = node => {
		const obj = {
			title: node['nt:title'][0]['#text'],
			children: [],
		}
		const branch = node['nt:children']['nt:branch']
		if (branch) {
			for (const b of Array.isArray(branch) ? branch : [branch]) {
				obj.children.push(getLeafs(b))
			}
		} else {
			const leafs = node['nt:children']['nt:leaf']
			for (const leaf of Array.isArray(leafs) ? leafs : [leafs]) {
				obj.children.push({
					title: leaf['nt:title'][0]['#text'],
					code: leaf['nt:code'],
				})
			}
		}
		return obj
	}

	const root = getLeafs(themes)

	const readableStream = new Blob([JSON.stringify(root)]).stream()
	const compressedStream = readableStream.pipeThrough(new CompressionStream('gzip'))
	const arrayBuffer = await new Response(compressedStream).arrayBuffer()
	fs.writeFile(path.join(basePath, 'catalogue.json.gz'), Buffer.from(arrayBuffer))
}

const getMetabase = async () => {
	console.log('Fetching metabase...')
	let res = await fetchProgress('https://ec.europa.eu/eurostat/api/dissemination/catalogue/metabase.txt.gz')
	if (!res) {
		throw new Error('Failed to fetch metadata')
	}
	const decompressedStream = res.body.pipeThrough(new DecompressionStream('gzip'))
	const text = await new Response(decompressedStream).text()

	const data = {}
	for (const line of text.split('\n')) {
		if (line.trim().length === 0) {
			continue
		}
		const [id, unit, value] = line.split('\t')
		if (!data[id]) {
			data[id] = {}
		}
		if (!data[id][unit]) {
			data[id][unit] = []
		}
		data[id][unit].push(value)
	}

	const readableStream = new Blob([JSON.stringify(data)]).stream()
	const compressedStream = readableStream.pipeThrough(new CompressionStream('gzip'))
	const arrayBuffer = await new Response(compressedStream).arrayBuffer()
	fs.writeFile(path.join(basePath, 'metabase.json.gz'), Buffer.from(arrayBuffer))
}

await getMetabase()
await getCatalogue()
