import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";
import { session } from './index.js'
import { reportCustomer } from "./report_customer.js";
import { reportTransactionDate } from "./report_transaction_date.js";
import { reportTransactionPaid } from "./report_transaction_paid.js";


var branch = null;
var branchdata = null;

export async function report() {
    var branch = sessionStorage.getItem("branch")
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
                //     swal.close()
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
    }

    render(html`
        <div class="container">
            <h1>LAPORAN</h1>
            <small id="cabang-name"></small>
            <button id="btn-change-branch" type="button" class="btn btn-sm btn-outline-dark float-right ms-3 mt-3 mb-3"
                style="width:50px">ganti</button>
            <hr>
            <div id="detail-container" class="container-fluid"></div>
            <div class="container">
                <div id='card-container' class="row">
                </div>
            </div>
            <div class="container-fluid bg-dark mt-4 mb-4 rounded" style="height: 5px" ></div>
            <div id="customer-report" class="container p-3 shadow rounded"></div>
            <div class="container-fluid bg-primary mt-4 mb-4 rounded" style="height: 5px" ></div>
            <div id="transaction-paid-report" class="container p-3 shadow rounded"></div>
            <div class="container-fluid bg-success mt-4 mb-4 rounded" style="height: 5px" ></div>
            <div id="transaction-date-report" class="container p-3 shadow rounded"></div>
            <br>
            <br>
            <br>
        </div>
    `, $('#content-container')[0])

    $('#btn-change-branch').on('click', async function () {
        // sessionStorage.setItem("branch", null)
        // window.location.reload()
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

    createCard()

    /**another report menu */
    reportCustomer('customer-report')
    reportTransactionPaid('transaction-paid-report')
    reportTransactionDate('transaction-date-report')
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
        branch = sessionStorage.getItem("branch")
        if (branch === 'null') branch = null
        const options = {
            method: 'POST',
            url: '/service/transaction/report/data' + (branch ? '?b=' + branch : ''),
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
        ${generateCard('Pendapatan Bulan Ini',
            'Rp ' + (result.current_sum_trx ? result.current_sum_trx : 'tidak ada'))}
        ${generateCard('Pendapatan Bulan Sebelumnya', 
            'Rp ' + (result.previous_sum_trx ? result.previous_sum_trx : 'tidak ada'))}
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
        branch = sessionStorage.getItem("branch")
        if (branch === 'null') branch = null
        const options = {
            method: 'POST',
            url: '/service/transaction/report/count/monthlyyear' + (branch ? '?b=' + branch : ''),
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
        branch = sessionStorage.getItem("branch")
        if (branch === 'null') branch = null
        const options = {
            method: 'POST',
            url: '/service/transaction/report/sum/monthlyyear' + (branch ? '?b=' + branch : ''),
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