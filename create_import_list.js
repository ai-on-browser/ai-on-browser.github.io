import fs from 'fs'
import ts from 'typescript'

const createEntrypoint = async () => {
	let code = `import Matrix from './util/matrix.js'
import Tensor from './util/tensor.js'
import Graph from './util/graph.js'
import Complex from './util/complex.js'

`

	const getComment = async (filename, name) => {
		const text = (await fs.promises.readFile(`./lib/${filename}`)).toString()
		const source = ts.createSourceFile(`./lib/${filename}`, text, ts.ScriptTarget.Latest)

		let comment = ''
		source.forEachChild(node => {
			if (node.name?.escapedText === name) {
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
 * @property {Tensor} Tensor Tensor class
 * @property {Matrix} Matrix Matrix class
 * @property {Graph} Graph Graph class
 * @property {Complex} Complex Complex number
 */
export default {
	Tensor,
	Matrix,
	Graph,
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

	await fs.promises.writeFile('./lib/index.js', '// This file is generated automatically.\n' + code)
}

const createLayerlist = async () => {
	const layerDir = './lib/model/nns/layer'
	const files = await fs.promises.readdir(layerDir)
	let code = ''
	const types = []
	for (const file of files) {
		if (file === 'base.js') {
			const text = (await fs.promises.readFile(`${layerDir}/${file}`)).toString()
			const source = ts.createSourceFile(`${layerDir}/${file}`, text, ts.ScriptTarget.Latest)
			source.forEachChild(node => {
				if (
					ts.isVariableStatement(node) &&
					['unaryLayers', 'binaryLayers'].includes(node.declarationList.declarations[0].name.escapedText)
				) {
					const init = node.declarationList.declarations[0].initializer
					for (const property of init.properties) {
						types.push({ type: property.name.escapedText })
					}
				}
			})
		} else if (file !== 'index.js' && file.endsWith('.js')) {
			const text = (await fs.promises.readFile(`${layerDir}/${file}`)).toString()
			const source = ts.createSourceFile(`${layerDir}/${file}`, text, ts.ScriptTarget.Latest)

			let className = null
			let typeName = null
			const params = []
			source.forEachChild(node => {
				if (ts.isClassDeclaration(node) && !className) {
					className = node.name.escapedText
					node.forEachChild(cnode => {
						if (ts.isConstructorDeclaration(cnode)) {
							const commentRanges = ts.getLeadingCommentRanges(text, cnode.getFullStart())
							if (!commentRanges || commentRanges.length === 0) {
								return
							}
							const commentRange = commentRanges[commentRanges.length - 1]
							const comment = text.slice(commentRange.pos, commentRange.end)
							for (const param of comment.matchAll(
								/@param \{(?<type>.*)\} (?<optional>\[?)(?<name>[0-9a-zA-Z._]+)(=?(?<default>.*)\])? (?<description>.*)/g
							)) {
								if (param.groups.name.startsWith('config.')) {
									const name = param.groups.name.slice('config.'.length)
									params.push({ name, type: param.groups.type, optional: param.groups.optional })
								}
							}
						}
					})
				}
				if (ts.isExpressionStatement(node) && node.expression.expression.expression.escapedText === className) {
					const args = node.expression.arguments
					if (args.length === 0) {
						typeName = className
							.replace(/Layer$/, '')
							.replace(/[A-Z]/g, s => '_' + s.toLowerCase())
							.slice(1)
					} else {
						typeName = args[0].text
					}
				}
			})
			code += `export { default as ${className} } from './${file}'\n`
			types.push({ type: typeName, params })
		}
	}
	types.sort((a, b) => (a.type < b.type ? -1 : 1))
	let typeCode = `
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
/**
 * @typedef {(
`
	for (const type of types) {
		typeCode += ` * { type: '${type.type}'`
		type.params?.forEach(param => {
			typeCode += `, ${param.name}${param.optional ? '?' : ''}: ${param.type}`
		})
		typeCode += ' } |\n'
	}
	typeCode = typeCode.slice(0, typeCode.length - 3) + '\n * )} PlainLayerObject\n */\n'
	await fs.promises.writeFile(layerDir + '/index.js', '// This file is generated automatically.\n' + code + typeCode)
}

await createEntrypoint()
await createLayerlist()
