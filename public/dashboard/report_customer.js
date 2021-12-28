import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";
import { session } from './index.js'

var tableCustomerReport = null;

export async function reportCustomer(container) {
    render(html`
        <h1 class="text-center mt-3">Laporan Transaksi Pelanggan</h1>
        <hr>
        <p class="text-center"> Laporan Transaksi Per Pelanggan</p>
        <div>
            <div style="min-width:100%">
                <table id="table-data-customer-report" class="table">
                </table>
            </div>
        </div>
    `, $('#' + container)[0])

    rendertable()
}

async function rendertable() {
    tableCustomerReport = $('#table-data-customer-report').DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: '/service/report/customer/transaction',
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
            // { title: "id", data: 'id' },
            { title: "No", data:null, width: '50px' },
            { title: "nama", data: 'fullname', width: '200px' },
            { title: "nomor hp", data: 'phone_number', width: '150px' },
            { title: "Jumlah Transaksi", data: 'sum_trx', width: '150px' },
            { title: "alamat", data: 'address', width: '150px' },
            { title: "tanggal dibuat", data: 'cr_time_view', width: '150px' },
            { title: "tanggal diubah", data: 'mod_time_view', width: '150px' },
        ],
        dom: "frtp",
        "columnDefs": [ {
            "searchable": false,
            "orderable": false,
            "targets": 0
        } ],
        "order": [[ 3, 'desc' ]],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close()
            }, 1000);
        }
    })

    tableCustomerReport.on( 'order.dt search.dt', function () {
        tableCustomerReport.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw();
}