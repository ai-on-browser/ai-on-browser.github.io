import fs from 'fs'

let code = `import { Tree, Tensor, Matrix } from './util/math.js'
import EnsembleBinaryModel from './util/ensemble.js'

`

const createImportStatement = async name => {
	const mod = await import(`./lib/${name}`)
	let d = null
	const named = []
	for (const name of Object.keys(mod)) {
		if (name === 'default') {
			d = mod.default
		} else {
			named.push(name)
		}
	}
	if (d) {
		if (named.length === 0) {
			code += `import ${d.name} from './${name}'\n`
		} else {
			code += `import ${d.name}, { ${named.join(', ')} } from './${name}'\n`
		}
		named.push(d.name)
	} else if (named.length > 0) {
		code += `import { ${named.join(', ')} } from './${name}'\n`
	}
	return named
}

const modelFiles = await fs.promises.readdir('./lib/model')
const modelNames = []

for (const modelName of modelFiles) {
	const named = await createImportStatement(`model/${modelName}`)
	modelNames.push(...named)
}

const rlFiles = await fs.promises.readdir('./lib/rl')
const rlNames = []

for (const rlName of rlFiles) {
	const named = await createImportStatement(`rl/${rlName}`)
	rlNames.push(...named)
}

code += `
/**
 * Default export object.
 * @module default
 * @property {Tree} Tree
 * @property {Tensor} Tensor
 * @property {Matrix} Matrix
 * @property {EnsembleBinaryModel} EnsembleBinaryModel
 */
export default {
	Tree,
	Tensor,
	Matrix,
	EnsembleBinaryModel,
	/**
	 * @memberof default
`
for (const name of modelNames) {
	code += `	 * @property {${name}} ${name}\n`
}
code += `	 */
	models: {
`

for (const name of modelNames) {
	code += `		${name},\n`
}
code += `
	},
	/**
	 * @memberof default
`
for (const name of rlNames) {
	code += `	 * @property {${name}} ${name}\n`
}
code += `	 */
	rl: {
`
for (const name of rlNames) {
	code += `		${name},\n`
}
code += `
	}
}
`

fs.promises.writeFile('./lib/index.js', code)
