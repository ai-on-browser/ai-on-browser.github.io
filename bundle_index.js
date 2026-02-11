import fs from 'node:fs'
import { rollup } from 'rollup'
import ts from 'typescript'

const bundleLayers = await rollup({
	external: [/lib\/model\/nns\/layer\/base.js/, /lib\/model\/[^/]+.js/, /lib\/util/, /node_modules/],
	input: 'lib/model/nns/layer/index.js',
})
await bundleLayers.write({ format: 'esm', file: './lib/model/nns/layer/index.js' })
const layerDir = './lib/model/nns/layer'
const files = await fs.promises.readdir(layerDir)
for (const file of files) {
	if (file === 'base.js' || file === 'index.js') {
		continue
	}
	const text = (await fs.promises.readFile(`${layerDir}/${file}`)).toString()
	const source = ts.createSourceFile(`${layerDir}/${file}`, text, ts.ScriptTarget.Latest)
	let className = null
	source.forEachChild(node => {
		if (ts.isClassDeclaration(node) && !className) {
			className = node.name.escapedText
		}
	})
	await fs.promises.writeFile(
		`${layerDir}/${file}`,
		`import { ${className} } from './index.js'\nexport default ${className}`
	)
}

const bundleOptimizer = await rollup({
	external: [/lib\/util/, /node_modules/],
	input: 'lib/model/nns/optimizer.js',
})
await bundleOptimizer.write({ format: 'esm', file: './lib/model/nns/optimizer.js' })

const bundleONNXLayer = await rollup({
	external: [/lib\/model\/nns\/onnx\/[^/]+.js/, /lib\/util/, /node_modules/],
	input: 'lib/model/nns/onnx/layer/index.js',
})
await bundleONNXLayer.write({ format: 'esm', file: './lib/model/nns/onnx/layer/index.js' })

const bundleONNXOperator = await rollup({
	external: [/lib\/model\/nns\/onnx\/[^/]+.js/, /lib\/util/, /node_modules/],
	input: 'lib/model/nns/onnx/operators/index.js',
})
await bundleONNXOperator.write({ format: 'esm', file: './lib/model/nns/onnx/operators/index.js' })
