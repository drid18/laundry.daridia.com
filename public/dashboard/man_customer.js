import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

export async function customer() {
    render(html`
        <div class="container">
            <h1>DAFTAR PELANGGAN</h1>
            <hr>
            <!-- <div class="container">
                <button id="add-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:150px">Tambah Transaksi</button>
                <button id="edit-transaction" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3"
                    style="width:150px">Edit Transaksi</button>
                <button id="delete-transaction" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3"
                    style="width:150px">Hapus Transaksi</button>
                <div id="table-container" style="min-width:100%">
                </div>
            </div> -->
        </div>
    `, $('#content-container')[0])
}