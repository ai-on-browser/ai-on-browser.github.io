import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDirPath = path.join(__dirname, '../../../')

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
}

const handlers = {
	/**
	 * @returns {Promise<http.Server>}
	 */
	start: async (option = {}) => {
		const port = option.port ?? 3000

		const server = http.createServer((req, res) => {
			// クエリ文字列が付いている場合の対策も兼ねて URL を解析
			const urlPath = new URL(req.url, 'http://localhost').pathname
			const filePath = path.join(rootDirPath, urlPath === '/' ? 'index.html' : urlPath)

			fs.readFile(filePath, (err, data) => {
				if (err) {
					res.writeHead(404, { 'Content-Type': 'text/plain' })
					res.end('Not Found')
					return
				}
				const ext = path.extname(filePath).toLowerCase()
				const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'
				res.writeHead(200, { 'Content-Type': contentType })
				res.end(data)
			})
		})

		return new Promise(resolve => {
			server.listen(port, () => {
				console.log(`Server running at http://localhost:${port}/`)
				resolve(server)
			})
		})
	},
}

export default async function setup() {
	const server = await handlers.start()

	return async () => {
		await server.close()
		console.log(`Server stopped`)
	}
}
