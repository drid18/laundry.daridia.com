import { render, html } from "../node_modules/lit-html/lit-html.js";
import { unsafeHTML } from "../node_modules/lit-html/directives/unsafe-html.js";
import { swal } from "../utility/swal.js";
import { session } from './index.js'
import '../utility/html2canvas.js'


var table = null;
var branch = null;
var branchdata = null;

export async function transaction() {
    render(html`
        <div class="container-fluid">
            <h1>DAFTAR TRANSAKSI</h1>
            <hr>
            <p id="data-label" class="text-center bg-light shadow rounded py-3 px-3">Transaksi Hari Ini</p>
            <div class="container-fluid">
                <button id="add-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-plus" aria-hidden="true"></i></button>
                <button id="edit-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                <button id="delete-transaction" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-minus" aria-hidden="true"></i></button>
                <button id="filter-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-filter" aria-hidden="true"></i></button>
                <button id="print-struct-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:50px"><i class="fa fa-print" aria-hidden="true"></i></button>
            </div>
            <div id="table-container">
            </div>
        </div>
    `, $('#content-container')[0])

    swal.showLoading()
    // var dataset = await getTransactionData()
    setTransactionData('/service/transaction/today', { "test": "1" })

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

async function setTransactionData(url, dataparam) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w > h) {
        render(html`
            <table id="table-data" class="table">
            </table>
        `, $("#table-container")[0])
    } else {
        render(html`
            <table id="table-data" class="table" style="width:100%">
            </table>
        `, $("#table-container")[0])
    }

    // console.log(dataset);

    if (table) {
        table.destroy();
        table = null;
    }

    console.log('dataparam ' + JSON.stringify(dataparam));

    var columnlayout;
    if (w > h) {
        columnlayout = [
            { title: "id", data: 'id' },
            { title: "Cabang", data: 'branch_name_view', width: '120px' },
            { title: "tanggal transaksi", data: 'cr_time_view', width: '120px' },
            { title: "pembayaran", data: 'payment_view', width: '120px' },
            { title: "status", data: 'status_view', width: '120px' },
            { title: "pelanggan", data: 'data.customername', width: '150px' },
            { title: "no hp", data: 'customer', width: '150px' },
            { title: "produk", data: 'data.productname', width: '150px' },
            { title: "berat (Kg)", data: 'data.kg', width: '100px' },
            { title: "bayar (Rp)", data: 'amount', width: '100px' },
            { title: "tanggal diubah", data: 'mod_time_view', width: '150px' },
        ]
    } else {
        columnlayout = [
            { title: "Transaksi", data: 'onecolumn', width: '100%' },
        ]
        // columnlayout = [
        //     { title: "Transaksi", data: 'transaction_view', width: '50%' },
        //     { title: "Pelanggan", data: 'customer_view', width: '50%' }
        // ]
    }

    table = $('#table-data').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        autoWidth: true,
        ajax: {
            type: "POST",
            url: url,
            contentType: "application/json",
            data: function (d) {
                return JSON.stringify(dataparam);
            },
            // dataType: 'JSON',
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data
                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                    element.cr_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.cr_time.substring(0, 16).replace('T', ' <br> <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                    element.mod_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.mod_time.substring(0, 16).replace('T', ' <br> <i class="fa fa-clock-o" aria-hidden="true"></i> ')

                    element.status_view = element.status === 0 ? '<p class="bg-danger rounded text-center text-white">Di Proses</p>'
                        : element.status === 1 ? '<p class="bg-warning rounded text-center text-white">Menungu Pengambilan</p>'
                            : '<p class="bg-success rounded text-center text-white">Selesai</p>'

                    element.payment_view = element.payment === 0 ? '<p class="bg-secondary rounded text-center text-white">Belum Lunas</p>'
                        : '<p class="bg-primary rounded text-center text-white">Lunas</p>'

                    element.data = JSON.parse(element.data)

                    element.branch_name_view = element.branch_name !== null ? element.branch_name : "-"

                    element.transaction_view =
                        'ID: ' + element.id + '<br>'
                        + element.cr_time_view + '<br>'
                        + element.status_view
                        + element.payment_view
                    element.customer_view =
                        element.data.customername + '<br>'
                        + element.customer + '<br>'
                        + element.data.kg + ' Kg<br>'
                        + 'Rp ' + element.amount + '<br>'

                    element.onecolumn = `
                        <div class="row bg-secondary rounded text-light justify-content-center mx-2 my-1 py-2">${element.data.productname}</div>
                        <div class="row mx-2 text-start">
                            <div class="col-6">
                                ${element.transaction_view}
                            </div>
                            <div class="col-6">
                                ${element.customer_view}
                            </div>
                        </div>
                    `


                }
                return dataset;
            },
        },
        columns: columnlayout,
        columnDefs: [
            { "className": "dt-center", "targets": "_all" }
        ],
        dom: "frtp",
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close()
            }, 1000);
        }
    })

    $('#add-transaction').on('click', function () {
        addtransaction()
    })
    $('#edit-transaction').on('click', function () {
        var data = table.rows({ selected: true }).data();
        editTransaction(data)
    })
    $('#delete-transaction').on('click', function () {
        var data = table.rows({ selected: true }).data();
        deleteTransaction(data)
    })
    $('#filter-transaction').on('click', function () {
        showFilterOption()
    })
    $('#print-struct-transaction').on('click', function () {
        var data = table.rows({ selected: true }).data();
        printStruct(data)
    })

}

async function printStruct(data) {
    try {
        data[0].id
    } catch (error) {
        swal.showInfo('Pilih transaksi terlebih dulu')
        return;
    }

    console.log(data[0]);

    // var dataparse = JSON.parse(data[0].data)

    swal.showModal('Struk Transaksi', html`
        <div class="d-flex p-2 bd-highlight justify-content-center">
            <div id="struct-print" class="text-start border py-2 px-2" style="width: 300px;">
                <p class="text-center">Laundry Daridia.com</p>
                <p class="text-center">
                    <small>ID Transaksi</small> <br>
                    <b>${data[0].id}</b> <br>
                    <small>${data[0].cr_time.substring(0, 16).replace('T', ' ').replace('Z', ' ')}</small>
                </p>
                <br>-------------------------<br>
                <small>${data[0].data.productname}</small>
                <br>-------------------------<br>
                <div class="row">
                    <div class="col-4">Nama</div>
                    <div class="col-8"><b>${data[0].data.customername}</b></div>
                </div>
                <div class="row">
                    <div class="col-4">No Hp</div>
                    <div class="col-8"><b>${data[0].customer}</b></div>
                </div>
                <div class="row">
                    <div class="col-4">Berat (Kg)</div>
                    <div class="col-8"><b>${data[0].data.kg}</b></div>
                </div>
                -------------------------<br>
                <p class="text-center">
                    <small>Bayar (Rp)</small> <br>
                    <b>Rp ${data[0].data.price} x ${data[0].data.kg} Kg = Rp ${data[0].amount}</b> <br>
                </p>
                -------------------------<br>
                <p class="text-center">
                    <small>Bawa kembali struk transaksi ini dan perlihatkan saat pengambilan laundry</small>
                </p>
            </div>
        </div>
        
        <div class="mb-3 mt-3">
            <button id="print-data" type="button" class="btn btn-outline-dark">Cetak</button>
            <button id="set-filter-data" type="button" class="btn btn-outline-dark">Kirim</button>
            <button id="download-data" type="button" class="btn btn-outline-dark">Download</button>
        </div>
    `)

    $('#print-data').on('click', function () {

        var printContents = document.getElementById('struct-print').innerHTML;
        var originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        document.body.style.fontFamily = 'Consolas, monaco, monospace'
        document.body.style.fontSize = '12pt'
        document.body.style.color = '#000000'

        window.print();

        setTimeout(() => {
            window.location.reload()
        }, 5000);
    })

    $('#download-data').on('click', function () {

        var printContents = document.getElementById('struct-print');
        html2canvas(printContents).then(function (canvas) {
            // document.body.appendChild(canvas);
            window.saveAs(canvas.toDataURL("image/jpeg"), 'struk-laundry.jpeg');
        });
    })

}

async function showFilterOption() {
    swal.showModal('Filter Data Transaksi', html`
        <div class="d-grid gap-2 mb-3">
            <button id="filter-this-month" class="btn btn-outline-dark" type="button">Transaksi Bulan Ini</button>
            <button id="filter-not-done" class="btn btn-outline-dark" type="button">Transaksi Belum Selesai</button>
        </div>
        <div class="form-floating mb-3">
            <input type="date" class="form-control" id="input-start-date">
            <label>Tanggal Awal</label>
        </div>
        <div class="form-floating mb-3">
            <input type="date" class="form-control" id="input-end-date">
            <label>Tanggal Akhir</label>
        </div>
        <div class="form-floating mb-3">
            <select class="form-select" id="input-status">
                <option value="99">Semua</option>
                <option value="0">Di Proses</option>
                <option value="1">Menunggu Pengambilan</option>
                <option value="2">Selesai</option>
            </select>
            <label for="edit-input-status">Status</label>
        </div>
        <div class="form-floating mb-3">
            <select class="form-select" id="input-payment">
                <option value="99">Semua</option>
                <option value="0">Belum Lunas</option>
                <option value="1">Lunas</option>
            </select>
            <label for="edit-input-payment">Pembayaran</label>
        </div>
        <div class="mb-3">
            <button id="set-filter-data" type="button" class="btn btn-outline-dark">Filter Data</button>
        </div>
    `)

    $('#input-start-date').val(new Date().toISOString().substring(0, 10))
    $('#input-end-date').val(new Date().toISOString().substring(0, 10))

    $('#set-filter-data').on('click', function () {
        $('#data-label').html(`
            Transaksi Dari <b>${$('#input-start-date').val()}</b> sampai <b>${$('#input-end-date').val()}</b><br>
            Status: <b>${$('#input-status option:selected').text()}</b><br>
            Pembayaran: <b>${$('#input-payment option:selected').text()}</b>
        `)

        var data = {
            "start": $('#input-start-date').val(),
            "end": $('#input-end-date').val(),
            "status": $('#input-status').val(),
            "payment": $('#input-payment').val()
        }
        swal.showLoading('Memproses Data')
        setTransactionData('/service/transaction/filtered', data)
    })

    $('#filter-this-month').on('click', function () {
        $('#data-label').html(`
            Transaksi Dari Bulan Ini
        `)
        var curdate = new Date()
        var start = `${curdate.getFullYear()}-${curdate.getMonth() + 1}-01`
        var end = `${curdate.getFullYear()}-${curdate.getMonth() + 1}-${curdate.getDate()}`

        var data = {
            "start": start,
            "end": end,
            "status": $('#input-status').val(),
            "payment": $('#input-payment').val()
        }
        swal.showLoading('Memproses Data')
        setTransactionData('/service/transaction/filtered', data)
    })

    $('#filter-not-done').on('click', function () {
        $('#data-label').html(`
            Transaksi Belum Selesai
        `)
        swal.showLoading('Memproses Data')
        setTransactionData('/service/transaction/incomplete', {})
    })


}

async function addtransaction() {

    await new Promise(async function (resolve, reject) {
        if (session.data.type !== 2) {
            swal.showLoading()
            var brachlist = await getBranchList();
            swal.showModal('Pilih cabang', html`
                <div class="form-floating mb-3">
                    <select class="form-select" id="input-branch">
                        <option></option>
                        ${brachlist.map(item => html`<option value="${item.id}">${item.name}</option>`)}
                    </select>
                    <label for="input-branch">Cabang</label>
                </div>
            `)
            $('#input-branch').on('change', function () {
                branch = $('#input-branch').val();
                console.log('branch :' + branch);
                resolve(true)
            })
        } else {
            branch = session.data.branch
            resolve(true)
        }
    })

    branchdata = await getBranchData(branch)

    swal.showModal('Input Nomor Pelanggan', html`
        <p>${branchdata.name}(${branchdata.id})</p>
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
                        value="${item.phone_number}">${item.phone_number} - ${item.fullname}</button>`)}
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

    var result = [{ phone_number: phone_number, fullname: '', address: '' }]

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
            <input disabled type="text" class="form-control" value="${branchdata.name}(${branchdata.id})">
            <label >Cabang</label>
        </div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="input-customer-number" value="${result[0].phone_number}">
            <label for="floatingInput">Nomor Pelanggan</label>
        </div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="input-customer-name" value="${result[0].fullname}">
            <label for="input-customer-name">Nama Pelanggan</label>
        </div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="input-customer-address" value="${result[0].address}">
            <label for="input-customer-address">Alamat Pelanggan</label>
        </div>
        <div class="form-floating  mb-3">
            <select class="form-select" id="input-data-product" aria-label="Floating label select example">
                <option value="-">Pilih Produk...</option>
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
        `)



    // $('#input-data-product').val(productList[0].id).change();

    if (isNewMember) {
        $('#input-customer-number').prop("disabled", false);
        $('#input-customer-name').prop("disabled", false);
        $('#input-customer-address').prop("disabled", false);
    }
    else {
        $('#input-customer-number').prop("disabled", true);
        $('#input-customer-name').prop("disabled", true);
        $('#input-customer-address').prop("disabled", true);
    }

    $('#input-data-product').on('change', function () {
        try {
            var id = this.value
            console.log(id);
            var product = productList.find(item => item.id == id)
            console.log(product);
            var jsonrules = JSON.parse(product.rules)
            $('#input-data-amount-per').val(jsonrules.price)
            $('#input-data-amount').val('')
            $('#input-data-weight').val('')
        } catch (error) {
            $('#input-data-amount-per').val('')
            $('#input-data-amount').val('')
            $('#input-data-weight').val('')
        }
    })

    $('#input-data-weight').on('input', function () {
        var per = parseInt($('#input-data-amount-per').val())
        var weight = parseInt($('#input-data-weight').val())
        var total = per * weight
        $('#input-data-amount').val(total)
    })

    $('#confirmButton').on('click', function () {
        const options = {
            method: 'POST',
            url: '/service/transaction/add',
            headers: { 'Content-Type': 'application/json' },
            data: {
                user: 'All User',
                customer: $('#input-customer-number').val(),
                product: $('#input-data-product').val(),
                payment: 0,
                amount: $('#input-data-amount').val(),
                status: 0,
                branch: branchdata.id,
                data: JSON.stringify({
                    kg: $('#input-data-weight').val(),
                    price: $('#input-data-amount-per').val(),
                    productname: $('#input-data-product option:selected').text(),
                    customername: $('#input-customer-name').val(),
                    customeraddress: $('#input-customer-address').val(),
                })
            }
        };

        swal.showLoading()
        axios.request(options).then(function (response) {
            console.log(response.data);
            swal.showSuccess("Transaksi Baru Berhasil Ditambahkan!")
            window.location.reload();
        }).catch(function (error) {
            console.error(error);
        });
    })

    $('#cancelButton').on('click', function () {
        swal.close()
    })
}

async function editTransaction(data) {
    try {
        data[0].id
    } catch (error) {
        swal.showInfo('Pilih transaksi terlebih dulu')
        return;
    }

    swal.showLoading()
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

    swal.showModal('Ubah Data Transaksi', html`
            <div class="form-floating mb-3">
                <input disabled type="text" class="form-control" id="input-customer-number" value="${data[0].customer}">
                <label for="input-customer-number">Nomor Pelanggan</label>
            </div>
            <div class="form-floating mb-3">
                <input disabled type="text" class="form-control" id="input-customer-name" value="${data[0].data.customername}">
                <label for="input-customer-name">Nama Pelanggan</label>
            </div>
            <div class="form-floating mb-3">
                <input disabled type="text" class="form-control" id="input-product-name" value="${data[0].data.productname}">
                <label for="input-product-name">Produk</label>
            </div>
            <div class="form-floating mb-3">
                <input disabled type="text" class="form-control" id="input-product-amount" value="Rp ${data[0].amount}">
                <label for="input-product-amount">Jumlah Bayar</label>
            </div>
            <div class="form-floating mb-3">
                <select class="form-select" id="edit-input-status" value="${data[0].status}">
                    <option value="0">Di Proses</option>
                    <option value="1">Menunggu Pengambilan</option>
                    <option value="2">Selesai</option>
                </select>
                <label for="edit-input-status">Status</label>
            </div>
            <div class="form-floating mb-3">
                <select class="form-select" id="edit-input-payment" value="${data[0].payment}">
                    <option value="0">Belum Lunas</option>
                    <option value="1">Lunas</option>
                </select>
                <label for="edit-input-payment">Pembayaran</label>
            </div>
            <div class="mb-3">
                <button id="input-edit-transaction" type="button" class="btn btn-outline-dark">Ubah Produk</button>
            </div>
        `)

    $("#edit-input-status").val(data[0].status).change();
    $("#edit-input-payment").val(data[0].payment).change();

    $('#input-edit-transaction').on('click', function () {

        const options = {
            method: 'POST',
            url: '/service/transaction/update',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "id": data[0].id,
                "user": data[0].user,
                "customer": data[0].customer,
                "product": data[0].product,
                "payment": $('#edit-input-payment').val(),
                "amount": data[0].amount,
                "status": $('#edit-input-status').val()
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

async function deleteTransaction(data) {

    try {
        data[0].id
    } catch (error) {
        swal.showInfo('Pilih transaksi terlebih dulu')
        return;
    }

    swal.showModal('Yakin ingin menghapus data ini?', html`
        <div class="mb-3">
            <hr>
            <b><small>Pelanggan</small></b>
            <p>${data[0].customer}</p>
            <b><small>Jumlah Bayar</small></b>
            <p>${data[0].amount}</p>
            <b><small>Status Bayar</small></b>
            <p>${unsafeHTML(data[0].payment_view)}</p>
            <b><small>Status Cucian</small></b>
            <p>${unsafeHTML(data[0].status_view)}</p>
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
            url: '/service/transaction/delete',
            headers: { 'Content-Type': 'application/json' },
            data: { id: data[0].id }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            swal.showSuccess("Data Berhasil di Hapus")
            window.location.reload()
        }).catch(function (error) {
            swal.showFailed('Gagal')
            console.error(error);
        });
    })
}

async function getBranchList() {
    return await new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            url: '/service/branch'
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data.data)
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })
}
async function getBranchData(id) {
    return await new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            url: '/service/branch/id',
            data: { id: id }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data.data)
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })
}