import { render, html } from "../node_modules/lit-html/lit-html.js";
import { swal } from "../utility/swal.js";

var table;

export async function user() {
    render(
        html`
            <div class="container">
                <h1>DAFTAR KARYAWAN</h1>
                <hr />
                <div class="container">
                    <button id="add-user" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3" style="width:50px"><i class="fa fa-plus" aria-hidden="true"></i></button>
                    <button id="edit-user" type="button" class="btn btn-sm bgs-bluelight float-right mt-3 mb-3" style="width:50px"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                    <button id="delete-user" type="button" class="btn btn-sm bgs-redlight float-right mt-3 mb-3" style="width:50px"><i class="fa fa-minus" aria-hidden="true"></i></button>
                    <div id="table-container" style="min-width:100%"></div>
                </div>
            </div>
        `,
        $("#content-container")[0]
    );

    swal.showLoading();

    setUserdata();
}

async function setUserdata() {
    render(html` <table id="table-data" class="table"></table> `, $("#table-container")[0]);

    table = $("#table-data").DataTable({
        responsive: true,
        scrollX: true,
        scrollY: "80%",
        select: true,
        ajax: {
            type: "POST",
            url: "/service/user",
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

                    element.status_view =
                        element.status === 0
                            ? '<p class="bg-warning rounded text-center text-white">Tidak Aktif</p>'
                            : element.status === 1
                            ? '<p class="bg-success rounded text-center text-white">Aktif</p>'
                            : '<p class="bg-danger rounded text-center text-white">Terblokir</p>';

                    element.type_view =
                        element.type === 0
                            ? '<p class="bg-dark rounded text-center text-white">Developer</p>'
                            : element.type === 1
                            ? '<p class="bg-primary rounded text-center text-white">Admin</p>'
                            : '<p class="bg-secondary rounded text-center text-white">Operator</p>';

                    if (element.type !== 2) element.cabang_view = "Admin";
                    if (element.type === 2) element.cabang_view = element.cabang_name ? element.cabang_name : "-";
                }
                return dataset;
            },
        },
        columns: [
            { title: "id", data: "id" },
            { title: "Tipe Karyawan", data: "type_view", width: "100px" },
            { title: "Status", data: "status_view", width: "100px" },
            { title: "Cabang", data: "cabang_view", width: "150px" },
            { title: "Nama Pengguna", data: "username", width: "150px" },
            { title: "Nama Lengkap", data: "fullname", width: "250px" },
            { title: "Nomor HP", data: "phone_number", width: "150px" },
            { title: "Email", data: "email", width: "200px" },
            { title: "tanggal dibuat", data: "cr_time_view", width: "150px" },
            { title: "tanggal diubah", data: "mod_time_view", width: "150px" },
        ],
        dom: "frtp",
        // columnDefs: [
        //     { "className": "dt-center", "targets": "_all" }
        // ],
        drawCallback: function (settings) {
            setTimeout(() => {
                swal.close();
            }, 1000);
        },
    });

    $("#add-user").on("click", function () {
        addUser();
    });
    $("#edit-user").on("click", function () {
        var data = table.rows({ selected: true }).data();
        editUser(data);
    });
    $("#delete-user").on("click", function () {
        var data = table.rows({ selected: true }).data();
        deleteUser(data);
    });
}

async function addUser() {
    swal.showModal(
        "Ubah Data Karyawan",
        html`
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-username" />
                <label for="input-username">Nama Pengguna</label>
            </div>
            <div class="form-floating mb-3">
                <input type="password" class="form-control" id="input-password" />
                <label for="input-password">Kata Sandi</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-fullname" />
                <label for="input-fullname">Nama Lengkap</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-phone" />
                <label for="input-phone">Nomor HP</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="input-email" />
                <label for="input-email">Email</label>
            </div>
            <div class="form-floating mb-3">
                <select class="form-select" id="input-type">
                    <option value="0">Developer</option>
                    <option value="1">Admin</option>
                    <option value="2">Operator</option>
                </select>
                <label for="input-type">Tipe Karyawan</label>
            </div>
            <div class="mb-3">
                <button id="input-new-user" type="button" class="btn btn-outline-dark">Tambah Karyawan</button>
            </div>
        `
    );

    $("#input-type").val("2").change();

    $("#input-new-user").on("click", function () {
        var username = $("#input-username").val();
        var password = $("#input-password").val();
        var fullname = $("#input-fullname").val();
        var email = $("#input-email").val();
        var phone = $("#input-phone").val();
        var type = $("#input-type").val();

        if (username && password && fullname && email && phone && type) {
            swal.showLoading();
            const options = {
                method: "POST",
                url: "/service/user/registration",
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    username: username,
                    password: password,
                    fullname: fullname,
                    phone_number: phone,
                    email: email,
                    type: type,
                },
            };

            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                    swal.showSuccess("Karyawan berhasil ditambahkan");
                    window.location.reload();
                })
                .catch(function (error) {
                    swal.showFailed("Gagal");
                    console.error(error);
                });
        } else {
            swal.showFailed("Semua kolom harus di isi");
        }
    });
}
async function editUser(data) {
    var brachselect = html``;
    if (data[0].type === 2) {
        swal.showLoading("Memuat data...");
        var brachlist = await getBranchList();
        if (data[0].branch === null) {
            console.log("brach null");
            brachselect = html`
                <div class="form-floating mb-3">
                    <select class="form-select" id="edit-input-branch">
                        <option value="99">pilih cabang...</option>
                        ${brachlist.map((item) => html`<option value="${item.id}">${item.name}</option>`)}
                    </select>
                    <label for="edit-input-branch">Cabang</label>
                </div>
            `;
            if (data[0].type !== 2) {
                brachselect = html``;
            }
        } else {
            brachselect = html`
                <div class="form-floating mb-3">
                    <select class="form-select" id="edit-input-branch">
                        ${brachlist.map((item) => html`<option value="${item.id}">${item.name}</option>`)}
                    </select>
                    <label for="edit-input-branch">Cabang</label>
                </div>
            `;
        }
    }

    swal.showModal(
        "Ubah Data Karyawan",
        html`
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-username" value="${data[0].username}" />
                <label for="edit-input-username">Nama Pengguna</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-fullname" value="${data[0].fullname}" />
                <label for="edit-input-fullname">Nama Lengkap</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-phone" value="${data[0].phone_number}" />
                <label for="edit-input-phone">Nomor HP</label>
            </div>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="edit-input-email" value="${data[0].email}" />
                <label for="edit-input-email">Email</label>
            </div>
            <div class="form-floating mb-3">
                <select class="form-select" id="edit-input-status" value="${data[0].status}">
                    <option value="0">Tidak Aktif</option>
                    <option value="1">Aktif</option>
                    <option value="2">Terblokir</option>
                </select>
                <label for="edit-input-status">Status</label>
            </div>
            <div class="form-floating mb-3">
                <select class="form-select" id="edit-input-type" value="${data[0].type}">
                    <option value="0">Developer</option>
                    <option value="1">Admin</option>
                    <option value="2">Operator</option>
                </select>
                <label for="edit-input-type">Tipe Karyawan</label>
            </div>
            ${brachselect}
            <div class="mb-3">
                <button id="input-edit-password" type="button" class="btn btn-outline-dark">Ganti Password</button>
            </div>
            <div class="mb-3">
                <button id="input-edit-user" type="button" class="btn btn-outline-dark">Ubah Data Karyawan</button>
            </div>
        `
    );

    $("#edit-input-type").val(data[0].type).change();
    $("#edit-input-status").val(data[0].status).change();

    if (data[0].branch !== null) $("#edit-input-branch").val(data[0].branch).change();

    $("#input-edit-password").on("click", function () {
        swal.showModal(
            "Ubah Data Pelanggan",
            html`
                <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="edit-input-newpass" />
                    <label for="edit-input-password">Masukkan Password</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="edit-input-newpassconf"/>
                    <label for="edit-input-password-conf">Konfirmasi Password</label>
                </div>
                <div class="mb-3">
                    <button id="confirm-update-pass" type="button" class="btn btn-outline-dark">Ganti Password</button>
                </div>
            `
        );

        $("#confirm-update-pass").on("click", function () {
            var new_pass = $("#edit-input-newpass").val();
            var conf_pass = $("#edit-input-newpassconf").val();
            if (new_pass !== conf_pass) {
                swal.showFailed("Konfirmasi Password tidak sesuai");
                return;
            }

            const options = {
                method: "POST",
                url: "/service/user/updatepass",
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    userid: data[0].id,
                    password: new_pass,
                },
            };
            console.log(options);
            swal.showLoading();
            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                    swal.showSuccess("Berhasil mengubah password");
                    // window.location.reload()
                    table.ajax.reload();
                })
                .catch(function (error) {
                    swal.showFailed("Gagal");
                    console.error(error);
                });
        });
    });

    $("#input-edit-user").on("click", function () {
        var edit_username = $("#edit-input-username").val();
        var edit_fullname = $("#edit-input-fullname").val();
        var edit_phone = $("#edit-input-phone").val();
        var edit_email = $("#edit-input-email").val();
        var edit_type = $("#edit-input-type").val();
        var edit_status = $("#edit-input-status").val();
        var edit_branch = $("#edit-input-branch").val();

        if ($("#edit-input-branch").val() === "99") {
            edit_branch = null;
        }

        if (data[0].type !== 2) {
            edit_branch = null;
        }

        const options = {
            method: "POST",
            url: "/service/user/update",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                userid: data[0].id,
                username: edit_username,
                password: data[0].password,
                fullname: edit_fullname,
                phone_number: edit_phone,
                email: edit_email,
                type: edit_type,
                status: edit_status,
                branch: edit_branch,
            },
        };
        console.log(options);
        swal.showLoading();
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                swal.showSuccess("Berhasil mengubah data");
                window.location.reload();
            })
            .catch(function (error) {
                swal.showFailed("Gagal");
                console.error(error);
            });
    });
}

async function deleteUser(data) {
    try {
        data[0].id;
    } catch (error) {
        swal.showInfo("Pilih Karyawan terlebih dulu");
        return;
    }

    swal.showModal(
        "Yakin ingin menghapus Karyawan ini?",
        html`
            <div class="mb-3">
                <hr />
                <b><small>Nama Pengguna</small></b>
                <p>${data[0].username}</p>
                <b><small>Nama Lengkap</small></b>
                <p>${data[0].fullname}</p>
                <b><small>No HP</small></b>
                <p>${data[0].phone_number}</p>
                <b><small>Email</small></b>
                <p>${data[0].email}</p>
                <hr />
                <button id="confirm-delete" type="button" class="btn btn-outline-danger">Yakin</button>
                <button id="cancel-delete" type="button" class="btn btn-outline-dark">Tidak</button>
            </div>
        `
    );

    $("#cancel-delete").on("click", function () {
        swal.close();
    });
    $("#confirm-delete").on("click", function () {
        swal.showLoading();
        const options = {
            method: "POST",
            url: "/service/user/delete",
            headers: { "Content-Type": "application/json" },
            data: { userid: data[0].id },
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                swal.showSuccess("Data Berhasil di Hapus");
                window.location.reload();
            })
            .catch(function (error) {
                swal.showFailed("Gagal");
                console.error(error);
            });
    });
}

async function getBranchList() {
    return await new Promise(function (resolve, reject) {
        var options = {
            method: "POST",
            url: "/service/branch",
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                resolve(response.data.data);
            })
            .catch(function (error) {
                console.error(error);
                reject(error);
            });
    });
}
