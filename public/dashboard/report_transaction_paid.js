import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";
import { session } from './index.js'

var tableTransactionPaid = null;

var totalamountpaid = 0;

export async function reportTransactionPaid(container) {
    render(html`
        <h1 class="text-center mt-3">Laporan Transaksi</h1>
        <hr>
        <p class="text-center">Transaksi Per Tanggal Order Lunas</p>
        <div>
            <div class="row">
                <div class="col-md-3">
                    <div class="form-floating mb-3">
                        <input id="paid-update-year" type="number" class="form-control">
                        <label>Tahun</label>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-floating mb-3">
                        <input id="paid-update-month" type="number" class="form-control">
                        <label>Bulan</label>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-floating mb-3">
                        <input id="paid-update-date" type="number" class="form-control">
                        <label>Tanggal</label>
                    </div>
                </div>
                <div class="col-md-3 align-items-center">
                    <button id="transaction-paid-update" type="button" class="btn btn-primary" style="height:58px; width:100%">
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
        <div>
            <div style="min-width:100%">
                <table id="table-data-transaction-paid" class="table">
                </table>
            </div>
        </div>
        <hr>
        <div id="report-transaction-paid-detail"></div>
    `, $('#' + container)[0])

    rendertable()
}

async function rendertable() {

    var branch = sessionStorage.getItem("branch")
    console.log(branch);
    if (branch === 'null') branch = null
    var branchurl = branch ? '?b=' + branch : ''

    tableTransactionPaid = $('#table-data-transaction-paid').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: '/service/report/transaction/bypaid' + branchurl,
            // timeout: 10000,
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data
                totalamountpaid = result.total;

                try {
                    render(html`
                    <div class="text-center">
                        <p id="detail-trx-paid"></p>
                        <p>Jumlah Transaksi <br> <b>${dataset.length ? dataset.length : 0}</b></p>
                        <p>Total Pendapatan <br> <b>Rp ${totalamountpaid}</b> </p>
                    </div>
                    `, $('#report-transaction-paid-detail')[0])

                    for (let index = 0; index < dataset.length; index++) {
                        const element = dataset[index];
                        element.cr_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.cr_time.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                        element.mod_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.mod_time.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                        element.paid_date_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.paid_date.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')

                        element.status_view = element.status === 0 ? '<p class="bg-danger rounded text-center text-white">Di Proses</p>'
                            : element.status === 1 ? '<p class="bg-warning rounded text-center text-white">Menungu Pengambilan</p>'
                                : '<p class="bg-success rounded text-center text-white">Selesai</p>'


                        /* START data product row */
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
                          element.costumername = data.customername
                        } else {
                          element.product_view = "Invalid Data!";
                          element.kg_view = "Invalid Data!";

                          element.discount = "Invalid Data!";
                          element.realamount = "Invalid Data!";
                          element.costumername = "Invalid Data!";
                        }
                        /* END */
                    }
                    return dataset;
                } catch (error) {
                    return []
                }
            },
        },
        columns: [
            // { title: "id", data: 'id' },
            { title: "No", data: null, width: '50px' },
            { title: "Cabang", data: 'name', width: '200px' },
            { title: "Tanggal Transaksi", data: 'cr_time_view', width: '150px' },
            { title: "Tanggal Lunas", data: 'paid_date_view', width: '150px' },
            { title: "Status", data: 'status_view', width: '100px' },
            { title: "No Pelanggan", data: 'customer', width: '100px' },
            { title: "Nama Pelanggan", data: 'costumername', width: '100px' },
            { title: "Produk", data: 'product_view', width: '150px' },
            { title: "Berat", data: 'kg_view', width: '50px' },
            { title: "Diskon", data: 'discount', width: '100px' },
            { title: "Harga", data: 'realamount', width: '100px' },
            { title: "Jumlah Bayar", data: 'amount', width: '150px' },
        ],
        dom: "frtp",
        "columnDefs": [{
            "searchable": false,
            "orderable": false,
            "targets": 0
        }],
        "order": [[2, 'desc']],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close()
            }, 1000);
        }
    })

    tableTransactionPaid.on('order.dt search.dt', function () {
        tableTransactionPaid.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();

    $('#transaction-paid-update').on('click', function () {

        var branch = sessionStorage.getItem("branch")
        console.log(branch);
        if (branch === 'null') branch = null
        var branchurl = branch ? '&b=' + branch : ''

        var m = $('#paid-update-month').val()
        var y = $('#paid-update-year').val()
        var d = $('#paid-update-date').val()
        tableTransactionPaid.ajax.url(`/service/report/transaction/bypaid?m=${m}&y=${y}&d=${d}` + branchurl).load();

        var detail_trx = ''
        if (y) detail_trx += `  Tahun <b>${y}</b>  `
        if (m) detail_trx += `  Bulan <b>${m}</b>  `
        if (d) detail_trx += `  Tanggal <b>${d}</b>  `

        $('#detail-trx-paid').html(detail_trx)
    })


}