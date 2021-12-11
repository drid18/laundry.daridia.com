import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

export async function report() {
    render(html`
        <div class="container">
            <h1>LAPORAN</h1>
            <hr>
            <div id="detail-container" class="container-fluid">
        
            </div>
            <div class="container">
                <div id='card-container' class="row">
                </div>
            </div>
        </div>
    `, $('#content-container')[0])

    createCard()
}

async function createCard() {

    render(html`
        <p class="text-center">Memuat Data...</p>
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `, $('#card-container')[0])

    var result = await new Promise(function (resolve, reject) {
        const options = {
            method: 'POST',
            url: '/service/transaction/report/data',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data.data[0])
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })

    render(html`
        ${generateCard('Transaksi Bulan Ini', result.current_count_trx + ' Transaksi Selesai')}
        ${generateCard('Transaksi Bulan Sebelumnya', result.previous_count_trx + ' Transaksi Selesai')}
        <div class="d-flex justify-content-center mb-3">
            <a id="btn-detail-penjualan" href="#" class="btn btn-primary">Detail Penjualan <i class="fa fa-arrow-right"
                    aria-hidden="true"></i></a>
        </div>
        ${generateCard('Pendapatan Bulan Ini', 'Rp ' + result.current_sum_trx)}
        ${generateCard('Pendapatan Bulan Sebelumnya', 'Rp ' + result.previous_sum_trx)}
        <div class="d-flex justify-content-center mb-3">
            <a id="btn-detail-pendapatan" href="#" class="btn btn-primary">Detail Pendapatan <i class="fa fa-arrow-right"
                    aria-hidden="true"></i></a>
        </div>
    `, $('#card-container')[0])

    $('#btn-detail-penjualan').on('click', function () {
        generateDetailContent()
    })
    $('#btn-detail-pendapatan').on('click', function () {
        generateDetailContentSum()
    })
}

function generateCard(title, message) {
    return html`
        <div class="col-sm-6 mb-3">
            <div class="card shadow">
                <div class="card-body">
                    <h5 class="card-title" style="height: 50px">${title}</h5>
                    <p class="card-text">${message}</p>
                </div>
            </div>
        </div>
    `
}

async function generateDetailContent() {
    render(html`
        <p class="text-center">Memuat Data...</p>
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `, $('#detail-container')[0])

    $('#detail-container').hide()
    $('#card-container').hide('fast')
    $('#detail-container').show('slow')

    var result = await new Promise(function (resolve, reject) {
        const options = {
            method: 'POST',
            url: '/service/transaction/report/count/monthlyyear',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { year: new Date().getFullYear() }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data.data)
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })

    render(html`
        <div class="hstack gap-3 shadow py-3 px-3">
            <button id="back-button" type="button" class="btn btn-sm btn-outline-dark">
                <i class="fa fa-arrow-left" aria-hidden="true"></i>
            </button>
            <div class="vr"></div>
            <i class="me-auto text-center">Laporan Pendapatan Bulanan</i>
        </div>
        <div class="container-fluid mt-3 mb-3">
            <canvas id="chartdata"></canvas>
        </div>
        
        <br>
        <hr>
    `, $('#detail-container')[0])

    var chartlabels = []
    var chartdata = []
    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        chartlabels.push(element.bulan)
        chartdata.push(element.jumlah)
    }

    var ctx = document.getElementById('chartdata').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: {
            labels: chartlabels,
            datasets: [{
                label: 'Data Transaksi ' + new Date().getFullYear(),
                backgroundColor: 'rgba(52, 152, 219,1.0)',
                // borderColor: 'rgb(255, 99, 132)',
                lineTension: 0,
                data: chartdata
            }]
        },
        // Configuration options go here
        options: {}
    });

    $('#back-button').on('click', function () {
        $('#card-container').show('slow')
        $('#detail-container').hide('fast')
        chart.destroy()
    })
}

async function generateDetailContentSum() {
    render(html`
        <p class="text-center">Memuat Data...</p>
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `, $('#detail-container')[0])

    $('#detail-container').hide()
    $('#card-container').hide('fast')
    $('#detail-container').show('slow')

    var result = await new Promise(function (resolve, reject) {
        const options = {
            method: 'POST',
            url: '/service/transaction/report/sum/monthlyyear',
            headers: {
                'Content-Type': 'application/json'
            },
            data: { year: new Date().getFullYear() }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data.data)
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })

    render(html`
        <div class="hstack gap-3 shadow py-3 px-3">
            <button id="back-button" type="button" class="btn btn-sm btn-outline-dark">
                <i class="fa fa-arrow-left" aria-hidden="true"></i>
            </button>
            <div class="vr"></div>
            <i class="me-auto text-center">Laporan Pendapatan Bulanan</i>
        </div>
        <div class="container-fluid mt-3 mb-3">
            <canvas id="chartdata"></canvas>
        </div>
        
        <br>
        <hr>
    `, $('#detail-container')[0])

    var chartlabels = []
    var chartdata = []
    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        chartlabels.push(element.bulan)
        chartdata.push(element.jumlah)
    }

    var ctx = document.getElementById('chartdata').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: {
            labels: chartlabels,
            datasets: [{
                label: 'Data Pendapatan ' + new Date().getFullYear(),
                backgroundColor: 'rgba(52, 152, 219,1.0)',
                // borderColor: 'rgb(255, 99, 132)',
                lineTension: 0,
                data: chartdata
            }]
        },
        // Configuration options go here
        options: {}
    });

    $('#back-button').on('click', function () {
        $('#card-container').show('slow')
        $('#detail-container').hide('fast')
        chart.destroy()
    })
}