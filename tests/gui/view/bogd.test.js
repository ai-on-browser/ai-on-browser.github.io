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
		modelSelectBox.select('bogd')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const methods = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await methods.getProperty('value')).jsonValue()).resolves.toBe('oneone')
		const kernel = await buttons.waitForSelector('select:nth-of-type(2)')
		await expect((await kernel.getProperty('value')).jsonValue()).resolves.toBe('gaussian')
		const sampling = await buttons.waitForSelector('select:nth-of-type(3)')
		await expect((await sampling.getProperty('value')).jsonValue()).resolves.toBe('nonuniform')
		const loss = await buttons.waitForSelector('select:nth-of-type(4)')
		await expect((await loss.getProperty('value')).jsonValue()).resolves.toBe('hinge')
		const b = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await b.getProperty('value')).jsonValue()).resolves.toBe('10')
		const eta = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await eta.getProperty('value')).jsonValue()).resolves.toBe('0.5')
		const lambda = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await lambda.getProperty('value')).jsonValue()).resolves.toBe('0.1')
		const gamma = await buttons.waitForSelector('input:nth-of-type(4)')
		await expect((await gamma.getProperty('value')).jsonValue()).resolves.toBe('0.1')
		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('CF')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('bogd')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const epoch = await buttons.waitForSelector('[name=epoch]')
		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('0')
		const methodFooter = await page.waitForSelector('#method_footer')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toBe('')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		await expect(epoch.evaluate(el => el.textContent)).resolves.toBe('1')
		await expect(methodFooter.evaluate(el => el.textContent)).resolves.toMatch(/^Accuracy:[0-9.]+$/)
	}, 10000)
})
