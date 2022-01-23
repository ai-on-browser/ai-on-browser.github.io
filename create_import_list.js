import fs from 'fs'

let code = `import Matrix from './util/matrix.js'
import Tensor from './util/tensor.js'
import Complex from './util/complex.js'
import Tree from './util/tree.js'

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

const importNames = async dirname => {
	const files = await fs.promises.readdir(`./lib/${dirname}`, { withFileTypes: true })
	const names = []
	for (const file of files) {
		if (file.isFile() && file.name.endsWith('.js')) {
			const named = await createImportStatement(`${dirname}/${file.name}`)
			names.push(...named)
		}
	}
	return names
}

const modelNames = await importNames('model')
const rlNames = await importNames('rl')
const evaluateNames = await importNames('evaluate')

code += `
/**
 * Default export object.
 * @module default
 * @property {Tree} Tree
 * @property {Tensor} Tensor
 * @property {Matrix} Matrix
 * @property {Complex} Complex
 */
export default {
	Tree,
	Tensor,
	Matrix,
	Complex,
`

const addExports = (key, names) => {
	code += '	/**\n	 * @memberof default\n'
	for (const name of names) {
		code += `	 * @property {${name}} ${name}\n`
	}
	code += `	 */\n	${key}: {\n`

	for (const name of names) {
		code += `		${name},\n`
	}
	code += '	},\n'
}

addExports('models', modelNames)
addExports('rl', rlNames)
addExports('evaluate', evaluateNames)

code += '}'

fs.promises.writeFile('./lib/index.js', code)
