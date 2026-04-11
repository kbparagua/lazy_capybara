const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec';
const PRODUCT_COLUMNS = ['id', 'name', 'description', 'category', 'price', 'imageUrl'];

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const clientSecret = params.get('s');

    const formData = JSON.stringify({ client_secret: clientSecret });
    const response = await fetch(LAZY_CAPYBARA_URL, { method: 'POST', body: formData });

    const text = await response.text();
    const data = JSON.parse(text);

    const products = data.products ? parseProducts(data.products) : [];

    console.log(products);
    console.log(data);
});

function parseProducts(rawData) {
    const products = [];

    for (let i = 0; i < rawData.length; i++) {
        const product = {};
        for (let j = 0; j < PRODUCT_COLUMNS.length; j++) {
            product[PRODUCT_COLUMNS[j]] = rawData[i][j];
        }

        if (product.id == '') return products;

        products.push(product);
    }

    return products;
}
