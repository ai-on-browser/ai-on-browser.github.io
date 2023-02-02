import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('anomaly detection', () => {
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
		taskSelectBox.select('AD')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('abod')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const method = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await method.getProperty('value')).jsonValue()).resolves.toBe('ABOD/FastABOD')
		const k = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await k.getProperty('value')).jsonValue()).resolves.toBe('1000')
		const threshold = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await threshold.getProperty('value')).jsonValue()).resolves.toBe('100')
		const count = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await count.getProperty('value')).jsonValue()).resolves.toBe('5')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('AD')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('abod')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const calcButton = await buttons.waitForSelector('input[value=Calculate]')
		await calcButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile circle')
		expect((await svg.$$('.tile circle')).length).toBe(5)
	}, 10000)
})
