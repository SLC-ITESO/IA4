async function loadData(){
    let resp = await fetch('https://products-dasw.onrender.com/api/products',{
        method : 'GET',
        headers:{
            'x-expediente': '744857',
            'x-auth': 'admin'
        }
    })
    //console.log(resp.status);
    let data = await resp.json();
    //console.log(data);
    sessionStorage.setItem('products', JSON.stringify(data))
    sessionStorage.setItem('fullproducts', JSON.stringify(data))
    updateCategories(data)
    paginateData(data)
    //showCardsData(data)

}
function paginateData(data){
    let itemPerPage = 4;
    let numPages = Math.ceil(data.length/itemPerPage);
    let paginatedData = [];
    for(let i = 0; i < numPages; i++){
        paginatedData.push(data.slice(i*itemPerPage, (i+1)*itemPerPage));
    }
    let l = paginatedData.length;
    //console.log(paginatedData);
    sessionStorage.setItem('products', JSON.stringify(paginatedData.flat()))
    addbuttons(l)
    //showCardsData(paginatedData[0]);
    showPagCardsData(1)
}

function addbuttons(l) {
    //again, investigating more in stack overflow, I found the
    // way of integrated a for in a string
    let html = /*html*/ `
    ${Array.from({length: l}, (_, i) => i).map((i) => /*html*/ `
        <li class="page-item"><a class="page-link" onclick="showPagCardsData('${i+1}')">${i+1}</a></li>
    `).join("")}`;
    document.querySelector('#paginas').innerHTML = html;
}

function showPagCardsData(pageNum){
    let prods = JSON.parse(sessionStorage.getItem('products'));
    let itemPerPage = 4;
    let paginatedData = prods.slice((pageNum-1)*itemPerPage, pageNum*itemPerPage);
    showCardsData(paginatedData);

}

document.getElementById('searchButton').addEventListener('click', function() {
    //console.log('searching');
    let searchTerm = document.getElementById("seachInput").value;
    //console.log(searchTerm);
    if(searchTerm){
        let prods = JSON.parse(sessionStorage.getItem('fullproducts'));
        let filteredProds = prods.filter(prod => prod.name.toLowerCase().includes(searchTerm.toLowerCase()));
        //console.log("FILTERED PRODS");
        //console.log(filteredProds);
        if(filteredProds.length == 0){
            swal("No products found!", "", "error");
            return;
        }
        paginateData(filteredProds);
    }
    else{
        loadData()
    }
})

function showCardsData(prodsArray) {
    let html = /*html*/ `
    <div id ="cardz" class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
    ${prodsArray
        .map((prod) => /*html*/ `
        <div class="col">
            <div class="card h-100">
                <img src="${prod.imageUrl}" class="card-img-top" alt="${prod.category}">
                <div class="card-body">
                    <h5 class="card-title">${prod.name}</h5>
                    <p class="card-text">${prod.description}</p>
                    
                </div>
                <div class="card-footer">
                    <p class="card-text"><h2>$${prod.pricePerUnit}</h2></p>
                    <a href="#" class="btn btn-primary" onclick="addCart('${prod.uuid}')">Add to Cart</a>
                </div>
            </div>
        </div>
    `).join("")}`;

    document.querySelector('#product_html').innerHTML = html;
}

function updateCategories(data){
    let categories = data.map(prod => prod.category);
    //Investigando en stack overflow, se encontro la manera de eliminar
    //los duplicados de un array, se utiliza el new Set y se convierte
    //nuevamente a un array, los tres puntos son para
    //que el array no se convierta en un array de arrays

    categories = [...new Set(categories)];
    //console.log("CATEGORIES")
    //console.log(categories)
    document.querySelector('#dropdownCat').innerHTML =
        categories.map((c) => `
    <li><a class="dropdown-item" onclick="asignaTipo('${c}')" href="categ.html">${c}</a></li>
    <li><hr class="dropdown-divider"></li>
    `).join("");
}

function asignaTipo(categoria){
    //console.log(categoria);
    //console.log(typeof(categoria));
    sessionStorage.setItem('categoria', categoria);
}

function addCart(uuid){
    //console.log("ENTROOOOO")
    if(sessionStorage.getItem('user') == null){
        swal("You must be logged in to add products to the cart", "", "warning");
        return;
    }
    let prods = JSON.parse(sessionStorage.getItem('products'));
    let prodData = prods.find(p => p.uuid == uuid);
    //console.log(prodData);

    document.getElementById('modalItemImage').src = prodData.imageUrl;
    document.getElementById('modalItemName').textContent = prodData.name;
    document.getElementById('modalItemPrice').textContent = '$' + prodData.pricePerUnit;
    document.getElementById('addCartButton').setAttribute('onclick', `confirmAdd('${prodData.uuid}')`);
    // Show the modal
    let modal = new bootstrap.Modal(document.getElementById('preCartModal'), {});
    modal.show();
}

async function confirmAdd(uuid){
    let prods = JSON.parse(sessionStorage.getItem('products'));
    let prodData = prods.find(p => p.uuid == uuid);

    amount = parseInt(document.getElementById('quantity').value);
    //console.log(amount);
    if(amount > prodData.stock || amount <= 0 || isNaN(amount)){
        swal("Bad stock!", "", "error");
        return;
    }
    let user = sessionStorage.getItem('user');
    let link = 'https://products-dasw.onrender.com/api/cart/'+prodData.uuid;

    let body = {amount};

    let resp = await fetch(link,{
        method : 'POST',
        headers:{
            'x-expediente': '744857',
            'x-user': user,
            'Content-type':'Application/json'
        },
        body: JSON.stringify(body)

    }).catch(err => {
        swal("Error adding product to cart", err, "error");
        return;
    });
    let data = await resp.json();
    //console.log(data);
    swal("Product added to cart", "", "success");
}