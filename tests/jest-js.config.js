export default {
	testMatch: ['**/js/**/?(*.)+(spec|test).[jt]s?(x)'],
	reporters: ['default', '<rootDir>/retry-test.js', '<rootDir>/slow-test.js'],
	moduleNameMapper: {
		'^https://cdn\\.jsdelivr\\.net/npm/pdfjs-dist@[0-9.]+/build/pdf\\.min\\.mjs$':
			'<rootDir>/js/__mock__/pdf.min.js',
		'^https://cdnjs\\.cloudflare\\.com/ajax/libs/encoding-japanese/[0-9.]+/encoding\\.min\\.js$':
			'<rootDir>/js/__mock__/encoding.min.js',
	},
	collectCoverage: true,
	coverageDirectory: '../coverage-js',
	coveragePathIgnorePatterns: ['/node_modules/', 'onnx/onnx_pb.js'],
	maxWorkers: '100%',
	workerIdleMemoryLimit: '100MB',
}
