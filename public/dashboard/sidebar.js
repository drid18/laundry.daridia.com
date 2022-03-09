
import { render, html } from '../node_modules/lit-html/lit-html.js'
import { swal } from '../utility/swal.js'
import { session } from './index.js'

var menuOperator = html`
    <li class="nav-item">
        <a class="nav-link" href="?transaction">
            <i class="fa fa-shopping-cart me-2" style="width:20px"></i>
            Transaksi
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?customer">
            <i class="fa fa-users me-2" style="width:20px"></i>
            Pelanggan
        </a>
    </li>
`

var menuAdmin = html`
    <li class="nav-item">
        <a class="nav-link" href="?transaction">
            <i class="fa fa-shopping-cart me-2" style="width:20px"></i>
            Transaksi
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?customer">
            <i class="fa fa-users me-2" style="width:20px"></i>
            Pelanggan
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?branch">
            <i class="fa fa-building me-2" style="width:20px"></i>
            Cabang
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?product">
            <i class="fa fa-book me-2" aria-hidden="true" style="width:20px"></i>
            Produk
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?user">
            <i class="fa fa-user me-2" style="width:20px"></i>
            Karyawan
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?report">
            <i class="fa fa-bar-chart me-2" style="width:20px"></i>
            Laporan
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link" href="?configpage">
            <i class="fa fa-cog me-2" style="width:20px"></i>
            Pengaturan
        </a>
    </li>
`

export class sidebar {
    static renderHTML() {
        render(html`
            <div class="d-flex justify-content-end mt-2 me-2">
                <button id="btn-hidesidebar" type="button" class="btn btn-outline-dark">
                    <i class="fa fa-chevron-left" aria-hidden="true"></i>
                </button>
            </div>
            <div class="ms-3 mb-3">
                <p>Selamat Datang <br>
                    <b>${session.data.fullname}</b> <br>
                    <small>
                        <i>
                            ${session.data.type === 0 ? 'Developer' 
                            : session.data.type === 1 ? 'Admin' 
                            : 'Operator'}
                        </i>
                    </small>
                </p>
            </div>
            <div class="container mt-5">
                <ul class="nav flex-column">
                    ${session.data.type !== 2 ? menuAdmin : menuOperator}
                </ul>
                <hr>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link closebutton" href="#">
                            <i class="fa fa-sign-out" style="width:20px"></i>
                            Keluar
                        </a>
                    </li>
                </ul>
            </div>
        `, $('#sidebar')[0])

        render(html`
            <div class="d-flex justify-content-end mt-2">
            
                <ul class="nav list-group-horizontal">
                    <li class="nav-item me-2">
                        <button id="btn-showsidebar" type="button" class="btn btn-sm btn-outline-dark">
                            <i class="fa fa-chevron-right" aria-hidden="true"></i> Menu
                        </button>
                    </li>
                    <li class="nav-item me-2">
                        <button id="btn-showoffcanvas" type="button" data-bs-toggle="offcanvas" data-bs-target="#bottomoffcanvas"
                            class="btn btn-sm btn-outline-dark">
                            <i class="fa fa-chevron-up" aria-hidden="true"></i> Menu
                        </button>
                    </li>
                    <li class="nav-item me-2">
                        <button id="btn-showsidebar" type="button" class="btn btn-sm btn-outline-dark closebutton">
                            <i class="fa fa-sign-out" style="width:20px"></i> Keluar
                        </button>
                    </li>
                </ul>
            </div>
        `, $('#bottombar')[0])

        render(html`
        <div class="offcanvas-header justify-content-end">
            <button type="button" class="btn-sm btn-dark" data-bs-dismiss="offcanvas" aria-label="Close">
                <i class="fa fa-chevron-down" aria-hidden="true"></i>
            </button>
        </div>
        <div class="ms-3">
                <p><br>
                    <b>${session.data.fullname}</b> <br>
                    <small>
                        <i>
                            ${session.data.type === 0 ? 'Developer' 
                            : session.data.type === 1 ? 'Admin' 
                            : 'Operator'}
                        </i>
                    </small>
                </p>
            </div>
        <div class="offcanvas-body small">
            <div class="container mt-3">
                <ul class="nav flex-column">
                    ${session.data.type !== 2 ? menuAdmin : menuOperator}
                </ul>
                <hr>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link closebutton" href="#">
                            <i class="fa fa-sign-out" style="width:20px"></i>
                            Keluar
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        `, $('#bottomoffcanvas')[0])

        setWindowsLayout()

        $('#btn-hidesidebar').on('click', function () {
            $('#sidebar').hide('fast')
            $('#bottombar').show('fast')
            $('#content-container').css('margin-left', '0')
        })

        $('#btn-showsidebar').on('click', function () {
            $('#bottombar').hide('fast')
            $('#sidebar').show('fast')
            $('#content-container').css('margin-left', '300px')
        })

        $('.nav-link').on('click', function () {
            swal.showLoading('Memuat Halaman')
        })

        $('.closebutton').on('click', function () {
            swal.showLoading('keluar dashboard...')

            const options = {
                method: 'POST',
                url: '/service/user/logout',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            axios.request(options).then(function (response) {
                window.location.href = "/login"
            }).catch(function (error) {
                console.error(error);
            });
        })
    }
}

function setWindowsLayout() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w > h) {
        $('#sidebar').show('fast')
        $('#content-container').css('margin-left', '300px')
        $('#btn-showsidebar').show()
        $('#btn-showoffcanvas').hide()
        $('#bottombar').hide('fast')
    } else {
        $('#sidebar').hide('fast')
        $('#content-container').css('margin-left', '0')
        $('#bottombar').show('fast')
        $('#btn-showoffcanvas').show()
        $('#btn-showsidebar').hide('fast')
    }

}

window.addEventListener('resize', setWindowsLayout);



