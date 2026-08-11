import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globalSetup: ['./tests/gui/helper/server.js'],
		dir: 'tests/gui',
		globals: true,
		reporters: ['./tests/gui-coverage-reporter.js'],
		testTimeout: 200000,
		hookTimeout: 30000,
		maxWorkers: '100%',
		vmMemoryLimit: '100MB',
	},
})
