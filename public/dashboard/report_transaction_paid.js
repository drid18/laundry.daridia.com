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
                <div class="col-md-5">
                    <div class="form-floating mb-3">
                        <input id="paid-update-year" type="number" class="form-control" id="floatingInput">
                        <label>Tahun</label>
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="form-floating mb-3">
                        <input id="paid-update-month" type="number" class="form-control" id="floatingInput">
                        <label>Bulan</label>
                    </div>
                </div>
                <div class="col-md-2 align-items-center">
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
    tableTransactionPaid = $('#table-data-transaction-paid').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: '/service/report/transaction/bypaid',
            // timeout: 10000,
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data
                totalamountpaid = result.total;

                render(html`
                <div class="text-center">
                    <p>Jumlah Transaksi <br> <b>${dataset.length ? dataset.length : 0}</b></p>
                    <p>Total Pendapatan <br> <b>Rp ${totalamountpaid}</b> </p>
                </div>
                `, $('#report-transaction-paid-detail')[0])

                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                    element.cr_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.cr_time.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                    element.mod_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.mod_time.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')
                    element.paid_date_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.paid_date.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')

                    var dataJson = JSON.parse(element.data)
                    element.productname = dataJson.productname
                    element.kg = dataJson.kg
                    element.price = dataJson.price
                }
                return dataset;
            },
        },
        columns: [
            // { title: "id", data: 'id' },
            { title: "No", data: null, width: '50px' },
            { title: "Tanggal Transaksi", data: 'cr_time_view', width: '150px' },
            { title: "Tanggal Lunas", data: 'paid_date_view', width: '150px' },
            { title: "Pelanggan", data: 'customer', width: '100px' },
            { title: "Produk", data: 'productname', width: '150px' },
            { title: "Berat", data: 'kg', width: '50px' },
            { title: "Satuan", data: 'price', width: '100px' },
            { title: "Jumlah", data: 'amount', width: '150px' },
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
        var m = $('#paid-update-month').val()
        var y = $('#paid-update-year').val()
        tableTransactionPaid.ajax.url(`/service/report/transaction/bypaid?m=${m}&y=${y}`).load();
    })


}