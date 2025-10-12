import fs from 'fs/promises'
import path from 'path'
import { XMLParser } from 'fast-xml-parser'

const basePath = import.meta.dirname

const fetchProgress = async (input, init) => {
	const response = await fetch(input, init)
	let loaded = 0
	let total = response.headers.get('content-length')
	let prevPrintTime = 0
	const units = ['B', 'KiB', 'MiB', 'GiB']

	return new Response(
		new ReadableStream({
			pull: async controller => {
				for await (const chunk of response.body) {
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
				}
				controller.close()
			},
		})
	)
}

const getCatalogue = async () => {
	console.log('Fetching catalogue...')
	let res = null
	let waitTime = 0.5
	for (let i = 0; i < 100; i++) {
		try {
			res = await fetchProgress('https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc/xml')
			break
		} catch (error) {
			await new Promise(resolve => setTimeout(resolve, waitTime))
			waitTime = Math.min(waitTime * 2, 60)
		}
	}
	if (!res) {
		throw new Error('Failed to fetch catalogue')
	}
	const catalogues = await res.text()
	const parser = new XMLParser({
		ignoreAttributes: false,
	})
	const doc = parser.parse(catalogues, 'application/xml')
	const themes = doc['nt:tree']['nt:branch'][0]

	const root = {}
	const getLeafs = (node, depth, obj) => {
		obj.title = node['nt:title'][0]['#text']
		obj.children = []
		const branch = node['nt:children']['nt:branch']
		if (branch) {
			if (Array.isArray(branch)) {
				for (const b of branch) {
					const c = {}
					obj.children.push(c)
					getLeafs(b, depth + 1, c)
				}
			} else {
				const c = {}
				obj.children.push(c)
				getLeafs(branch, depth + 1, c)
			}
		} else {
			const leafs = node['nt:children']['nt:leaf']
			if (Array.isArray(leafs)) {
				for (const leaf of leafs) {
					obj.children.push({
						title: leaf['nt:title'][0]['#text'],
						code: leaf['nt:code'],
					})
				}
			} else {
				obj.children.push({
					title: leafs['nt:title'][0]['#text'],
					code: leafs['nt:code'],
				})
			}
		}
	}

	getLeafs(themes, 0, root)

	const readableStream = new Blob([JSON.stringify(root)]).stream()
	const compressedStream = readableStream.pipeThrough(new CompressionStream('gzip'))
	const arrayBuffer = await new Response(compressedStream).arrayBuffer()
	fs.writeFile(path.join(basePath, 'catalogue.json.gz'), Buffer.from(arrayBuffer))
}

const getMetabase = async () => {
	console.log('Fetching metabase...')
	let res = null
	let waitTime = 0.5
	for (let i = 0; i < 100; i++) {
		try {
			res = await fetchProgress('https://ec.europa.eu/eurostat/api/dissemination/catalogue/metabase.txt.gz')
			break
		} catch (error) {
			await new Promise(resolve => setTimeout(resolve, waitTime))
			waitTime = Math.min(waitTime * 2, 60)
		}
	}
	if (!res) {
		throw new Error('Failed to fetch metadata')
	}
	const decompressedStream = res.body.pipeThrough(new DecompressionStream('gzip'))
	const text = await new Response(decompressedStream).text()

	const data = {}
	for (const line of text.split('\n')) {
		if (line.trim() === '') {
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
