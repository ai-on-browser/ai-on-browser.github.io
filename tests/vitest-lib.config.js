import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: 'tests/lib',
		globals: true,
		reporters: ['default', './tests/retry-test.js', './tests/slow-test.js'],
		maxWorkers: '100%',
		vmMemoryLimit: '100MB',
		coverage: {
			enabled: true,
			exclude: ['onnx/onnx_pb.js'],
		},
	},
})
