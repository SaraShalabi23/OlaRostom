

const firebaseConfig = {
    apiKey: "AIzaSyDmxUW87ZN9bvGr8JiphIOEempZ_tU9Su0",
    authDomain: "olarostomcake.firebaseapp.com",
    databaseURL: "https://olarostomcake-default-rtdb.firebaseio.com", // Include database URL
    projectId: "olarostomcake",
    storageBucket: "olarostomcake.appspot.com",
    messagingSenderId: "32874436408",
    appId: "1:32874436408:web:de1e7c4ef92dd59b9353cd",
    measurementId: "G-K8VX4Z84LE"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();
let cart = [];
let allProductNames = [];

// Firebase Configuration

function getAllProductNames() {
    const productsRef = database.ref('products');
    productsRef.on('value', (snapshot) => {
        allProductNames = []; // Reset product names
        snapshot.forEach(childSnapshot => {
            let product = childSnapshot.val();
            allProductNames.push(product.name); // Add each product name to the array
        });
    });
}
// Fetch products from Firebase on page load
window.onload = () => {
    getProductsFromDatabase();
    getAllProductNames(); // Fetch product names for search

};
/*
// Function to display products from the database
function displayProducts(products) {
    const catalog = document.getElementById('catalog');
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

// Fetch products from Firebase Realtime Database
function getProductsFromDatabase() {
    const productsRef = database.ref('products');
    productsRef.on('value', (snapshot) => {
        const products = [];
        snapshot.forEach(childSnapshot => {
            products.push(childSnapshot.val());
        });
        displayProducts(products);
    });
}
*/
function displayProducts(products) {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '';

    products.forEach((product) => {
        let productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h2>${product.name}</h2>
            <p class="product-price">₪${product.price}</p>
            <p>${product.description}</p>
            <button class="add-to-cart">إضافة إلى العربة</button>
            <div class="admin-actions" style="display: none;">
                <button class="edit-product" data-key="${product.key}">تعديل</button>
                <button class="delete-product" data-key="${product.key}">حذف</button>
            </div>
        `;
        catalog.appendChild(productDiv);
    });
}

// Fetch products from Firebase Realtime Database with keys
function getProductsFromDatabase() {
    const productsRef = database.ref('products');
    productsRef.on('value', (snapshot) => {
        const products = [];
        snapshot.forEach(childSnapshot => {
            const product = childSnapshot.val();
            product.key = childSnapshot.key; // Store the key of the product
            products.push(product);
        });
        displayProducts(products);
    });
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
        showToast(`تمت إضافة المنتج "${productName}" إلى العربة!`);

    }
});
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message; // Set the message
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-product')) {
        const productKey = e.target.getAttribute('data-key'); // Get the product's key
        
        // Get the product data and its image URL
        const productRef = database.ref('products/' + productKey);
        productRef.once('value').then(snapshot => {
            const product = snapshot.val();
            const imageUrl = product.image;

            // Delete the image from Firebase Storage
            const imageRef = storage.refFromURL(imageUrl);
            imageRef.delete().then(() => {
                console.log('Image deleted successfully');
            }).catch(error => {
                console.error('Error deleting image:', error);
            });

            // Delete the product from Firebase Database
            productRef.remove().then(() => {
                console.log('Product deleted successfully');
                getProductsFromDatabase(); // Refresh the product list
            }).catch(error => {
                console.error('Error deleting product:', error);
            });
        });
    }
});
let currentEditProductKey = null; // Store the product key of the product being edited

// Handle click events for opening and closing the modal
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-product')) {
        currentEditProductKey = e.target.getAttribute('data-key'); // Store the product key
        
        // Get the product details and populate the modal form
        const productRef = database.ref('products/' + currentEditProductKey);
        productRef.once('value').then((snapshot) => {
            const product = snapshot.val();
            document.getElementById('edit-product-name').value = product.name;
            document.getElementById('edit-product-price').value = product.price;
            document.getElementById('edit-product-desc').value = product.description;

            // Open the modal
            document.getElementById('edit-modal').style.display = 'block';
        });
    }

    if (e.target.classList.contains('close')) {
        document.getElementById('edit-modal').style.display = 'none'; // Close the modal
    }
});

// Handle updating the product from the modal form
document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const updatedName = document.getElementById('edit-product-name').value;
    const updatedPrice = document.getElementById('edit-product-price').value;
    const updatedDescription = document.getElementById('edit-product-desc').value;
    const updatedImageFile = document.getElementById('edit-product-image').files[0]; // Optional image upload

    const productRef = database.ref('products/' + currentEditProductKey); // Reference the current product
    
    if (updatedImageFile) {
        // If a new image is uploaded, handle image upload
        uploadImageToStorage(updatedImageFile, (newImageUrl) => {
            productRef.update({
                name: updatedName,
                price: updatedPrice,
                description: updatedDescription,
                image: newImageUrl // Update with new image URL if new image is provided
            }).then(() => {
                console.log('Product updated successfully');
                getProductsFromDatabase(); // Refresh product list
            });
        });
    } else {
        // If no new image is uploaded, just update text fields
        productRef.update({
            name: updatedName,
            price: updatedPrice,
            description: updatedDescription
        }).then(() => {
            console.log('Product updated successfully');
            getProductsFromDatabase(); // Refresh product list
        });
    }

    // Close the modal after updating
    document.getElementById('edit-modal').style.display = 'none';
});




// Admin login
document.getElementById('admin-login').addEventListener('click', () => {
    let password = prompt('أدخل كلمة مرور المدير:');
    //adminPass
    if (password === 'ola1984') {
        document.getElementById('admin-section').style.display = 'block';
        document.querySelectorAll('.admin-actions').forEach(action => action.style.display = 'block');
      /*  setTimeout(() => {
            document.querySelector('html').scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 500);*/
    } else {
        alert('كلمة مرور خاطئة!');
    }
});

// Admin form for adding new products
document.getElementById('admin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    let name = document.getElementById('product-name').value;
    let price = document.getElementById('product-price').value;
    let description = document.getElementById('product-desc').value;
    let imageFile = document.getElementById('product-image').files[0]; // Get the uploaded image file

    if (imageFile) {
        // Upload the image to Firebase Storage
        uploadImageToStorage(imageFile, (imageUrl) => {
            // After uploading the image, add the product with the image URL to Firebase Database
            addProductToDatabase({
                name: name,
                price: price,
                description: description,
                image: imageUrl  // Use the image URL from Firebase Storage
            });
            showToast('تمت اضافة المنتج بنجاح');
            document.getElementById('admin-form').reset();


        });
    }
});


// Upload image to Firebase Storage
function uploadImageToStorage(file, callback) {
    const storageRef = storage.ref('images/' + file.name);  // Use a unique name for each image
    storageRef.put(file).then(snapshot => {
        snapshot.ref.getDownloadURL().then(url => {
            callback(url);  // Pass the URL to the callback function after successful upload
        });
    }).catch(error => {
        console.error('Error uploading image: ', error);  // Handle upload errors
    });
}


// Add product to Firebase Realtime Database
function addProductToDatabase(product) {
    const productsRef = database.ref('products').push();
    productsRef.set(product);
}

// Cart functionality
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
        quantityInput.addEventListener('change', function () {
            const newQuantity = parseInt(this.value);
            if (newQuantity > 0) {
                cart[index].quantity = newQuantity;
            }
            updateCart();
        });

        let priceDiv = document.createElement('div');
        priceDiv.textContent = `₪${(item.price * item.quantity).toFixed(2)}`;

        let removeButton = document.createElement('button');
        removeButton.innerHTML = '🗑️';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', function () {
            cart.splice(index, 1);
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

// Handle checkout and generate the order summary
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;

    generateNewPageAndCapture(name, phone, cart);

    // Automatically scroll down to the order summary
    setTimeout(() => {
        document.querySelector('html').scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 500); // Delay to ensure the order summary is generated before scrolling
});

/*
// Function to generate a new page and capture the content as an image
async function generateNewPageAndCapture(name, phone, cart) {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
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
        <p style="text-align: right; font-family: 'Amiri', sans-serif;">التاريخ: ${formattedDate}</p> <!-- Add current date here -->

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
        <p id="total-price" style="text-align: right; font-weight: bold; font-family: 'Amiri', sans-serif; margin-top: 20px;">
            السعر الإجمالي: ₪${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
        </p>
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
*/
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
/*
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
*/
async function generateNewPageAndCapture(name, phone, cart) {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
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
        <p style="text-align: right; font-family: 'Amiri', sans-serif;">التاريخ: ${formattedDate}</p> <!-- Add current date here -->

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
        <p id="total-price" style="text-align: right; font-weight: bold; font-family: 'Amiri', sans-serif; margin-top: 20px;">
            السعر الإجمالي: ₪${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
        </p>
    `;

    document.body.appendChild(orderSummary);

    // Use html2canvas to capture the recipe as an image
    html2canvas(orderSummary, {
        scale: 2, // Ensure high resolution for the image
        useCORS: true, // Ensure cross-origin images are captured
    }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        /*
        // Download the image automatically
        const link = document.createElement('a');
        link.href = image;
        link.download = 'order_summary.png';  // File name for the saved image
        link.click();  // Trigger the download
*/
        // Show a popup that the image has been saved
        showPopupMessage("تم حفظ صورة الطلبية!أرجو مشاركتها مع عُلا لتأكيد الطلب!⬇️");

        // Now display the share button
        displayShareButton(orderSummary, image);
        
    }).catch(error => {
        console.error('Error capturing the screen:', error);
    });
}

// Function to show a popup message
// Function to show a popup message in the center and larger
function showPopupMessage(message) {
    const popup = document.createElement('div');
    popup.textContent = message;

    // Style the popup to be larger and centered
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)'; // Center the popup
    popup.style.backgroundColor = '#4CAF50';
    popup.style.color = '#fff';
    popup.style.padding = '20px 40px';  // Larger padding for bigger popup
    popup.style.borderRadius = '10px';  // Slightly bigger border radius for a more modern look
    popup.style.zIndex = '1000';
    popup.style.fontSize = '24px';  // Larger font size
    popup.style.textAlign = 'center';  // Center the text

    document.body.appendChild(popup);

    // Automatically remove the popup after 2 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);  // Popup disappears after 2 seconds
}

// Function to display the share button under the recipe
function displayShareButton(orderSummary, image) {
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
    shareButton.scrollIntoView({ behavior: 'smooth', block: 'end' });

    shareButton.addEventListener('click', () => {
        const blob = dataURItoBlob(image);
        const file = new File([blob], 'order_summary.png', { type: 'image/png' });

        // Use Web Share API to share the image
        if (navigator.share) {
            navigator.share({
                title: 'Order Summary',
                text: 'مرحباً علا! هذا طلبي شكراً!',
                files: [file],
            }).catch(error => console.error('Error sharing:', error));
        } else {
            alert('Your browser does not support the Web Share API.');
        }
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

document.getElementById('search-bar').addEventListener('input', function (e) {
    const query = e.target.value.trim().toLowerCase();  // Get the search query and convert it to lowercase
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';  // Clear previous suggestions

    if (query !== '') {
        // Filter products based on the search query, checking if any part of the name contains the query
        const filteredProducts = allProductNames.filter(productName =>
            productName.toLowerCase().includes(query)
        );

        // Display matching products as suggestions
        if (filteredProducts.length > 0) {
            suggestionsList.style.display = 'block';  // Ensure the suggestions list is visible
            filteredProducts.forEach(productName => {
                const suggestionItem = document.createElement('li');
                suggestionItem.textContent = productName;
                suggestionItem.style.cursor = 'pointer';
                suggestionItem.addEventListener('click', function () {
                    displaySelectedProduct(productName);  // Display selected product
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

// Function to display the selected product (fetch full product details from Firebase)
function displaySelectedProduct(productName) {
    const productsRef = database.ref('products');
    productsRef.orderByChild('name').equalTo(productName).once('value', (snapshot) => {
        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '';  // Clear the catalog area to show the selected product

        snapshot.forEach(childSnapshot => {
            const product = childSnapshot.val();
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
        });
    });
}
// Scroll to the cart section when the floating button is clicked
document.getElementById('scroll-to-cart').addEventListener('click', () => {
    document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
});
