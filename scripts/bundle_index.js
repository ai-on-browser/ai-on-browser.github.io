import fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rolldown } from 'rolldown'
import ts from 'typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const libDirPath = path.join(__dirname, '../lib')

const bundleLayers = await rolldown({
	external: [/lib\/model\/nns\/layer\/base.js/, /lib\/model\/[^/]+.js/, /lib\/util/, /node_modules/],
	input: `${libDirPath}/model/nns/layer/index.js`,
})
await bundleLayers.write({ format: 'esm', file: `${libDirPath}/model/nns/layer/index.js` })
const layerDir = `${libDirPath}/model/nns/layer`
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

const bundleOptimizer = await rolldown({
	external: [/lib\/util/, /node_modules/],
	input: `${libDirPath}/model/nns/optimizer.js`,
})
await bundleOptimizer.write({ format: 'esm', file: `${libDirPath}/model/nns/optimizer.js` })

const bundleONNXLayer = await rolldown({
	external: [/lib\/model\/nns\/onnx\/[^/]+.js/, /lib\/util/, /node_modules/],
	input: `${libDirPath}/model/nns/onnx/layer/index.js`,
})
await bundleONNXLayer.write({ format: 'esm', file: `${libDirPath}/model/nns/onnx/layer/index.js` })

const bundleONNXOperator = await rolldown({
	external: [/lib\/model\/nns\/onnx\/[^/]+.js/, /lib\/util/, /node_modules/],
	input: `${libDirPath}/model/nns/onnx/operators/index.js`,
})
await bundleONNXOperator.write({ format: 'esm', file: `${libDirPath}/model/nns/onnx/operators/index.js` })
