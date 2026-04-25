import data from '../data/products.json' with { type: 'json' };
import ProductRepository from './product_repository.js';

ProductRepository.init(data);

console.log('loaded');
console.log(data);

const UNLIMITED = -1;

const config = {};
const cheatsheet = {};
data.forEach(item => {
  config[item.category] ||= {};
  config[item.category][item.sku] = item.available;

  cheatsheet[item.sku] = `[${item.category}] ${item.name}`
});


document.addEventListener('DOMContentLoaded', async () => {
  const prettyJson = JSON.stringify(config, null, 2);
  document.querySelector('.js-textarea').value = prettyJson;

  const skusEl = document.querySelector('.js-skus');
  Object.entries(cheatsheet).forEach(([key, value]) => {
    const li = document.createElement('li');
    li.textContent = `${key}: ${value}`;
    skusEl.appendChild(li);
  });

  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();

    const inventory = {};
    const textarea = document.querySelector('.js-textarea');
    const value = JSON.parse(textarea.value);

    Object.entries(value).forEach(([category, skus]) => {
      Object.entries(skus).forEach(([sku, available]) => {
        if (available === UNLIMITED) return;

        inventory[sku] = available;
      });
    }); 

    console.log(inventory);

    const finalInventory = {};
    ProductRepository.each((product) => {
      if (inventory.hasOwnProperty(product.sku)) {
        finalInventory[product.id] = inventory[product.sku];
      }
    });

    console.log(finalInventory);
    console.log(JSON.stringify(finalInventory));
    const encodedInventory = btoa(JSON.stringify(finalInventory));
    console.log(encodedInventory);
    
  }); 
});