import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";
import { getcurrentdate } from "../utility/utility.js";
import { session } from "./index.js";

var tableTransactionDate = null;
var totalamountpaiddate = 0;
var branch = null;
var reportTransactionByDate = null;

export async function reportTransactionDate(container) {
    render(
        html`
            <h1 class="text-center mt-3">Laporan Transaksi Masuk</h1>
            <hr />
            <p class="text-center">Transaksi Per Tanggal Order Masuk</p>
            <div>
                <div class="row">
                    <div class="col-md-3">
                        <div class="form-floating mb-3">
                            <input id="trx-update-year" type="number" class="form-control" />
                            <label>Tahun</label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-floating mb-3">
                            <input id="trx-update-month" type="number" class="form-control" />
                            <label>Bulan</label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-floating mb-3">
                            <input id="trx-update-date" type="number" class="form-control" />
                            <label>Tanggal</label>
                        </div>
                    </div>
                    <div class="col-md-3 align-items-center">
                        <button id="transaction-date-update" type="button" class="btn btn-primary" style="height:58px; width:100%">
                            <i class="fa fa-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div style="min-width:100%">
                    <table id="table-data-transaction-date" class="table"></table>
                </div>
            </div>
            <div>
                <button id="reportTransactionDate-download" type="button" class="btn btn-primary">Excel</button>
            </div>
            <hr />
            <div id="report-transaction-date-detail"></div>
        `,
        $("#" + container)[0]
    );

    rendertable();
    downloadExcel();
}

async function rendertable() {
    var branch = sessionStorage.getItem("branch");
    console.log(branch);
    if (branch === "null") branch = null;
    var branchurl = branch ? "?b=" + branch : "";

    tableTransactionDate = $("#table-data-transaction-date").DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: "/service/report/transaction/bytrx" + branchurl,
            // timeout: 10000,
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data;
                totalamountpaiddate = result.total;

                try {
                    render(
                        html`
                            <div class="text-center">
                                <p id="detail-trx-date"></p>
                                <p>
                                    Jumlah Transaksi <br />
                                    <b>${dataset.length}</b>
                                </p>
                                <p>
                                    Total Pendapatan <br />
                                    <b>Rp ${totalamountpaiddate}</b>
                                </p>
                            </div>
                        `,
                        $("#report-transaction-date-detail")[0]
                    );

                    for (let index = 0; index < dataset.length; index++) {
                        const element = dataset[index];
                        element.cr_time_view =
                            '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.cr_time.substring(0, 16).replace("T", ' <i class="fa fa-clock-o" aria-hidden="true"></i> ');
                        element.mod_time_view =
                            '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.mod_time.substring(0, 16).replace("T", ' <i class="fa fa-clock-o" aria-hidden="true"></i> ');
                        // element.paid_date_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.paid_date.substring(0, 16).replace('T', ' <i class="fa fa-clock-o" aria-hidden="true"></i> ')

                        element.status_view =
                            element.status === 0
                                ? '<p class="bg-danger rounded text-center text-white">Di Proses</p>'
                                : element.status === 1
                                ? '<p class="bg-warning rounded text-center text-white">Menungu Pengambilan</p>'
                                : '<p class="bg-success rounded text-center text-white">Selesai</p>';

                        element.payment_view =
                            element.payment === 0 ? '<p class="bg-secondary rounded text-center text-white">Belum Lunas</p>' : '<p class="bg-primary rounded text-center text-white">Lunas</p>';

                        /* START data product row */
                        var productList = null;
                        try {
                            productList = JSON.parse(element.data).datatrx;
                            // var productList = JSON.parse(element.data).datatrx ? JSON.parse(element.data).datatrx : null ;
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

                                var data = JSON.parse(element.data);
                                element.discount = data.discont + "%";
                                element.realamount = data.realamount;
                                element.costumername = data.customername;
                            } else {
                                element.product_view = "Invalid Data!";
                                element.kg_view = "Invalid Data!";

                                element.discount = "Invalid Data!";
                                element.realamount = "Invalid Data!";
                                element.costumername = "Invalid Data!";
                            }
                        } catch (error) {
                            console.error(error);
                        }
                        /* END */
                    }
                    reportTransactionByDate = dataset;
                    return dataset;
                } catch (error) {
                    console.error(error);
                    return [];
                }
            },
        },
        columns: [
            // { title: "id", data: 'id' },
            { title: "No", data: null, width: "50px" },
            { title: "Cabang", data: "name", width: "200px" },
            { title: "Tanggal Transaksi", data: "cr_time_view", width: "150px" },
            { title: "Status", data: "status_view", width: "100px" },
            { title: "Pembayaran", data: "payment_view", width: "100px" },
            { title: "No Pelanggan", data: "customer", width: "100px" },
            { title: "Nama Pelanggan", data: "costumername", width: "100px" },
            { title: "Produk", data: "product_view", width: "150px" },
            { title: "Berat", data: "kg_view", width: "50px" },
            { title: "Diskon", data: "discount", width: "100px" },
            { title: "Harga", data: "realamount", width: "100px" },
            { title: "Jumlah Bayar", data: "amount", width: "150px" },
        ],
        dom: "frtp",
        columnDefs: [
            {
                searchable: false,
                orderable: false,
                targets: 0,
            },
        ],
        order: [[2, "desc"]],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close();
            }, 1000);
        },
    });

    tableTransactionDate
        .on("order.dt search.dt", function () {
            tableTransactionDate
                .column(0, { search: "applied", order: "applied" })
                .nodes()
                .each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
        })
        .draw();

    $("#transaction-date-update").on("click", function () {
        var branch = sessionStorage.getItem("branch");
        console.log(branch);
        if (branch === "null") branch = null;
        var branchurl = branch ? "&b=" + branch : "";

        var m = $("#trx-update-month").val();
        var y = $("#trx-update-year").val();
        var d = $("#trx-update-date").val();
        tableTransactionDate.ajax.url(`/service/report/transaction/bytrx?m=${m}&y=${y}&d=${d}` + branchurl).load();

        var detail_trx = "";
        if (y) detail_trx += `  Tahun <b>${y}</b>  `;
        if (m) detail_trx += `  Bulan <b>${m}</b>  `;
        if (d) detail_trx += `  Tanggal <b>${d}</b>  `;

        $("#detail-trx-date").html(detail_trx);
    });
}

async function downloadExcel() {
    /*
            { title: "No", data: null, width: "50px" },
            { title: "Cabang", data: "name", width: "200px" },
            { title: "Tanggal Transaksi", data: "cr_time_view", width: "150px" },
            { title: "Status", data: "status_view", width: "100px" },
            { title: "Pembayaran", data: "payment_view", width: "100px" },
            { title: "No Pelanggan", data: "customer", width: "100px" },
            { title: "Nama Pelanggan", data: "costumername", width: "100px" },
            { title: "Produk", data: "product_view", width: "150px" },
            { title: "Berat", data: "kg_view", width: "50px" },
            { title: "Diskon", data: "discount", width: "100px" },
            { title: "Harga", data: "realamount", width: "100px" },
            { title: "Jumlah Bayar", data: "amount", width: "150px" },
    */
    $("#reportTransactionDate-download").on("click", async function (params) {
        render(
            html`
                <table id="export-to-excel-reportTransactionDate-download" class="table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Cabang</th>
                            <th>Tanggal Transaksi</th>
                            <th>Status</th>
                            <th>Pembayaran</th>
                            <th>No Pelanggan</th>
                            <th>Produk</th>
                            <th>Berat</th>
                            <th>Diskon</th>
                            <th>Harga</th>
                            <th>Jumlah Bayar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportTransactionByDate.map(
                            (item, index) => html`
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.name}</td>
                                    <td>${item.cr_time}</td>
                                    <td>${item.status}</td>
                                    <td>${item.payment}</td>
                                    <td>${item.customer}</td>
                                    <td>${item.costumername}</td>
                                    <td>
                                        ${item.product_view
                                            .replace(/<li>/g, "[")
                                            .replace(/<\/li>/g, "]")
                                            .replace(/<ol>/g, "")
                                            .replace(/<\/ol>/g, "")}
                                    </td>
                                    <td>
                                        ${item.kg_view
                                            .replace(/<li>/g, "[")
                                            .replace(/<\/li>/g, "]")
                                            .replace(/<ol>/g, "")
                                            .replace(/<\/ol>/g, "")}
                                    </td>
                                    <td>${item.discount}</td>
                                    <td>${item.realamount}</td>
                                    <td>${item.amount}</td>
                                </tr>
                            `
                        )}
                    </tbody>
                </table>
            `,
            document.getElementById("hiddencontainer")
        );
        triggerDownload(`LaporanTransaksiBerdasarkanTanggal_${getcurrentdate()}.xls`);
    });
}

function triggerDownload(filename) {
    var downloadLink;
    var dataType = "application/vnd.ms-excel";
    var tableSelect = document.getElementById("export-to-excel-reportTransactionDate-download");
    var tableHTML = tableSelect.outerHTML.replace(/ /g, "%20");

    // Specify file name
    var filename = filename;

    // Create download link element
    downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(["\ufeff", tableHTML], {
            type: dataType,
        });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // Create a link to the file
        downloadLink.href = "data:" + dataType + ", " + tableHTML;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
        downloadLink.click();
    }
}
