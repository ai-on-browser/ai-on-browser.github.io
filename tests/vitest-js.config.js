import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^https:\/\/cdn\.jsdelivr\.net\/npm\/pdfjs-dist@[0-9.]+\/build\/pdf\.min\.mjs$/,
				replacement: path.resolve(__dirname, 'js/__mock__/pdf.min.js'),
			},
			{
				find: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/encoding-japanese\/[0-9.]+\/encoding\.min\.js$/,
				replacement: path.resolve(__dirname, 'js/__mock__/encoding.min.js'),
			},
		],
	},
	test: {
		dir: 'tests/js',
		globals: true,
		reporters: ['default', './tests/retry-test.js', './tests/slow-test.js'],
		coverage: {
			enabled: true,
			reportsDirectory: './coverage-js',
			exclude: ['**/node_modules/**', '**/onnx/onnx_pb.js'],
		},
		maxWorkers: '100%',
		vmMemoryLimit: '100MB',
	},
})
