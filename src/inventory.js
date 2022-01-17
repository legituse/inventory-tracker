let tags = new Set();

function updateQuantity(id, element){
    let quantity = element.parentNode.previousElementSibling.value;
    if (quantity.length !== 0){
        fetch("/updateInv?id="+id+"&quantity="+quantity, {
            "method": "GET",
            "headers": {}
        })
            .then(response => {
                location.reload();
            })
            .catch(err => {
                console.error(err);
            });
    }
}

function deleteItem(id){
    fetch("/deleteItem?id="+id, {
        "method": "GET",
        "headers": {}
    })
        .then(response => {
            location.reload();
        })
        .catch(err => {
            console.error(err);
        });
}

function addTag(elem){
    let tag = elem.parentNode.previousElementSibling;
    tags.add(tag.value);
    tag.value="";
    elem.parentNode.previousElementSibling.previousElementSibling.value = Array.from(tags).join(", ");
}

function createItem(elem){
    var name = elem.parentNode.parentNode.children[0].children[0];
    var quantity = elem.parentNode.parentNode.children[1].children[0];
    if (tags.size > 0 && name.value.length > 3 && !isNaN(quantity.value)){
        fetch("/createItem?name="+name.value+"&quantity="+quantity.value+"&tags="+Array.from(tags), {
            "method": "GET",
            "headers": {}
        })
            .then(response => {
                location.reload();
            })
            .catch(err => {
                console.error(err);
            });
    }
    return false;
}

$( document ).ready(function() {

    $("#csvDownload").click(function () {
        data = JSON.parse(localStorage.getItem("rows"));
        console.log(data)
        let csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Quantity,Tags,\n"
            + data.map(e => e["item_name"]+","+e["item_quantity"]+",\""+JSON.parse(e["item_tags"]).join(", ")+"\"").join(",\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "all_rows.csv");
        document.body.appendChild(link);
        link.click();
    });

    fetch("/getInv", {
        "method": "GET",
        "headers": {}
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("rows", JSON.stringify(data));
            for (const key in data) {
                var updateBtn = "<td><div class=\"input-group mb-2\">" +
                    "  <input type=\"number\" class=\"form-control\" placeholder='Quantity' min='0' >" +
                    "  <div class=\"input-group-append\">" +
                    "    <button class=\"btn btn-outline-secondary\" type=\"button\" onclick='updateQuantity("+data[key].item_id+",this)' >Update</button>" +
                    "  </div>" +
                    "</div></td>"
                var deleteBtn = "<td class='text-center'><button class=\"btn btn-outline-danger\" type=\"button\" onclick='deleteItem("+data[key].item_id+")'>Delete</button></td>"
                $(table).find('tbody').append(
                    "<tr><th scope=\"row\">"+data[key].item_name.toUpperCase()+"</th><td>"+data[key].item_quantity+"</td><td>"+JSON.parse(data[key].item_tags).join(", ")+"</td>"+updateBtn+deleteBtn+"</tr>"
                );
            }
            $(table).find('tbody').append(
                `
                <tr><td colspan="5"></td></tr>
                <tr>
                        <th scope="row"><input name="Name" type="text" class="form-control" placeholder="Enter Name" minlength="3"></th>
                        <td><input class="form-control" name="quantity" type="number" min="0" placeholder="Enter a quantity"></td>
                        <td colspan="2">
                        <div class="input-group">
                               <input type="text" class="form-control" id="displayTags" readonly> 
                               <input type="text" class="form-control" placeholder="Enter Tags" id="inputTag">
                               <span class="input-group-btn">
                                    <button class="btn btn-outline-info" type="button" onclick="addTag(this)">Add</button>
                               </span>
                            </div>
                        </td>
                        <td class="text-center"><input class="btn btn-success btn-lg btn-block" onclick="createItem(this)" value="Submit"></td>
                </tr>
                `
            );
        })
        .catch(err => {
            console.error(err);
        });
});
