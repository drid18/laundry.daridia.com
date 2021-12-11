import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

var table

export async function customer() {
    render(html`
        <div class="container">
            <h1>DAFTAR PELANGGAN</h1>
            <hr>
            <div class="container">
                <button id="add-customer" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-plus" aria-hidden="true"></i></button>
                <button id="edit-customer" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                <button id="delete-customer" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-minus" aria-hidden="true"></i></button>
                <div id="table-container" style="min-width:100%">
                </div>
            </div>
        </div>
    `, $('#content-container')[0])

    swal.showLoading()
    setCustomerData()
}
async function setCustomerData() {
    render(html`
        <table id="table-data" class="table">
        </table>
    `, $("#table-container")[0])

    table = $('#table-data').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: '/service/customer',
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
                }
                return dataset;
            },
        },
        columns: [
            { title: "id", data: 'id' },
            { title: "nama", data: 'fullname', width: '200px' },
            { title: "nomor hp", data: 'phone_number', width: '150px' },
            { title: "alamat", data: 'address', width: '150px' },
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

    $('#add-customer').on('click', function () {
        addCustomer()
    })
    $('#edit-customer').on('click', function () {
        var data = table.rows({ selected: true }).data();
        editCustomer(data)
    })
    $('#delete-customer').on('click', function () {
        var data = table.rows({ selected: true }).data();
        deleteCustomert(data)
    })
}

async function addCustomer() {
    swal.showModal('Tambah Pelanggan Baru', html`
            <div class="form-floating mb-3">
                <input type="email" class="form-control" id="input-name">
                <label for="edit-input-name">Nama Pelanggan</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-phone">
                <label for="edit-input-phone">Nomor HP</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-address">
                <label for="edit-input-address">Alamat</label>
            </div>
            <div class="mb-3">
                <button id="input-new-customer" type="button" class="btn btn-outline-dark">Daftarkan Pelanggan Baru</button>
            </div>
    `)

    $('#input-new-customer').on('click', function () {
        var name = $('#input-name').val()
        var phone_number = $('#input-phone').val()
        var address = $('#input-address').val()

        if (name && phone_number && address) {
            swal.showLoading()
            const options = {
                method: 'POST',
                url: '/service/customer/add',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    fullname: name,
                    phone_number: phone_number,
                    address: address
                }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
                swal.showSuccess('Pelanggan berhasil ditambahkan')
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

async function editCustomer(data) {
    console.log(data[0]);
    swal.showModal('Ubah Data Pelanggan', html`
            <div class="form-floating mb-3">
                <input type="email" class="form-control" id="edit-input-name" value="${data[0].fullname}">
                <label for="edit-input-name">Nama Pelanggan</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-phone" value="${data[0].phone_number}">
                <label for="edit-input-phone">Nomor HP</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-address" value="${data[0].address}">
                <label for="edit-input-address">Alamat</label>
            </div>
            <div class="mb-3">
                <button id="input-edit-customer" type="button" class="btn btn-outline-dark">Ubah Data Pelanggan</button>
            </div>
        `)

    $('#input-edit-customer').on('click', function () {

        var edit_name = $('#edit-input-name').val()
        var edit_phone = $('#edit-input-phone').val()
        var edit_address = $('#edit-input-address').val()

        const options = {
            method: 'POST',
            url: '/service/customer/update',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: data[0].id,
                fullname: edit_name,
                phone_number: edit_phone,
                address: edit_address,
            }
        };
        console.log(options);
        swal.showLoading()
        axios.request(options).then(function (response) {
            console.log(response.data);
            swal.showSuccess('Berhasil mengubah data')
            window.location.reload()
        }).catch(function (error) {
            swal.showFailed('Gagal')
            console.error(error);
        });
    })
}

