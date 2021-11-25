import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

export async function transaction() {
    render(html`
        <div class="container">
            <h1>DAFTAR TRANSAKSI</h1>
            <hr>
            <div class="container">
                <button id="add-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:150px">Tambah Transaksi</button>
                <button id="edit-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:150px">Edit Transaksi</button>
                <button id="delete-transaction" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3"
                    style="width:150px">Hapus Transaksi</button>
                <div id="table-container" style="min-width:100%">
                </div>
            </div>
        </div>
    `, $('#content-container')[0])

    swal.showLoading()
    // var dataset = await getTransactionData()
    setTransactionData()

}

async function getTransactionData() {
    const options = {
        method: 'POST',
        url: '/service/transaction',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var result = await new Promise(function (resolve, reject) {
        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data)
        }).catch(function (error) {
            reject(error)
            console.error(error);
        });
    })

    return result.data
}

async function setTransactionData() {
    render(html`
        <table id="table-data" class="table">
        </table>
    `, $("#table-container")[0])

    // console.log(dataset);

    var table = $('#table-data').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: '/service/transaction',
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
            { title: "tanggal transaksi", data: 'cr_time_view', width: '150px' },
            { title: "tanggal diubah", data: 'mod_time_view', width: '150px' },
            { title: "karyawan", data: 'user' },
            { title: "pelanggan", data: 'customer' },
            { title: "produk", data: 'product' },
            { title: "pembayaran", data: 'payment' },
            { title: "data", data: 'data' },
            { title: "jumlah", data: 'amount' },
            { title: "status", data: 'status' },

        ],
        columnDefs: [
            { "className": "dt-center", "targets": "_all" }
        ],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close()
            }, 1000);
        }
    })

    $('#add-transaction').on('click', function () {
        addtransaction()
    })

}

async function addtransaction() {

    swal.showModal('Input Nomor Pelanggan', html`
        <div autocomplete="off" class="form-floating mb-3">
            <input autocomplete="off" type="text" class="form-control" id="input-phone">
            <label for="floatingInput">Nomor Pelanggan</label>
        </div>
        <small><i id="type-status"></i></small>
        <div id="numberlist" class="list-group mb-3"></div>
        <div id="new-member" class="mb-3">
            <button id="input-new-member" type="button" class="btn btn-outline-dark">Daftar Pelanggan Baru</button>
        </div>
    `)

    $('#new-member').hide()

    var keyuptimeout = null
    $('#input-phone').on('keyup', function () {
        $('#type-status').html('typing...')
        clearTimeout(keyuptimeout)
        keyuptimeout = setTimeout(function () {
            $('#type-status').html('searching...')
            console.log('kita search');
            const options = {
                method: 'POST',
                url: '/service/customer/find/phone',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { number: $('#input-phone').val() }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
                var data = response.data.data

                if (data.length > 0) {
                    $('#type-status').html('pilih nomor pelanggan')
                    render(html`
                    ${data.map((item) => html`<button type="button" class="list-group-item list-group-item-action selectednumber"
                        value="${item.phone_number}">${item.phone_number}</button>`)}
                        `, $('#numberlist')[0])
                    $('#new-member').hide()
                    $('.selectednumber').on('click', function () {
                        console.log(this.value);
                        inputTransaction(this.value, false)
                        swal.showLoading()
                    })
                } else {
                    $('#type-status').html('nomor pelanggan tidak ditemukan')
                    render(html``, $('#numberlist')[0])
                    $('#new-member').show()
                    $('#input-new-member').on('click', function () {
                        inputTransaction($('#input-phone').val(), true)
                    })
                }
            }).catch(function (error) {
                console.error(error);
            });
        }, 1000)
    })
}

async function inputTransaction(phone_number, isNewMember) {

    var result = [{ phone_number: phone_number, fullname: '' }]

    if (!isNewMember) {
        result = await new Promise(function (resolve, reject) {
            const options = {
                method: 'POST',
                url: '/service/customer/find/phone',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { number: phone_number }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
                var data = response.data.data
                resolve(data)
            }).catch(function (error) {
                console.error(error);
                reject(error)
            });
        })
    }

    var productList = await new Promise(function (resolve, reject) {
        const options = {
            method: 'POST',
            url: '/service/product',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data.data)
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })

    swal.showModal('Input Transaksi', html`
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="input-customer-number" value="${result[0].phone_number}">
            <label for="floatingInput">Nomor Pelanggan</label>
        </div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="input-customer-name" value="${result[0].fullname}">
            <label for="input-customer-name">Nama Pelanggan</label>
        </div>
        <div class="form-floating  mb-3">
            <select class="form-select" id="input-data-product" aria-label="Floating label select example">
                ${productList.map((item) => html`<option value="${item.id}">${item.name}</option>`)}
            </select>
            <label for="floatingSelect">Produk</label>
        </div>
        <div class="form-floating mb-3">
            <input type="number" class="form-control" id="input-data-weight">
            <label for="floatingInput">Berat (KG)</label>
        </div>
        <div class="form-floating mb-3">
            <input disabled type="number" class="form-control" id="input-data-amount-per">
            <label for="floatingInput">Harge Per (KG)</label>
        </div>
        <div class="form-floating mb-3">
            <input disabled type="number" class="form-control" id="input-data-amount">
            <label for="floatingInput">Total Bayar (RP)</label>
        </div>
        <div class="mb-3">
            <button id="confirmButton" type="button" class="btn btn-outline-dark">Input</button>
            <button id="cancelButton" type="button" class="btn btn-outline-dark">Batalkan</button>
        </div>
    `, function () {
        Swal.fire('Wadaww!', '', 'success')
    })

    if (isNewMember) {
        $('#input-customer-number').prop("disabled", false);
        $('#input-customer-name').prop("disabled", false);
    }
    else {
        $('#input-customer-number').prop("disabled", true);
        $('#input-customer-name').prop("disabled", true);
    }

    $('#input-data-product').on('change', function () {
        var id = this.value
        console.log(id);
        var product = productList.find( item => item.id == id)
        console.log(product);
        var jsonrules = JSON.parse(product.rules)
        $('#input-data-amount-per').val(jsonrules.price)
    })

    $('#input-data-weight').on('input', function () {
        var per = parseInt($('#input-data-amount-per').val())
        var weight = parseInt($('#input-data-weight').val())
        var total = per * weight
        $('#input-data-amount').val(total)
    })

    $('#confirmButton').on('click', function () {

    })

    $('#cancelButton').on('click', function () {
        swal.close()
    })
}