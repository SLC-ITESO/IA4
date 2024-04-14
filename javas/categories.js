async function loadCategData(){
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

    showCategCardsData(data)
}
function showCategCardsData(prodsArray) {
    let category = sessionStorage.getItem('categoria');
    console.log(category);

    //filtra los productos que coincidan con la categoria seleccionada
    prodsArray = prodsArray.filter(prod => prod.category == category)
    //console.log("PRODS ARRAY")
    //console.log(prodsArray)
    document.querySelector('#BAT').innerHTML = category.toUpperCase()

    paginateData(prodsArray)
}

