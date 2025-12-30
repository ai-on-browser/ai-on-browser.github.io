import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import jest from 'eslint-plugin-jest'
import jsdoc from 'eslint-plugin-jsdoc'
import globals from 'globals'

export default [
	js.configs.recommended,
	jsdoc.configs['flat/recommended'],
	{
		languageOptions: {
			ecmaVersion: 13,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: 'latest',
			},
		},
		rules: {
			'no-constant-condition': ['error', { checkLoops: false }],
		},
	},
	{
		files: ['tests/**'],
		...jest.configs['flat/recommended'],
	},
	eslintConfigPrettier,
	{
		ignores: ['**/onnx_pb.js'],
	},
]
