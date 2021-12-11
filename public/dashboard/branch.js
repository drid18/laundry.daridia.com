import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

var table

export async function branch() {
    render(html`
        <div class="container">
            <h1>DAFTAR CABANG</h1>
            <hr>
            <div class="container">
                <button id="add-branch" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-plus" aria-hidden="true"></i></button>
                <button id="edit-branch" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                <button id="delete-branch" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-minus" aria-hidden="true"></i></button>
                <div id="table-container" style="min-width:100%">
                </div>
            </div>
        </div>
    `, $('#content-container')[0])

    swal.showLoading()
    setBranchData()
}
async function setBranchData() {
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
            url: '/service/branch',
            // timeout: 10000,
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data
                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                }
                return dataset;
            },
        },
        columns: [
            { title: "id", data: 'id' },
            { title: "nama cabang", data: 'name', width: '200px' },
            { title: "alamat", data: 'address', width: '300px' }
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

    $('#add-branch').on('click', function () {
        addBranch()
    })
    $('#edit-branch').on('click', function () {
        var data = table.rows({ selected: true }).data();
        editBranch(data)
    })
    $('#delete-branch').on('click', function () {
        var data = table.rows({ selected: true }).data();
        deleteBranch(data)
    })
}

async function addBranch() {
    swal.showModal('Tambah Cabang Baru', html`
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-name">
                <label for="input-name">Nama Cabang</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-address">
                <label for="input-address">Alamat Cabang</label>
            </div>
            <div class="mb-3">
                <button id="input-new-branch" type="button" class="btn btn-outline-dark">Daftarkan Cabang Baru</button>
            </div>
    `)

    $('#input-new-branch').on('click', function () {
        var name = $('#input-name').val()
        var address = $('#input-address').val()

        if (name && address) {
            swal.showLoading()
            const options = {
                method: 'POST',
                url: '/service/branch/add',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    name: name,
                    address: address
                }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
                swal.showSuccess('Cabang berhasil ditambahkan')
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

async function editBranch(data) {
    console.log(data[0]);
    swal.showModal('Ubah Data Cabang', html`
            <div class="form-floating mb-3">
                <input type="email" class="form-control" id="edit-input-name" value="${data[0].name}">
                <label for="edit-input-name">Nama Cabang</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-address" value="${data[0].address}">
                <label for="edit-input-address">Alamat</label>
            </div>
            <div class="mb-3">
                <button id="input-edit-customer" type="button" class="btn btn-outline-dark">Ubah Data Cabang</button>
            </div>
        `)

    $('#input-edit-customer').on('click', function () {

        var edit_name = $('#edit-input-name').val()
        var edit_address = $('#edit-input-address').val()

        const options = {
            method: 'POST',
            url: '/service/branch/update',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: data[0].id,
                name: edit_name,
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

