import { render, html } from "../node_modules/lit-html/lit-html.js";


export class swal {
    static showLoading() {
        Swal.fire({
            title: 'Mohon tunggu, sedang memuat data',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })
    }

    static showMessage(message) {
        Swal.fire(message)
    }

    static showInfo(message) {
        Swal.fire(
            'Informasi!',
            message,
            'info'
        )
    }

    static showSuccess(message) {
        Swal.fire(
            'Berhasil!',
            message,
            'success'
        )
    }

    static showFailed(message) {
        Swal.fire(
            'Gagal!',
            message,
            'error'
        )
    }

    static close(mesage) {
        Swal.close()
    }

    static showModal(title, html, callback) {
        Swal.fire({
            title: title,
            html: `<div id="swal-modal-container"></div>`,
            allowOutsideClick: false,
            allowEscapeKey: false,
            focusConfirm: false,
            showCloseButton: true,
            showCancelButton: false, // There won't be any cancel button
            showConfirmButton: false // There won't be any confirm button
        })
        render(html, $('#swal-modal-container')[0])
    }
}