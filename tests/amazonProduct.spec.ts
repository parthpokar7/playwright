import { test, expect, type Page } from '@playwright/test';

test('Search for the cheapest laptop with certain criteria and add it to the cart in the Amazon application', async ({ page }) => {
  await page.goto('https://www.amazon.in/');

  // searching for the products "laptops"
  const searchBar = page.getByPlaceholder('Search Amazon.in');  
  await searchBar.fill('laptops');
  await page.locator('#nav-search-submit-button').click()

  //filtering the product by various options
  await page.locator('[data-csa-c-content-id="3837712031"] span').getByText('Dell').click(); // Filter by brand (Dell)
  await page.locator('[data-csa-c-content-id="27399067031"] span').getByText('8 GB').click(); // Filter by RAM (8 GB and above)
  await page.locator('[data-csa-c-content-id="27399067031"] span').getByText('16 GB').click(); // Filter by RAM (16 GB and above)
  await page.locator('[data-csa-c-content-id="27399067031"] span').getByText('32 GB').click(); // Filter by RAM (32 GB and above)

  const lowPrice = page.locator('[name="low-price"]');
  await lowPrice.evaluate(element => element.setAttribute('value','40000')); // applying min value to price filter

  const highPrice = page.locator('[name="high-price"]');
  await highPrice.evaluate(element => element.setAttribute('value','50000')); // applying max value to price filter

  await page.click('[aria-label="Submit price range"]'); // submitting the price range filter
  await page.reload(); // reloading the page to change the price range slider UI

  //getting the cheapest product
  await page.click('[aria-label="Sort by:"]')
  await page.click('.a-popover #s-result-sort-select_1')

  console.log('Cheapest Item => ');
  await page.waitForTimeout(2000)
  const cheapestItemName = await page.locator('#search [data-cel-widget="search_result_2"] h2 a').textContent();
  console.log(`Item Name = ${cheapestItemName}`);

  const cheapestItemPrice = await page.locator('#search [data-cel-widget="search_result_2"] .a-price-whole').textContent();
  console.log(`Item Price = ${cheapestItemPrice}`);

  //getting the costliest product
  await page.click('[aria-label="Sort by:"]')
  await page.click('#a-popover-3 #s-result-sort-select_2')

  console.log('Coastliest Item => ');
  await page.waitForTimeout(2000)
  const costliestItemName = await page.locator('#search [data-cel-widget="search_result_2"] h2 a').textContent();
  console.log(`Item Name = ${costliestItemName}`);

  const costliestItemPrice = await page.locator('#search [data-cel-widget="search_result_2"] .a-price-whole').textContent();
  console.log(`Item Price = ${costliestItemPrice}`);


  // clicking on the first result
  await page.$eval('#search h2 a', el => el.removeAttribute("target"));
  await page.click('#search [data-cel-widget="search_result_2"] h2 a');

  //storing price in variable to verify after adding product to cart
  const price = await page.locator('#apex_desktop .a-price-whole').textContent();
  
  //verifying that we are on product details page
  await expect(page.locator('#productTitle')).toBeVisible();
  //checking product availabilty
  await expect(page.locator('#availability').getByText('In stock')).toBeVisible();
  
  //adding product to the cart
  await page.click('#desktop_qualifiedBuyBox #add-to-cart-button')
  await expect(page.locator('h1').getByText('Added to Cart')).toBeVisible();
  
  // opening cart
  await page.click('#nav-cart')

  //validating amount of added items in cart
  await expect(page.locator('.sc-badge-price span.sc-price').getByText(`${price}.00`)).toBeVisible();

  //checking subtotal 
  await expect(page.locator('#sc-subtotal-amount-activecart').getByText(`${price}.00`)).toBeVisible();
  
  // await page.waitForLoadState('load') 
  await page.reload(); 
  
  // increasing the quantity by 1 and verifying selected value
  await page.click('.quantity .a-declarative');
  await page.click('#quantity_2');
  await expect(page.locator('.quantity .a-dropdown-prompt')).toContainText('2');
  await page.waitForTimeout(2000);

  const expectedPrice = `${(+price.replace(',','')*2)}.00`;
  
  var subTotal = await page.locator('#sc-subtotal-amount-activecart').textContent();
  subTotal= subTotal.replace(',','');
  const total = `${+subTotal.replace(/ /g, '')}.00`;
  
  //checking subtotal after increasing quantity 
  await expect(total).toEqual(expectedPrice);
  
  // removing item from cart
  await page.click('input[value="Delete"]')
  
  //checking that product is removed from cart or not 
  await expect(page.locator('h1').getByText('Your Amazon Cart is empty.')).toBeVisible();
});


