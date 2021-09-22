import fs from 'fs'

const modelFiles = await fs.promises.readdir('./lib/model')

let code = `import { Tree, Tensor, Matrix } from './util/math.js'
import EnsembleBinaryModel from './util/ensemble.js'

`

const wholename = []

for (const modelName of modelFiles) {
	const mod = await import(`./lib/model/${modelName}`)
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
		wholename.push(d.name)
		if (named.length === 0) {
			code += `import ${d.name} from './model/${modelName}'\n`
		} else {
			code += `import ${d.name}, { ${named.join(', ')} } from './model/${modelName}'\n`
		}
	} else if (named.length > 0) {
		code += `import { ${named.join(', ')} } from './model/${modelName}'\n`
	}
	wholename.push(...named)
}

code += `
export default {
	Tree,
	Tensor,
	Matrix,
	models: {
`

for (const name of wholename) {
	code += `		${name},\n`
}
code += `
	},
	EnsembleBinaryModel,
}
`

fs.promises.writeFile('./lib/index.js', code)
