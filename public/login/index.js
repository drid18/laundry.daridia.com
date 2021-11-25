import { swal } from "../utility/swal.js";

$('#btn-login').on('click', function () {

    swal.showLoading()

    const options = {
        method: 'POST',
        url: '/service/user/login',
        headers: {
            'Content-Type': 'application/json'
        },
        data: { username: $('#username-input').val(), password: $('#password-input').val() }
    };

    axios.request(options).then(function (response) {
        // console.log(response.data);
        // alert(JSON.stringify(response.data.rc))
        if (response.data.rc === "00") {
            swal.showSuccess('Mengarahkan ke halaman dashboard')
            window.location.href = '/dashboard'
        } else {
            swal.showFailed(response.data.rm)
        }
    }).catch(function (error) {
        console.error(error);
        alert(JSON.stringify(error))
    });
})

$('#btn-show-registration').on('click', function () {
    $('#login-box').hide('fast')
    $('#regis-box').show('slow')
})

$('#btn-show-login').on('click', function () {
    $('#login-box').show('slow')
    $('#regis-box').hide('fast')
})

$('#btn-regis').on('click', function () {
    var username = $('#reg-username').val()
    var fullname = $('#reg-fullname').val()
    var phone_number = $('#reg-phone').val()
    var email = $('#reg-email').val()
    var password = $('#reg-password').val()
    var conf_pass = $('#reg-conf-password').val()

    console.log(username);
    console.log(fullname);
    console.log(phone_number);
    console.log(email);
    console.log(password);

    if (fullname && phone_number && email) {
        if (!(/\s/).test(username)) {
            if (password === conf_pass) {
                swal.showLoading()
                const options = {
                    method: 'POST',
                    url: '/service/user/registration',
                    headers: { 'Content-Type': 'application/json' },
                    data: {
                        username: username,
                        password: password,
                        fullname: fullname,
                        phone_number: phone_number,
                        email: email,
                        type: '2'
                    }
                };

                axios.request(options).then(function (response) {
                    console.log(response.data);
                    if (response.data.rc === "00") {
                        swal.showSuccess('Nama Pengguna anda berhasil di buat, silahkan masuk')
                        $('#login-box').show('slow')
                        $('#regis-box').hide('fast')
                    } else {
                        swal.showFailed(response.data.rm)
                    }
                }).catch(function (error) {
                    console.error(error);
                });
            } else {
                swal.showFailed('Konfirmasi Password tidak sesuai')
            }
        } else {
            swal.showFailed('Username tidak boleh mengandung spasi')
        }
    } else {
        swal.showFailed('Semua kolom harus diisi')
    }
})
