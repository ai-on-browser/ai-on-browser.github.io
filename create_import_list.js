import fs from 'fs'
import ts from 'typescript'

let code = `import Matrix from './util/matrix.js'
import Tensor from './util/tensor.js'
import Complex from './util/complex.js'
import Tree from './util/tree.js'

`

const getComment = async (filename, name) => {
	const text = (await fs.promises.readFile(`./lib/${filename}`)).toString()
	const source = ts.createSourceFile(`./lib/${filename}`, text, ts.ScriptTarget.Latest)

	let comment = ''
	source.forEachChild(node => {
		if (ts.isClassDeclaration(node) && node.name?.escapedText === name) {
			const commentRanges = ts.getLeadingCommentRanges(text, node.getFullStart())
			if (!commentRanges || commentRanges.length === 0) {
				return
			}
			const commentRange = commentRanges[commentRanges.length - 1]
			comment += text.slice(commentRange.pos, commentRange.end)
		}
	})
	comment = comment.replaceAll(/^\s*(\/\*\*|\*(\/)?)/gm, '')
	const comments = comment.split(/\r|\r\n|\n/).map(v => v.trim())
	let com = ''
	for (let i = 0; i < comments.length; i++) {
		if (comments[i].length === 0) {
			if (com.length === 0) {
				continue
			}
			break
		} else if (comments[i].startsWith('@')) {
			continue
		}
		com += ' ' + comments[i]
	}

	return com
}

const createImportStatement = async filename => {
	const mod = await import(`./lib/${filename}`)
	let d = null
	const named = []
	for (const name of Object.keys(mod)) {
		if (name === 'default') {
			d = mod.default
		} else {
			const comment = await getComment(filename, name)
			named.push({ name, comment })
		}
	}
	if (d) {
		if (named.length === 0) {
			code += `import ${d.name} from './${filename}'\n`
		} else {
			code += `import ${d.name}, { ${named.map(v => v.name).join(', ')} } from './${filename}'\n`
		}
		const comment = await getComment(filename, d.name)
		named.push({ name: d.name, comment })
	} else if (named.length > 0) {
		code += `import { ${named.map(v => v.name).join(', ')} } from './${filename}'\n`
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
 *
 * @module default
 * @property {Tree} Tree Tree class
 * @property {Tensor} Tensor Tensor class
 * @property {Matrix} Matrix Matrix class
 * @property {Complex} Complex Complex number
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
		code += `	 * @property {${name.name}} ${name.name}${name.comment}\n`
	}
	code += `	 */\n	${key}: {\n`

	for (const name of names) {
		code += `		${name.name},\n`
	}
	code += '	},\n'
}

addExports('models', modelNames)
addExports('rl', rlNames)
addExports('evaluate', evaluateNames)

code += '}'

fs.promises.writeFile('./lib/index.js', code)
