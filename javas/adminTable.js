async function showProductAdminTable(){
    //console.log("renderiza tabla")
    let prods = JSON.parse(sessionStorage.getItem('fullproducts'));
    //console.log(prods);
    //gets all the keys from products
    //let keys = Object.keys(prods[0]);
    //console.log(keys);

    document.querySelector('#adminTable').innerHTML = prods.map((p) => `
    <tr uuidRow="${p.uuid}">
        <td><img src="${p.imageUrl}" alt="Image"></td>
        <td>${p.uuid}</td>
        <td>${p.name}</td>
        <td>${p.description}</td>
        <td>${p.stock}</td>
        <td>$${p.pricePerUnit}</td>
        <td>${p.category}</td>
        <td>${p.unit}</td>
        <td>
            <a class="btn btn-outline-secondary" onclick="editProduct('${p.uuid}')"><i class="bi bi-pencil-square"></i></a>
            <a class="btn btn-outline-danger" onclick="delProduct('${p.uuid}')"><i class="bi bi-trash3"></i></a>
        </td>
    </tr>
    `).join('');

}

async function editProduct(uuid){
    let prods = JSON.parse(sessionStorage.getItem('products'));
    let prodData = prods.find(p => p.uuid == uuid);

    document.getElementById('editUUID').textContent = prodData.uuid;
    document.getElementById('editImage').value = prodData.imageUrl;
    document.getElementById('editName').value = prodData.name;
    document.getElementById('editDesc').textContent = prodData.description;
    document.getElementById('editStock').value = prodData.stock;
    document.getElementById('editPPP').value = prodData.pricePerUnit;
    document.getElementById('editCat').value = prodData.category;
    document.getElementById('editUnit').value = prodData.unit;
    document.getElementById('submitEditButton').setAttribute('onclick', `confirmEdit('${prodData.uuid}')`);

    let modal = new bootstrap.Modal(document.getElementById('editItemModal'), {});
    modal.show();
}

async function confirmItemAdd(){
    let newProd = {
        imageUrl: document.getElementById('addImage').value,
        name: document.getElementById('addName').value,
        description: document.getElementById('addDesc').value,
        stock: parseInt(document.getElementById('addStock').value),
        pricePerUnit: parseFloat(document.getElementById('addPPP').value),
        category: document.getElementById('addCat').value,
        unit: document.getElementById('addUnit').value
    }
    //console.log(newProd)

    let link = 'https://products-dasw.onrender.com/api/products';
    let resp = await fetch(link,{
        method : 'POST',
        headers:{
            'x-expediente': '744857',
            'x-auth': 'admin',
            'Content-type':'Application/json'
        },
        body: JSON.stringify(newProd)

    }).catch(err => {
        swal("Error adding the product!", err, "error");
    });
    let data = await resp.json();
    //console.log("DATA")
    //console.log(data)
    swal("Product Added", "" , "success");
    //add the new product to the array
    let prods = JSON.parse(sessionStorage.getItem('products'));
    prods.push(data);
    sessionStorage.setItem('products', JSON.stringify(prods));
    //reloads
    showProductAdminTable();

}

async function confirmEdit(uuid){
    let prods = JSON.parse(sessionStorage.getItem('products'));
    let prodData = prods.find(p => p.uuid == uuid);

    let newData = {
        imageUrl: document.getElementById('editImage').value,
        name: document.getElementById('editName').value,
        description: document.getElementById('editDesc').value,
        stock: document.getElementById('editStock').value,
        pricePerUnit: document.getElementById('editPPP').value,
        category: document.getElementById('editCat').value,
        unit: document.getElementById('editUnit').value
    }
    //console.log("confirmEdit UUID:")

    let link = 'https://products-dasw.onrender.com/api/products/'+prodData.uuid;
    let resp = await fetch(link,{
        method : 'PUT',
        headers:{
            'x-expediente': '744857',
            'x-auth': 'admin',
            'Content-type':'Application/json'
        },
        body: JSON.stringify(newData)

    }).catch(err => {
        swal("Error modding the product!", err, "error");

    });
    let data = await resp.json();
    //console.log("DATA")
    //console.log(data)
    swal("Product Updated", "" , "success");
    //put the new data in the products array
    let index = prods.indexOf(prodData);
    prods[index] = data;
    sessionStorage.setItem('products', JSON.stringify(prods));
    //reloads the page
    showProductAdminTable();
}

function delProduct(uuid){
    let prods = JSON.parse(sessionStorage.getItem('products'));
    let prodData = prods.find(p => p.uuid == uuid);
    swal({
        title: "Are you sure?",
        text: prodData.name + " will be removed",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then(async (willDelete) => {
            if (willDelete) {
                await confirmDelete(prodData.uuid)
            } else {
                swal("The product is safe!");
            }
        });
    showProductAdminTable()
}

async function confirmDelete(uuid){
    link = 'https://products-dasw.onrender.com/product'+uuid;
    let resp = await fetch(link,{
        method : 'DELETE',
        headers:{
            'x-expediente': '744857',
        }
    }).then(
        swal("Product deleted", "" , "success")
    ).catch(err => {
        swal("Error deleting product", err, "error");
    })

}

async function filterByQueries(){
    let prods = JSON.parse(sessionStorage.getItem('fullproducts'));

    let filter = document.getElementById('filterInp').value;
    let minPPU = document.getElementById('minInp').value;
    let maxPPU = document.getElementById('maxInp').value;

    if(minPPU == ''){
        minPPU = 0;
    }
    if(maxPPU == ''){
        maxPPU = 1000000;
    }
    if(filter == ''){
        filter = '.*';
    }
    //console.log(filter);
    //console.log(minPPU);
    //console.log(maxPPU);

    let filtered = prods.filter(p => p.name.match(filter) && p.pricePerUnit >= minPPU && p.pricePerUnit <= maxPPU);

    document.querySelector('#adminTable').innerHTML = filtered.map((p) => `
    <tr uuidRow="${p.uuid}">
        <td><img src="${p.imageUrl}" alt="Image"></td>
        <td>${p.uuid}</td>
        <td>${p.name}</td>
        <td>${p.description}</td>
        <td>${p.stock}</td>
        <td>$${p.pricePerUnit}</td>
        <td>${p.category}</td>
        <td>${p.unit}</td>
        <td>
            <a class="btn btn-outline-secondary" onclick="editProduct('${p.uuid}')"><i class="bi bi-pencil-square"></i></a>
            <a class="btn btn-outline-danger" onclick="delProduct('${p.uuid}')"><i class="bi bi-trash3"></i></a>
        </td>
    </tr>
    `).join('');

}