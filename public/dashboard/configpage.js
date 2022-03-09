import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

var table

export async function configpage() {
    render(html`
        <div class="container">
            <h1>PENGATURAN</h1>
            <hr>
            <div class="container">
                <div class="mb-3 row">
                    <label class="col-sm-2 col-form-label">Nama Laundry</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="config-laundry-name">
                    </div>
                </div>
                <div class="mb-3 row">
                    <label class="col-sm-2 col-form-label">Alamat Laundry</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="config-laundry-address">
                    </div>
                </div>
                <div class="mb-3 row">
                    <label class="col-sm-2 col-form-label">No Telp</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="config-laundry-phone">
                    </div>
                </div>
                <div class="mb-3 row">
                    <label class="col-sm-2 col-form-label">Aktifkan Diskon</label>
                    <div class="col-sm-10 pt-2">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="config-laundry-isdiscount">
                            <small>Diskon diaktifkan pada transaksi</small>
                        </div>
                    </div>
                </div>
                <div id="config-discount-container" class="text-nowrap">
                    <div class="mb-3 row">
                        <label class="col-sm-2 col-form-label">Diskon tetap</label>
                        <div class="col-sm-10 pt-2">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch"
                                    id="config-laundry-isdiscountfixed">
                                <small>Jumlah diskon tidak dapat disesuaikan oleh operator</small>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label class="col-sm-2 col-form-label">Jumlah Diskon</label>
                        <div class="col-sm-10">
                            <input type="number" class="form-control" id="config-laundry-discountvalue">
                        </div>
                    </div>
                </div>
                <hr>
        
                <div class="d-flex flex-row-reverse bd-highlight">
                    <button id="config-save" type="button" class="btn btn-primary text-end ms-3"
                        style="width:100px">Simpan</button>
                </div>
        
            </div>
        </div>
    `, $('#content-container')[0])

    var configdata = {}
    await new Promise(function (resolve, reject) {
        const options = {
            method: 'POST',
            url: '/service/config/getall'
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            configdata = response.data;
            resolve();
        }).catch(function (error) {
            resolve();
            console.error(error);
        });
    });

    /*
    {
        "DICOUNT_VALUE": "10",
        "FLEXIBLE_DISCOUNT": true,
        "IS_DISCOUNT_ENABLED": true,
        "LANDRY_ADDRESS": "Jl Bunggasi Poros Anduonohu, Toko SMART PRABOT, Kel. Anduonohu, Kec. Poasia",
        "LANDRY_PHONE_NUMBER": "082196740580",
        "LAUNDRY_LOGO_URL": null,
        "LAUNDRY_NAME": "Laundry DariDia Express"
    }
    */


    $('#config-laundry-name').val(configdata.LAUNDRY_NAME);
    $('#config-laundry-address').val(configdata.LANDRY_ADDRESS);
    $('#config-laundry-phone').val(configdata.LANDRY_PHONE_NUMBER);
    $('#config-laundry-discountvalue').val(configdata.DICOUNT_VALUE);

    $('#config-laundry-isdiscount').prop('checked', configdata.IS_DISCOUNT_ENABLED)
    checkDicountStatus()

    $('#config-laundry-isdiscount').on('change', function () {
        checkDicountStatus()
    })

    $('#config-laundry-isdiscountfixed').prop('checked', configdata.FLEXIBLE_DISCOUNT)

    $('#config-save').on('click', function () {

        var LAUNDRY_NAME = $('#config-laundry-name').val();
        var LANDRY_ADDRESS = $('#config-laundry-address').val();
        var LANDRY_PHONE_NUMBER = $('#config-laundry-phone').val();
        var IS_DISCOUNT_ENABLED =
            $('#config-laundry-isdiscount').prop('checked')
                ? "true" : "false"
        var FLEXIBLE_DISCOUNT =
            $('#config-laundry-isdiscountfixed').prop('checked')
                ? "true" : "false"
        var DICOUNT_VALUE = $('#config-laundry-discountvalue').val();

        saveconfig(LAUNDRY_NAME, LANDRY_ADDRESS, LANDRY_PHONE_NUMBER,
            IS_DISCOUNT_ENABLED, FLEXIBLE_DISCOUNT, DICOUNT_VALUE)
    })
}

function checkDicountStatus() {
    if ($('#config-laundry-isdiscount').prop('checked')) $('#config-discount-container').show('fast')
    else $('#config-discount-container').hide('fast')
}

async function saveconfig(LAUNDRY_NAME, LANDRY_ADDRESS, LANDRY_PHONE_NUMBER, IS_DISCOUNT_ENABLED, FLEXIBLE_DISCOUNT, DICOUNT_VALUE) {
    swal.showLoading()
    const options = {
        method: 'POST',
        url: '/service/config/setall',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            DICOUNT_VALUE: DICOUNT_VALUE,
            FLEXIBLE_DISCOUNT: FLEXIBLE_DISCOUNT,
            IS_DISCOUNT_ENABLED: IS_DISCOUNT_ENABLED,
            LANDRY_ADDRESS: LANDRY_ADDRESS,
            LANDRY_PHONE_NUMBER: LANDRY_PHONE_NUMBER,
            LAUNDRY_LOGO_URL: null,
            LAUNDRY_NAME: LAUNDRY_NAME
        }
    };

    axios.request(options).then(function (response) {
        console.log(response.data);
        swal.showSuccess("Tersimpan")
    }).catch(function (error) {
        console.error(error);
    });
}

