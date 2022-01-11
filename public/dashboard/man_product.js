import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

var table

export async function product() {
    render(html`
        <div class="container">
            <h1>DAFTAR PRODUK</h1>
            <hr>
            <div class="container">
                <button id="add-product" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-plus" aria-hidden="true"></i></button>
                <button id="edit-product" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                <button id="delete-product" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-minus" aria-hidden="true"></i></button>
                <div id="table-container" style="min-width:100%">
                </div>
            </div>
        </div>
    `, $('#content-container')[0])

    swal.showLoading()

    setProductData()

}

async function setProductData() {
    render(html`
        <table id="table-data" class="table">
        </table>
    `, $("#table-container")[0])

    // console.log(dataset);

    table = $('#table-data').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: '/service/product',
            // timeout: 10000,
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data
                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                    element.cr_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.cr_time.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                    element.mod_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.mod_time.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')

                    var rules = JSON.parse(element.rules)
                    element.price = 'Rp ' + rules.price + '/KG'

                    element.status_view = element.status === 1 ? 'Aktif' : 'Tidak Aktif'
                }
                return dataset;
            },
        },
        columns: [
            { title: "id", data: 'id' },
            { title: "nama", data: 'name', width: '250px' },
            { title: "deskripsi", data: 'description', width: '250px' },
            { title: "Harga (KG)", data: 'price', width: '100px'  },
            // { title: "status", data: 'status_view' },
            { title: "tanggal dibuat", data: 'cr_time_view', width: '150px' },
            { title: "tanggal diubah", data: 'mod_time_view', width: '150px' },
        ],
        dom: "frtp",
        // columnDefs: [
        //     { "className": "dt-center", "targets": "_all" }
        // ],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close()
            }, 1000);
        }
    })

    $('#add-product').on('click', function () {
        addProduct()
    })
    $('#edit-product').on('click', function () {
        var data = table.rows({ selected: true }).data();
        editProduct(data)
    })
    $('#delete-product').on('click', function () {
        var data = table.rows({ selected: true }).data();
        deleteProduct(data)
    })

}

async function addProduct() {
    swal.showModal('Tambah Produk Baru', html`
        <div class="form-floating mb-3">
            <input type="email" class="form-control" id="input-name">
            <label for="input-name">Nama Produk</label>
        </div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="input-desc">
            <label for="input-desc">Deskripsi Produk</label>
        </div>
        <div class="form-floating mb-3">
            <input type="number" class="form-control" id="input-price">
            <label for="input-price">harga per KG</label>
        </div>
        <!-- <div class="form-floating mb-3">
            <select class="form-select" id="input-status">
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
            </select>
            <label for="input-status">Status</label>
        </div> -->
        <div class="mb-3">
            <button id="input-new-product" type="button" class="btn btn-outline-dark">Daftarkan Produk Baru</button>
        </div>
    `)

    $('#input-new-product').on('click', function () {
        var name = $('#input-name').val()
        var description = $('#input-desc').val()
        var price = $('#input-price').val()
        // var status = $('#input-status').val()

        if (name && description && price) {
            swal.showLoading()
            const options = {
                method: 'POST',
                url: '/service/product/add',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    name: name,
                    description: description,
                    price: price
                }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
                swal.showSuccess('Produk berhasil ditambahkan')
                window.location.reload()
            }).catch(function (error) {
                swal.showFailed('Gagal')
                console.error(error);
            });
        } else {
            swal.showFailed('Semua kolom harus di isi')
        }
    })
}

async function editProduct(data) {
    console.log(data[0]);
    swal.showModal('Ubah Produk', html`
            <div class="form-floating mb-3">
                <input type="email" class="form-control" id="edit-input-name" value="${data[0].name}">
                <label for="edit-input-name">Nama Produk</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-desc" value="${data[0].description}">
                <label for="edit-input-desc">Deskripsi Produk</label>
            </div>
            <div class="form-floating mb-3">
                <input type="number" class="form-control" id="edit-input-price" value="${JSON.parse(data[0].rules).price}">
                <label for="edit-input-price">harga per KG</label>
            </div>
            <!-- <div class="form-floating mb-3">
                <select class="form-select" id="edit-input-status" value="${data[0].status}">
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                </select>
                <label for="edit-input-status">Status</label>
            </div> -->
            <div class="mb-3">
                <button id="input-edit-product" type="button" class="btn btn-outline-dark">Ubah Produk</button>
            </div>
        `)

    // $("#edit-input-status").val(data[0].status).change();

    $('#input-edit-product').on('click', function () {

        var edit_name = $('#edit-input-name').val()
        var edit_description = $('#edit-input-desc').val()
        var edit_price = $('#edit-input-price').val()
        // var edit_status = $('#edit-input-status').val()

        console.log(edit_name);
        console.log(edit_description);
        console.log(edit_price);
        // console.log(edit_status);

        const options = {
            method: 'POST',
            url: '/service/product/update',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: data[0].id,
                name: edit_name,
                description: edit_description,
                price: edit_price,
                // status: data[0].status
            }
        };
        console.log(options);
        swal.showLoading()
        axios.request(options).then(function (response) {
            console.log(response.data);
            swal.showSuccess('Berhasil mengubah data')
            // window.location.reload()
            table.ajax.reload()
        }).catch(function (error) {
            swal.showFailed('Gagal')
            console.error(error);
        });
    })
}

async function deleteProduct(data) {

    swal.showModal('Yakin ingin menghapus data ini?', html`
        <div class="mb-3">
            <hr>
            <b><small>Produk</small></b>
            <p>${data[0].name}</p>
            <b><small>Deskripsi</small></b>
            <p>${data[0].description}</p>
            <hr>
            <button id="confirm-delete" type="button" class="btn btn-outline-danger">Yakin</button>
            <button id="cancel-delete" type="button" class="btn btn-outline-dark">Tidak</button>
        </div>
    `)

    $('#cancel-delete').on('click', function () {
        swal.close()
    })
    $('#confirm-delete').on('click', function () {
        swal.showLoading()
        const options = {
            method: 'POST',
            url: '/service/product/delete',
            headers: { 'Content-Type': 'application/json' },
            data: { id: data[0].id }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            swal.showSuccess("Data Berhasil di Hapus")
            // window.location.reload()
            table.ajax.reload()
        }).catch(function (error) {
            swal.showFailed('Gagal')
            console.error(error);
        });
    })



}