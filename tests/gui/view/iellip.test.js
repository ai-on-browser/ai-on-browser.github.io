import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('classification', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('iellip')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const methods = await buttons.waitForSelector('[name=method]')
		await expect((await methods.getProperty('value')).jsonValue()).resolves.toBe('oneone')
		const type = await buttons.waitForSelector('[name=type]')
		await expect((await type.getProperty('value')).jsonValue()).resolves.toBe('CELLIP')
		const gamma = await buttons.waitForSelector('[name=gamma]')
		await expect((await gamma.getProperty('value')).jsonValue()).resolves.toBe('1')
		const a = await buttons.waitForSelector('[name=a]')
		await expect((await a.getProperty('value')).jsonValue()).resolves.toBe('0.5')
	}, 10000)

	test('learn cellip', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('iellip')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')
		const type = await buttons.waitForSelector('[name=type]')
		await type.select('CELLIP')

		const methodFooter = await page.waitForSelector('#method_footer')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const calculateButton = await buttons.waitForSelector('input[value=Calculate]')
		await calculateButton.evaluate(el => el.click())

		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	}, 10000)

	test('learn iellip', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('iellip')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')
		const type = await buttons.waitForSelector('[name=type]')
		await type.select('IELLIP')

		const methodFooter = await page.waitForSelector('#method_footer')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const calculateButton = await buttons.waitForSelector('input[value=Calculate]')
		await calculateButton.evaluate(el => el.click())

		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	}, 10000)
})
