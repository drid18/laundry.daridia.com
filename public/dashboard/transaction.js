import { render, html } from "../node_modules/lit-html/lit-html.js";
import { unsafeHTML } from "../node_modules/lit-html/directives/unsafe-html.js";
import { swal } from "../utility/swal.js";
import { session } from './index.js'
import '../utility/html2canvas.js'

var table = null;
var branch = null;
var branchdata = null;

export async function transaction() {

    // var branch = sessionStorage.getItem("branch")
    console.log(branch);
    if (branch === 'null') branch = null
    // branch = session.data.branch
    if (branch === null) {
        await new Promise(async function (resolve, reject) {
            if (session.data.type !== 2) {
                // swal.showLoading()
                // var brachlist = await getBranchList();
                // swal.showModal('Pilih cabang', html`
                //     <div class="form-floating mb-3">
                //         <select class="form-select" id="input-branch">
                //             <option></option>
                //             <option value="all">Semua Cabang</option>
                //             ${brachlist.map(item => html`<option value="${item.id}">${item.name}</option>`)}
                //         </select>
                //         <label for="input-branch">Cabang</label>
                //     </div>
                // `)
                // $('#input-branch').on('change', function () {
                //     if ($('#input-branch').val() !== 'all') branch = $('#input-branch').val();
                //     else branch = null
                //     console.log('branch :' + branch);
                //     sessionStorage.setItem("branch", branch)
                //     resolve(true)
                // })

                await getUserConfig()
                console.log('branch :' + branch);
                sessionStorage.setItem("branch", branch)
                resolve(true)
            } else {
                branch = session.data.branch
                resolve(true)
            }
        })
    } else {
        if (session.data.type === 2) {
            branch = session.data.branch
        }
    }

    render(html`
        <div class="container-fluid">
            <h1>DAFTAR TRANSAKSI</h1>
            <small id="cabang-name"></small>
            <button id="btn-change-branch" type="button" class="btn btn-sm btn-outline-dark float-right ms-3 mt-3 mb-3"
                style="width:50px">ganti</button>
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

    $('#btn-change-branch').on('click', async function () {
        // sessionStorage.setItem("branch", null)
        swal.showLoading()
        var brachlist = await getBranchList();
        swal.showModal('Pilih cabang', html`
            <div class="form-floating mb-3">
                <select class="form-select" id="input-branch">
                    <option></option>
                    <option value="all">Semua Cabang</option>
                    ${brachlist.map(item => html`<option value="${item.id}">${item.name}</option>`)}
                </select>
                <label for="input-branch">Cabang</label>
            </div>
        `)
        $('#input-branch').on('change', function () {
            if ($('#input-branch').val() !== 'all') branch = $('#input-branch').val();
            else branch = null
            console.log('branch :' + branch);
            sessionStorage.setItem("branch", branch)
            setUserConfig(branch)
            window.location.reload()
        })
       
    })

    if (branch) {
        branchdata = await getBranchData(branch)
        $('#cabang-name').html(branchdata.name)
    } else {
        $('#cabang-name').html('Semua cabang')
    }

    swal.showLoading()
    setTransactionData('/service/transaction/today', { "test": "1" })
}

async function getUserConfig(){

    await new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: '/service/user/getconfig',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {userid: session.data.id}
          };

          console.log(options);
          
          axios.request(options).then(function (response) {
            console.log(response.data);
    
            if(response.data.data !== null){
                branch = response.data.data.branch
                console.log('get branch: ' + branch);
                resolve(true)
            } else {
                branch = null;
                setUserConfig(branch)
                resolve(true)
            }
    
          }).catch(function (error) {
            console.error(error);
            resolve(true)
          });
    });
    
}

function setUserConfig (branch) { 
    const options = {
        method: 'POST',
        url: '/service/user/setconfig',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {userid: session.data.id, branch: branch}
      };
      
      axios.request(options).then(function (response) {
        console.log(response.data);
        resolve(true)
      }).catch(function (error) {
        console.error(error);
        resolve(true)
      });
 }

async function getPageConfig(){
    var configData = await new Promise(function (resolve, reject) {
        const options = {
            method: 'POST',
            url: '/service/config/getall'
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            var configresult = response.data;
            resolve(configresult);
        }).catch(function (error) {
            resolve(null);
            console.error(error);
        });
    });
    return configData
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

    // console.log('dataparam ' + JSON.stringify(dataparam));

    var columnlayout;
    if (w > h) {
        columnlayout = [
            { title: "id", data: 'id' },
            { title: "Cabang", data: 'branch_name_view', width: '120px' },
            { title: "tanggal transaksi", data: 'cr_time_view', width: '120px' },
            { title: "tanggal selesai", data: 'finish_date_view', width: '120px' },
            { title: "status", data: 'status_view', width: '120px' },
            { title: "tanggal lunas", data: 'paid_date_view', width: '150px' },
            { title: "pembayaran", data: 'payment_view', width: '120px' },
            { title: "pelanggan", data: 'data.customername', width: '150px' },
            { title: "no hp", data: 'customer', width: '150px' },
            { title: "produk", data: 'product_view', width: '150px' },
            { title: "berat (Kg)", data: 'kg_view', width: '100px' },
            { title: "Harga Awal (Rp)", data: 'realamount', width: '100px' },
            { title: "Diskon (%)", data: 'discount', width: '100px' },
            { title: "Jumlah Bayar (%)", data: 'amount', width: '100px' },
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

    // console.log('branch:', branch);
    // console.log('branch:', sessionStorage.getItem("branch"));
    branch = sessionStorage.getItem("branch")
    if (branch === 'null') branch = null

    table = $('#table-data').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        autoWidth: true,
        ajax: {
            type: "POST",
            url: url + (branch ? '?b=' + branch : ''),
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
                    if (element.paid_date) element.paid_date_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.paid_date.substring(0, 16).replace('T', ' <br> <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                    else element.paid_date_view = `<i class="fa fa-times" aria-hidden="true"></i>`
                    if (element.finish_date) element.finish_date_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.finish_date.substring(0, 16).replace('T', ' <br> <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                    else element.finish_date_view = `<i class="fa fa-times" aria-hidden="true"></i>`
                    element.status_view = element.status === 0 ? '<p class="bg-danger rounded text-center text-white">Di Proses</p>'
                        : element.status === 1 ? '<p class="bg-warning rounded text-center text-white">Menungu Pengambilan</p>'
                            : '<p class="bg-success rounded text-center text-white">Selesai</p>'

                    element.payment_view = element.payment === 0 ? '<p class="bg-secondary rounded text-center text-white">Belum Lunas</p>'
                        : '<p class="bg-primary rounded text-center text-white">Lunas</p>'

                    element.data = JSON.parse(element.data)

                    try {
                      var productList = element.data.datatrx;
                      if (productList) {
                        element.product_view = "<ol>";
                        for (let x = 0; x < productList.length; x++) {
                          element.product_view += `<li>${productList[x].productname}</li>`;
                        }
                        element.product_view += "</ol>";

                        element.kg_view = "<ol>";
                        for (let x = 0; x < productList.length; x++) {
                          element.kg_view += `<li>${productList[x].kg} Kg</li>`;
                        }
                        element.kg_view += "</ol>";

                        element.discount = element.data.discont + "%";
                        element.realamount = element.data.realamount;
                      } else {
                        element.product_view = "Invalid Data!";
                        element.kg_view = "Invalid Data!";

                        element.discount = "Invalid Data!";
                        element.realamount = "Invalid Data!";
                      }
                    } catch (error) {
                      console.log("Parsing data transaction went wrong");
                    }

                    element.branch_name_view = element.branch_name !== null ? element.branch_name : "-"

                    element.transaction_view =
                        'ID: ' + element.id + '<br>'
                        + element.cr_time_view + '<br>'
                        + element.status_view
                        + element.paid_date_view + '<br>'
                        + element.payment_view
                    element.customer_view =
                        element.data.customername + '<br>'
                        + element.customer + '<br>'
                        + element.data.kg + ' Kg<br>'
                        + 'Rp ' + element.amount + '<br>'

                    element.onecolumn = `
                        <div class="row bg-secondary rounded text-light justify-content-center mx-2 my-1 py-2">${element.data.productname}<br>${element.branch_name_view}</div>
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
        // columnDefs: [
        //     { "className": "dt-center", "targets": "_all" }
        // ],
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

    var configpage = await getPageConfig()

    swal.showModal('Struk Transaksi', html`

        <div class="d-flex p-2 bd-highlight justify-content-center">
            <div id="struct-print" class="text-center border py-2 px-2" style="width: 300px;">
        
                ${configpage.LAUNDRY_NAME} <br><br>
                ${configpage.LANDRY_ADDRESS} <br><br>
                No Telp. ${configpage.LANDRY_PHONE_NUMBER}<br>
                <br>
                ID: ${data[0].id} <br>
                ${data[0].cr_time.substring(0, 16).replace('T', ' ').replace('Z', ' ')} <br>
                <br>
                ${data[0].data.customername}<br>
                ${data[0].customer}<br>
                <br>
                ===========================<br>
                DAFTAR TRANSAKSI<br>
                ===========================<br>
                ${data[0].data.datatrx.map(item => html`
                <table class="text-start">
                    <tr>
                        <td>${(item.productname).substring(0,25)} [x${item.kg}]</td>
                        <td style="width:10px">:</td>
                        <td>Rp.${item.total}</td>
                    </tr>
                </table>
                <br>
                `)}
                ===========================<br>
                <br>

                ${data[0].data.discont !== "0" ? 
                    'Diskon ' + data[0].data.discont + '% dari harga asli Rp.' + data[0].data.realamount 
                        : ''}
                <br><br>
                Bayar (Rp)<br>
                Rp ${data[0].data.price} x ${data[0].data.kg} Kg = Rp.${data[0].amount} <br>
                <br>
                [${data[0].payment === 1 ? 'LUNAS' : 'BELUM LUNAS'}]<br>
                <br>
                ${data[0].paid_date ? 'Pembayaran ' + data[0].paid_date.substring(0,10) : ''}<br>
                <br>
                ${data[0].finish_date ? 'Pengambilan ' + data[0].finish_date.substring(0,10) : ""}<br>
                <br>
                Bawa kembali struk transaksi ini dan perlihatkan saat pengambilan laundry<br>
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

        document.head.innerHTML = `
        <style media="print">
            body {
                font-family: Arial;
                font-size: 8pt;
                color: #000000;
                text-align: center;
            }
            table {
                text-align: left;
            }
        </style>
        `

        document.body.innerHTML = printContents;
        // document.body.style.fontFamily = 'Arial, sans-serif'
        // document.body.style.fontSize = '10pt'
        // document.body.style.color = '#000000'

        setTimeout(() => {
            window.print();

            window.onfocus = function () {
                window.close();
                window.location.reload()
            }
            const isMobile = navigator.userAgentData.mobile;
            if (isMobile) {
                window.onfocus = function () {
                    window.close();
                    window.location.reload()
                }
            } else {
                window.location.reload()
            }
        }, 1000);



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

    swal.showModal('Input Nomor/Nama Pelanggan', html`
        <p>${branchdata.name}(${branchdata.id})</p>
        <div autocomplete="off" class="form-floating mb-3">
            <input autocomplete="off" type="text" class="form-control" id="input-phone">
            <label for="floatingInput">Nomor/Nama Pelanggan</label>
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
                url: '/service/customer/find/input',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { input: $('#input-phone').val() }
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
                        // inputTransaction(this.value, false)
                        inputNewTransaction(this.value, false)
                        swal.showLoading()
                    })
                } else {
                    $('#type-status').html('nomor pelanggan tidak ditemukan')
                    render(html``, $('#numberlist')[0])
                    $('#new-member').show()
                    $('#input-new-member').on('click', function () {
                        // inputTransaction($('#input-phone').val(), true)
                        inputNewTransaction($('#input-phone').val(), true)
                    })
                }
            }).catch(function (error) {
                console.error(error);
            });
        }, 1000)
    })
}

/** New Method */
async function inputNewTransaction(phone_number, isNewMember) {

    if (isNaN(phone_number)) phone_number = ''

    var result = [{ phone_number: phone_number, fullname: '', address: '' }]

    if (!isNewMember) {
        result = await new Promise(function (resolve, reject) {
            const options = {
                method: 'POST',
                url: '/service/customer/find/input',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { input: phone_number }
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

    var pageconfig = await getPageConfig();

    console.log('page config');
    console.log(pageconfig);

    swal.showModal('Input Transaksi', html`
        <div class="form-floating mb-3">
            <input disabled type="text" class="form-control" value="${branchdata.name}(${branchdata.id})">
            <label>Cabang</label>
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
        <hr>
        <div id="transaction-container">
            <h3>Daftar transaksi</h3>
            <div id="trx-1"></div>
            <div id="trx-2"></div>
            <div id="trx-3"></div>
            <div id="trx-4"></div>
            <div id="trx-5"></div>
            <div id="trx-6"></div>
            <div id="trx-7"></div>
            <div id="trx-8"></div>
            <div id="trx-9"></div>
            <div id="trx-10"></div>
            <button id="add-trx" type="button" class="btn btn-primary">Tambah</button>
            <button id="sub-trx" type="button" class="btn btn-primary">Kurang</button>
        </div>
        <hr>

        <div id="discount-container" class="form-floating mb-3">
            <input type="number" minlength="0" maxlength="100" class="form-control" id="trx-discount" value="0">
            <label >Terapkan Diskon (dalam %)</label>
        </div>

        <small id="discount-text"></small>
        <div class="form-floating mb-3">
            <h5>Total Bayar (Rp)</h5>
            <h6 id="input-data-amount"></h6>
        </div>

        <div class="mb-3">
            <button id="confirmButton" type="button" class="btn btn-outline-dark">Input</button>
            <button id="cancelButton" type="button" class="btn btn-outline-dark">Batalkan</button>
        </div>

        <div id="input-alert" class="text-danger"></div>
    `)

    $('#cancelButton').on('click', function () {
        swal.close()
    })

    if(!pageconfig.IS_DISCOUNT_ENABLED) {
        $('#discount-container').hide();
        $('#trx-discount').val(0);
    } else {
        if(pageconfig.FLEXIBLE_DISCOUNT) $('#trx-discount').prop('disabled', true);
        if(pageconfig.DICOUNT_VALUE !== '') $('#trx-discount').val(pageconfig.DICOUNT_VALUE);
    }
    
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

    var trxCount = 0;
    $('#add-trx').on('click', function () {
        if (trxCount < 10) {
            trxCount++;
            var currentCount = trxCount;
            render(html`
            <div class="mt-3 mb-3 px-3">
                <small>Transaksi - ${currentCount}</small>
                <div class="form-floating  mb-3">
                    <select class="form-select" id="input-data-product-${currentCount}" aria-label="Floating label select example">
                        <option value="-">Pilih Produk...</option>
                        ${productList.map((item) => html`<option value="${item.id}">${item.name}</option>`)}
                    </select>
                    <label for="floatingSelect">Produk</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="number" class="form-control" id="input-data-weight-${currentCount}">
                    <label for="floatingInput">Berat (KG)</label>
                </div>
                <div class="form-floating mb-3">
                    <input disabled type="number" class="form-control" id="input-data-amount-per-${currentCount}">
                    <label for="floatingInput">Harge Per (KG)</label>
                </div>
            </div>
            `, $('#trx-' + currentCount)[0])

            $('#input-data-product-' + currentCount).on('change', function () {
                try {
                    var id = this.value
                    console.log(id);
                    var product = productList.find(item => item.id == id)
                    console.log(product);
                    var jsonrules = JSON.parse(product.rules)
                    $('#input-data-amount-per-' + currentCount).val(jsonrules.price)
                    $('#input-data-weight-' + currentCount).val('')
                } catch (error) {
                    $('#input-data-amount-per-' + currentCount).val('')
                    $('#input-data-weight-' + currentCount).val('')
                }
            })

            $('#input-data-weight-' + currentCount).on('input', function () {
                cekTotalBayar()
                checkDiscount()
            })
        } else {
            alert('maksimal transaksi 10')
        }
    })
    $('#sub-trx').on('click', function () {
        if (trxCount > 0) {
            render(html``, $('#trx-' + trxCount)[0])
            trxCount--;
            cekTotalBayar()
            resetDiscount()
        } else {
            alert('tidak ada daftar transaksi')
        }
    })

    $('#trx-discount').on('change', function () {
        checkDiscount()
    })

    var amountbeforediscount = 0;
    function cekTotalBayar() {
        var total = 0;
        for (let index = 1; index <= trxCount; index++) {
            var weight = parseFloat($('#input-data-weight-' + index).val())
            var price = parseFloat($('#input-data-amount-per-' + index).val())
            var currenttotal = Math.round(price * weight)
            console.log(index + "-" + currenttotal);
            total = total + currenttotal
        }
        $('#input-data-amount').html(total)
        amountbeforediscount = total;
    }

    function resetDiscount() {
        $('#discount-text').html(``)
        $('#trx-discount').val(``)
    }

    function checkDiscount(){
        var discont = parseInt($('#trx-discount').val())
        if (discont > 100) $('#trx-discount').val('100')
        if (discont < 0) $('#trx-discount').val('0')
        cekTotalBayar()
        var total = $('#input-data-amount').html();
        if (discont > 0) {
            $('#discount-text').html(`Diskon sebesar ${$('#trx-discount').val()}% dari harga awal Rp.${total}`)
            var totalAfter = total - (total * (discont / 100))
            $('#input-data-amount').html(totalAfter);
        } else {
            $('#discount-text').html(``)
        }
    }

    $('#confirmButton').on('click', function (params) {
        var product = []
        var dataTrx = []
        var trxvalid = true;
        for (let index = 1; index <= trxCount; index++) {
            var weight = parseFloat($('#input-data-weight-' + index).val())
            var price = parseFloat($('#input-data-amount-per-' + index).val())
            var currenttotal = Math.round(price * weight)
            var currentProduct = $('#input-data-product-' + index).val()

            if ($('#input-data-weight-' + index).val() === '' || $('#input-data-amount-per-' + index).val() === '') {
                trxvalid = false;
            }
            product.push(currentProduct)
            dataTrx.push({
                kg: weight,
                price: price,
                total: currenttotal,
                product: currentProduct,
                productname: $(`#input-data-product-${index} option:selected`).text()
            })
            
        }

        if(!trxvalid){
            $("#input-alert").html(`
                Tentukan produk dan berat pada Transaksi
            `);
            setTimeout(() => {
              $("#input-alert").html(``);
            }, 5000);
            trxvalid = false;
            return;
        }

        // console.log(product);
        // console.log(data);
        if(trxCount <= 0){
            $('#input-alert').html(`
                Daftar Transaksi tidak boleh kosong
            `)
            setTimeout(() => {
                $('#input-alert').html(``)
            }, 5000);
            return;
        }

        if (
          $("#input-customer-number").val() === "" ||
          $("#input-customer-name").val() === "" ||
          $("#input-customer-address").val() === ""
        ) {
            $('#input-alert').html(`
                Nama dan Nomor Pelanggan tidak boleh kosong
                <br> Pastikan data diisi dengan benar
                <br><br>
                <small>Catatan:<br> 
                Alamat dapat diisi dengan region. misal: Puuwatu, Anduonohu
                <br>
                Jika Nama dan Nomor kosong, maka edit terlebih dahulu pelanggan tersebut melalui menu pelanggan
                </small>
            `)
            setTimeout(() => {
                $('#input-alert').html(``)
            }, 5000);
            return;
        }

        const options = {
            method: 'POST',
            url: '/service/transaction/add',
            headers: { 'Content-Type': 'application/json' },
            data: {
                user: 'All User',
                customer: $('#input-customer-number').val(),
                product: JSON.stringify(product),
                payment: 0,
                amount: $('#input-data-amount').html(),
                status: 0,
                branch: branchdata.id,
                data: JSON.stringify({
                    discont: $('#trx-discount').val(),
                    realamount: amountbeforediscount,
                    customername: $('#input-customer-name').val(),
                    customeraddress: $('#input-customer-address').val(),
                    datatrx: dataTrx
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
}

async function inputTransaction(phone_number, isNewMember) {

    if (isNaN(phone_number)) phone_number = ''

    var result = [{ phone_number: phone_number, fullname: '', address: '' }]

    if (!isNewMember) {
        result = await new Promise(function (resolve, reject) {
            const options = {
                method: 'POST',
                url: '/service/customer/find/input',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: { input: phone_number }
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
            <label>Cabang</label>
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
        <hr>
        <div>
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
            <p class="text-center">Tambahan</p>
            <hr>
            <div id="additional-product"></div>
            <hr>
            <div class="d-grid gap-2">
                <button id="add-extra-product" class="btn btn-primary" type="button">Tambah</button>
            </div>
        </div>
        <hr>
        <div class="form-floating mb-3">
            <input disabled type="number" class="form-control" id="input-data-amount">
            <label for="floatingInput">Total Bayar (RP)</label>
        </div>
        <div class="mb-3">
            <button id="confirmButton" type="button" class="btn btn-outline-dark">Input</button>
            <button id="cancelButton" type="button" class="btn btn-outline-dark">Batalkan</button>
        </div>
    `)

    var additional_product = []
    var additional_product_view;
    var extraCount = 0;

    $('#add-extra-product').on('click', function () {
        additional_product_view = $('#additional-product').html();
        extraCount++;
        render(html`
            ${unsafeHTML(additional_product_view)}
            <p><small>Tambahan - ${extraCount}</small></p>
            <div class="form-floating  mb-3">
                <select class="form-select" id="input-data-product-ex-${extraCount}" aria-label="Floating label select example">
                    <option value="-">Pilih Produk...</option>
                    ${productList.map((item) => html`<option value="${item.id}">${item.name}</option>`)}
                </select>
                <label>Produk</label>
            </div>
            <div class="form-floating mb-3">
                <input type="number" class="form-control" id="input-data-weight-ex-${extraCount}">
                <label>Berat (KG)</label>
            </div>
            <div class="form-floating mb-3">
                <input disabled type="number" class="form-control" id="input-data-amount-per-ex-${extraCount}">
                <label>Harge Per (KG)</label>
            </div>
        `, $('#additional-product')[0])

        for (let index = 1; index < extraCount; index++) {
            $('#input-data-product' + '-ex-' + index).on('change', function () {
                try {
                    var id = this.value
                    console.log(id);
                    var product = productList.find(item => item.id == id)
                    console.log(product);
                    var jsonrules = JSON.parse(product.rules)
                    $('#input-data-amount-per' + '-ex-' + index).val(jsonrules.price)
                    $('#input-data-amount').val('')
                    $('#input-data-weight' + '-ex-' + index).val('')
                } catch (error) {
                    $('#input-data-amount-per' + '-ex-' + index).val('')
                    $('#input-data-amount').val('')
                    $('#input-data-weight' + '-ex-' + index).val('')
                }
            })

            $('#input-data-weight' + '-ex-' + index).on('input', function () {
                var per = parseInt($('#input-data-amount-per' + '-ex-' + index).val())
                var weight = parseFloat($('#input-data-weight' + '-ex-' + index).val())
                var total = Math.round(per * weight)
                $('#input-data-amount').val(total)
            })
        }
    })



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
        var weight = parseFloat($('#input-data-weight').val())
        var total = Math.round(per * weight)
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

    var paid_date_view = data[0].paid_date ? data[0].paid_date.substring(0, 10) : ''
    var done_date_view = data[0].finish_date ? data[0].finish_date.substring(0, 10) : ''

    swal.showModal('Ubah Data Transaksi', html`
                <div class="form-floating mb-3">
                    <input disabled type="text" class="form-control" id="input-customer-number" value="${data[0].customer}">
                    <label for="input-customer-number">Nomor Pelanggan</label>
                </div>
                <div class="form-floating mb-3">
                    <input disabled type="text" class="form-control" id="input-customer-name" value="${data[0].data.customername}">
                    <label for="input-customer-name">Nama Pelanggan</label>
                </div>
                <div class="border border-dark mt-2 mb-2 pt-2 rounded">
                    <h6>Daftar Transaksi</h6>
                    <hr>
                    <div class="p-3">
                    ${data[0].data.datatrx.map(item => html`
                        <table class="text-start">
                            <tr>
                                <td>${item.productname} [x${item.kg}]</td>
                                <td style="width:10px">:</td>
                                <td>Rp.${item.total}</td>
                            </tr>
                        </table>
                        <br>
                    `)}
                    </div>
                    
                </div>
                <!-- <div class="form-floating mb-3">
                                                                                                                                                                    <input disabled type="text" class="form-control" id="input-product-name" value="${data[0].product_view}">
                                                                                                                                                                    <label for="input-product-name">Produk</label>
                                                                                                                                                                </div> -->
                <div class="form-floating mb-3">
                    <input disabled type="text" class="form-control" id="input-product-realamount" value="Rp ${data[0].realamount}">
                    <label for="input-product-amount">Harga Awal</label>
                </div>
                <div class="form-floating mb-3">
                    <input disabled type="text" class="form-control" id="input-product-discount" value="${data[0].discount}">
                    <label for="input-product-amount">Diskon</label>
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
                <div id="view-date-paid" class="form-floating mb-3">
                    <input type="date" class="form-control" id="input-product-date-done" value="${done_date_view}">
                    <label>Tanggal Pengambilan</label>
                </div>
                <div class="form-floating mb-3">
                    <select class="form-select" id="edit-input-payment" value="${data[0].payment}">
                        <option value="0">Belum Lunas</option>
                        <option value="1">Lunas</option>
                    </select>
                    <label for="edit-input-payment">Pembayaran</label>
                </div>
                <div id="view-date-paid" class="form-floating mb-3">
                    <input disabled type="date" class="form-control" id="input-product-date-paid" value="${paid_date_view}">
                    <label>Tanggal Pembayaran</label>
                </div>
                <div class="mb-3">
                    <button id="input-edit-transaction" type="button" class="btn btn-outline-dark">Ubah Produk</button>
                </div>
            `)

    $("#edit-input-status").val(data[0].status).change();
    $("#edit-input-payment").val(data[0].payment).change();

    // if ($("#edit-input-status").val() !== '1') $('#input-product-date-done').prop('disabled', false);
    if ($("#edit-input-payment").val() === '1') $('#input-product-date-paid').prop('disabled', false);

    // $("#edit-input-status").on('change', function (params) {
    //     if ($("#edit-input-status").val() !== '1') {
    //         $('#input-product-date-done').prop('disabled', false);
    //     } else {
    //         $('#input-product-date-done').prop('disabled', true);
    //         $('#input-product-date-done').val('')
    //     }
    // })

    $("#edit-input-payment").on('change', function (params) {
        if ($("#edit-input-payment").val() === '1') {
            $('#input-product-date-paid').prop('disabled', false);
        } else {
            $('#input-product-date-paid').prop('disabled', true);
            $('#input-product-date-paid').val('')
        }
    })

    $('#input-edit-transaction').on('click', function () {

        console.log('paid date: ' + $('#input-product-date-paid').val())
        console.log($('#input-product-date-done').val())

        // if ($("#edit-input-status").val() !== '2' && $('#input-product-date-done').val() === '') {
        //     alert('tanggal pengambilan harus di isi')
        //     return;
        // }
        if ($("#edit-input-payment").val() === '1' && $('#input-product-date-paid').val() === '') {
            alert('tanggal pembayaran harus di isi')
            return;
        }

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
                "status": $('#edit-input-status').val(),
                "date_paid": $('#input-product-date-paid').val(),
                "date_done": $('#input-product-date-done').val()
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

async function deleteTransaction(data) {
    try {
        data[0].id
    } catch (error) {
        swal.showInfo('Pilih transaksi terlebih dulu')
        return;
    }

    if (session.data.type !== 2) {
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
                // window.location.reload()
                table.ajax.reload()
            }).catch(function (error) {
                swal.showFailed('Gagal')
                console.error(error);
            });
        })
    }
    else {
        swal.showInfo('Konfirmasikan ke admin untuk melakukan penghapusan transaksi')
    }
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