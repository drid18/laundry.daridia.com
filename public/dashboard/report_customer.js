import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";
import { getcurrentdate } from "../utility/utility.js";
import { session } from "./index.js";

var tableCustomerReport = null;
var reportCustomerData = null;

export async function reportCustomer(container) {
    render(
        html`
            <h1 class="text-center mt-3">Laporan Transaksi Pelanggan</h1>
            <hr />
            <p class="text-center">Laporan Transaksi Per Pelanggan</p>
            <div>
                <div class="row">
                    <div class="col-md-5">
                        <div class="form-floating mb-3">
                            <input id="customer-update-year" type="number" class="form-control" />
                            <label>Tahun</label>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="form-floating mb-3">
                            <input id="customer-update-month" type="number" class="form-control" />
                            <label>Bulan</label>
                        </div>
                    </div>
                    <div class="col-md-2 align-items-center">
                        <button id="customer-date-update" type="button" class="btn btn-primary" style="height:58px; width:100%">
                            <i class="fa fa-arrow-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
            <p id="customer-performance-label" class="text-center"></p>
            <div>
                <div style="min-width:100%">
                    <table id="table-data-customer-report" class="table"></table>
                </div>
                <div>
                    <button id="export-to-excel-customer" type="button" class="btn btn-primary">Excel</button>
                </div>
            </div>
        `,
        $("#" + container)[0]
    );

    rendertable();

    /*
            { title: "No", data: null, width: "50px" },
            { title: "nama", data: "fullname", width: "200px" },
            { title: "nomor hp", data: "phone_number", width: "150px" },
            { title: "Jumlah Transaksi", data: "sum_trx", width: "150px" },
            { title: "alamat", data: "address", width: "150px" },
    */

    $("#export-to-excel-customer").on("click", function (params) {
        // document.body.innerHTML = "";
        render(
            html`
                <table id="export-to-excel-customer-download" class="table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Pelanggan</th>
                            <th>No Telp</th>
                            <th>Total Transaksi</th>
                            <th>Alamat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportCustomerData.map(
                            (item,index) => html`
                                <tr>
                                    <td>${index+1}</td>
                                    <td>${item.fullname}</td>
                                    <td>${item.phone_number}</td>
                                    <td>${item.sum_trx}</td>
                                    <td>${item.address}</td>
                                </tr>
                            `
                        )}
                    </tbody>
                </table>
            `,
            document.getElementById("hiddencontainer")
        );
        triggerDownload(`LaporanPelanggan_${getcurrentdate()}.xls`);
    });
}

function triggerDownload(filename) {
    var downloadLink;
    var dataType = "application/vnd.ms-excel";
    var tableSelect = document.getElementById("export-to-excel-customer-download");
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

async function rendertable() {
    tableCustomerReport = $("#table-data-customer-report").DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: "/service/report/customer/transaction",
            // timeout: 10000,
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            dataSrc: function (result) {
                console.log(JSON.stringify(result));
                console.log(result.data);
                var dataset = result.data;
                for (let index = 0; index < dataset.length; index++) {
                    const element = dataset[index];
                    element.cr_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.cr_time.substring(0, 16).replace("T", ' <i class="fa fa-clock-o" aria-hidden="true"></i> ');
                    element.mod_time_view = '<i class="fa fa-calendar" aria-hidden="true"></i> ' + element.mod_time.substring(0, 16).replace("T", ' <i class="fa fa-clock-o" aria-hidden="true"></i> ');
                }
                reportCustomerData = dataset;
                return dataset;
            },
        },
        columns: [
            // { title: "id", data: 'id' },
            { title: "No", data: null, width: "50px" },
            { title: "nama", data: "fullname", width: "200px" },
            { title: "nomor hp", data: "phone_number", width: "150px" },
            { title: "Jumlah Transaksi", data: "sum_trx", width: "150px" },
            { title: "alamat", data: "address", width: "150px" },
        ],
        dom: "frtp",
        columnDefs: [
            {
                searchable: false,
                orderable: false,
                targets: 0,
            },
        ],
        order: [[3, "desc"]],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close();
            }, 1000);
        },
    });

    tableCustomerReport
        .on("order.dt search.dt", function () {
            tableCustomerReport
                .column(0, { search: "applied", order: "applied" })
                .nodes()
                .each(function (cell, i) {
                    cell.innerHTML = i + 1;
                });
        })
        .draw();

    $("#customer-date-update").on("click", function () {
        var m = $("#customer-update-month").val();
        var y = $("#customer-update-year").val();
        tableCustomerReport.ajax.url(`/service/report/customer/transaction?m=${m}&y=${y}`).load();

        var detail_cust_per = "";
        if (y) detail_cust_per += ` Tahun <b>${y}</b> `;
        if (m) detail_cust_per += ` Bulan <b>${m}</b> `;

        $("#customer-performance-label").html(detail_cust_per);
    });
}
