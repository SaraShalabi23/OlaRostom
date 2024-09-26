//script.js:
let cart = [];
let products = [
    { name: 'بسكوت لوكر', price: 32, description: 'لذيذ مقرمش بدون سكر', image: 'images/kur.jpg' },
    { name: 'بسكوت لوز', price: 50, description: 'لذيذ جدا بدوتاي سكر مضاف', image: 'images/kk.jpg' }
];

// Add sample products on page load
window.onload = () => {
    displayProducts();
};

// Function to display products
function displayProducts() {
    let catalog = document.getElementById('catalog');
    catalog.innerHTML = '';
    products.forEach((product, index) => {
        let productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h2>${product.name}</h2>
            <p class="product-price">₪${product.price}</p>
            <p>${product.description}</p>
            <button class="add-to-cart">إضافة إلى العربة</button>
            <div class="admin-actions" style="display: none;">
                <button class="edit-product" data-index="${index}">تعديل</button>
                <button class="delete-product" data-index="${index}">حذف</button>
            </div>
        `;
        catalog.appendChild(productDiv);
    });
}
// Updated Search Functionality
document.getElementById('search-bar').addEventListener('input', function (e) {
    const query = e.target.value.trim().toLowerCase();  // Get the search query and convert it to lowercase
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';  // Clear previous suggestions

    if (query !== '') {
        // Filter products based on the search query, checking if any part of the name contains the query
        const filteredProducts = products.filter(product => product.name.toLowerCase().includes(query));

        // Display matching products as suggestions
        if (filteredProducts.length > 0) {
            suggestionsList.style.display = 'block';  // Ensure the suggestions list is visible
            filteredProducts.forEach(product => {
                const suggestionItem = document.createElement('li');
                suggestionItem.textContent = product.name;
                suggestionItem.addEventListener('click', function () {
                    displaySelectedProduct(product);  // Display selected product with the original size and button
                    suggestionsList.style.display = 'none';  // Hide suggestions after selection
                });
                suggestionsList.appendChild(suggestionItem);
            });
        } else {
            suggestionsList.style.display = 'none';  // Hide if no matches are found
        }
    } else {
        suggestionsList.style.display = 'none';  // Hide if the search query is empty
    }
});

// Function to display the selected product in the catalog, with original styling and button
function displaySelectedProduct(product) {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';  // Clear the catalog area to show the selected product
    let productDiv = document.createElement('div');
    productDiv.classList.add('product');  // Reuse the same class for styling consistency
    productDiv.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h2>${product.name}</h2>
        <p class="product-price">₪${product.price}</p>
        <p>${product.description}</p>
        <button class="add-to-cart">إضافة إلى العربة</button>
    `;
    catalog.appendChild(productDiv);
}
// Handle add-to-cart functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        let productElement = e.target.closest('.product');
        let productName = productElement.querySelector('h2').textContent;
        let productPrice = parseFloat(productElement.querySelector('.product-price').textContent.replace('₪', ''));
        let productImage = productElement.querySelector('img').src;
        let quantity = 1;

        let productInCart = cart.find(item => item.name === productName);

        if (productInCart) {
            productInCart.quantity += quantity;
        } else {
            cart.push({ name: productName, price: productPrice, quantity: quantity, image: productImage });
            
        }

        updateCart();
    }
});
// Handle admin login (simple password check)
document.getElementById('admin-login').addEventListener('click', () => {
    let password = prompt('أدخل كلمة مرور المدير:');
    if (password === 'admin123') {
        document.getElementById('admin-section').style.display = 'block';
        document.querySelectorAll('.admin-actions').forEach(action => action.style.display = 'block');
    } else {
        alert('كلمة مرور خاطئة!');
    }
});
// Handle adding new product from admin panel
document.getElementById('admin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let name = document.getElementById('product-name').value;
    let price = document.getElementById('product-price').value;
    let description = document.getElementById('product-desc').value;
    let imageFile = document.getElementById('product-image').files[0]; // Get the uploaded file

    if (imageFile) {
        addProduct(name, price, description, imageFile); // Pass the image file to addProduct
    }

    document.getElementById('admin-form').reset();
});

// Add new products
function addProduct(name, price, description, imageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageBase64 = event.target.result;
        products.push({ name, price, description, image: imageBase64 });
        displayProducts();
    };
    reader.readAsDataURL(imageFile); // Convert the uploaded image to a Base64 string
}
// Handle delete and edit functionality for products
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-product')) {
        let index = e.target.getAttribute('data-index');
        products.splice(index, 1);
        displayProducts();
    }

    if (e.target.classList.contains('edit-product')) {
        let index = e.target.getAttribute('data-index');
        let product = products[index];

        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-desc').value = product.description;
        document.getElementById('product-image').value = product.image;

        document.getElementById('admin-form').onsubmit = (e) => {
            e.preventDefault();

            product.name = document.getElementById('product-name').value;
            product.price = document.getElementById('product-price').value;
            product.description = document.getElementById('product-desc').value;
            product.image = document.getElementById('product-image').value;

            displayProducts();
            document.getElementById('admin-form').reset();
            document.getElementById('admin-form').onsubmit = addNewProductHandler; // Restore original handler
        };
    }
});

// Handle new product addition after reset
function addNewProductHandler(e) {
    e.preventDefault();
    let name = document.getElementById('product-name').value;
    let price = document.getElementById('product-price').value;
    let description = document.getElementById('product-desc').value;
    let image = document.getElementById('product-image').value;

    addProduct(name, price, description, image);

    document.getElementById('admin-form').reset();
}

document.getElementById('admin-form').onsubmit = addNewProductHandler;

// Handle checkout form and generate a new page
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;

    generateNewPageAndCapture(name, phone, cart);
});

// Function to generate a new page and capture the content as an image

///----------------------------3



async function generateNewPageAndCapture(name, phone, cart) {
    // Create the page content with cart details and append it to the body
    const orderSummary = document.createElement('div');
    orderSummary.style.border = '2px solid black';  // Add border around the content
    orderSummary.style.padding = '20px';  // Add padding inside the border
    orderSummary.style.maxWidth = '600px';  // Limit the width for better readability
    orderSummary.style.margin = '20px auto';  // Center the content
    orderSummary.style.backgroundColor = '#fff';  // Ensure background color is white

    orderSummary.innerHTML = `
        <h2 style="text-align: center; font-family: 'Amiri', sans-serif;">ملخص الطلب</h2>
        <p style="text-align: right; font-family: 'Amiri', sans-serif;">الاسم: ${name}</p>
        <p style="text-align: right; font-family: 'Amiri', sans-serif;">رقم الهاتف: ${phone}</p>
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-family: 'Amiri', sans-serif;">
            <thead>
                <tr>
                    <th style="border: 1px solid black; padding: 10px;">الصورة</th>
                    <th style="border: 1px solid black; padding: 10px;">اسم المنتج</th>
                    <th style="border: 1px solid black; padding: 10px;">السعر</th>
                    <th style="border: 1px solid black; padding: 10px;">الكمية</th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                    <tr>
                        <td style="border: 1px solid black; padding: 10px;">
                            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain;">

                        </td>
                        <td style="border: 1px solid black; padding: 10px;">${item.name}</td>
                        <td style="border: 1px solid black; padding: 10px;">₪  ${item.price.toFixed(2)}</td>
                        <td style="border: 1px solid black; padding: 10px;">${item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <p id="total-price" style="text-align: right; font-weight: bold; font-family: 'Amiri', sans-serif; margin-top: 20px;">السعر الإجمالي: ₪${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
    `;

    // Append the summary to the body temporarily
    document.body.appendChild(orderSummary);
 // Create and style the share button to appear near the recipe
const shareButton = document.createElement('button');
 shareButton.textContent = 'مشاركة الطلبية مع علا';
 shareButton.style.display = 'block';
 shareButton.style.margin = '20px auto';  // Center the button
 shareButton.style.padding = '10px';
 shareButton.style.backgroundColor = '#4CAF50'; // Green background
 shareButton.style.color = 'white'; // White text
 shareButton.style.border = 'none';
 shareButton.style.borderRadius = '5px'; // Rounded corners
 shareButton.style.cursor = 'pointer';  // Pointer cursor on hover
 document.body.appendChild(shareButton);

    function loadImagesAndCapture() {
        const images = Array.from(orderSummary.querySelectorAll('img'));
        const promises = images.map(img => {
            return new Promise(resolve => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                }
            });
        });
        return Promise.all(promises);
    }
      shareButton.addEventListener('click', async () => {
        console.log("Share button clicked");
        await loadImagesAndCapture();

        // Use html2canvas to capture the recipe as an image
        html2canvas(orderSummary, {
            scale: 2, // Ensure high resolution for the image
            useCORS: true, // Ensure cross-origin images are captured
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const blob = dataURItoBlob(image);
            const file = new File([blob], 'order_summary.png', { type: 'image/png' });

            // Use Web Share API to share the image
            if (navigator.share) {
                navigator.share({
                    title: 'Order Summary',
                    text: 'مرحبا علا! هذا طلبي شكرا!',
                    files: [file],
                }).catch(error => console.error('Error sharing:', error));
            } else {
                alert('Your browser does not support the Web Share API.');
            }
        }).catch(error => {
            console.error('Error capturing the screen:', error);
        });
    });

    
}    

    // Convert data URI to Blob
    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: mimeString });
    }

    // Capture the page content and show the preview
    loadImagesAndCapture().then(() => {
        html2canvas(orderSummary, {
            scale: 2, // Ensure high resolution for the image
            useCORS: true, // Ensure cross-origin images are captured
        }).then(canvas => {
            const imageData = canvas.toDataURL('image/png');
            previewImage(imageData); // Show the preview
            document.body.removeChild(orderSummary); // Remove the temporary order summary
        }).catch(error => {
            console.error('Error capturing the screen:', error);
        });
    });


// Example usage with checkout form submission
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    // Call the function to capture and preview the image
    generateNewPageAndCapture(name, phone, cart);
});






function updateCart() {
    let cartItemsDiv = document.getElementById('cart-items');
    let totalPrice = 0;
    cartItemsDiv.innerHTML = '';

    cart.forEach((item, index) => {
        let itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');

        let img = document.createElement('img');
        img.src = item.image;

        let nameDiv = document.createElement('div');
        nameDiv.textContent = `${item.name}`;

        let quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = item.quantity;
        quantityInput.min = 1;
        quantityInput.addEventListener('change', function() {
            const newQuantity = parseInt(this.value);
            if (newQuantity > 0) {
                cart[index].quantity = newQuantity;
            }
            updateCart();
        });

        let priceDiv = document.createElement('div');
        priceDiv.textContent = `₪${(item.price * item.quantity).toFixed(2)}`;

        let removeButton = document.createElement('button');
        removeButton.innerHTML = '🗑️'; // Use innerHTML to set emoji
        removeButton.classList.add('remove-button'); // Add class for styling

            removeButton.addEventListener('click', function() {
            cart.splice(index, 1); // Remove the item from the cart
            updateCart();
        });

        itemDiv.appendChild(img);
        itemDiv.appendChild(nameDiv);
        itemDiv.appendChild(quantityInput);
        itemDiv.appendChild(priceDiv);
        itemDiv.appendChild(removeButton);

        cartItemsDiv.appendChild(itemDiv);
        totalPrice += item.price * item.quantity;
    });

    document.getElementById('total-price').textContent = `₪${totalPrice.toFixed(2)}`;
}


