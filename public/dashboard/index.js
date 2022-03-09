import { branch } from "./branch.js?v=1.10";
import { customer } from "./man_customer.js?v=1.10";
import { product } from "./man_product.js?v=1.10";
import { user } from "./man_user.js?v=1.10";
import { report } from "./report.js?v=1.10";
import { sidebar } from "./sidebar.js?v=1.10";
import { transaction } from "./transaction.js?v=1.10";
import { configpage } from "./configpage.js?v=1.10";

export var session = null;

(async function () {

    session = await checkSession()

    sidebar.renderHTML()
    const queryString = window.location.search;
    const contentContainer = "content-container";
    const urlarray = queryString.split("\/");

    console.log(urlarray);

    if (urlarray[0] === '') {
        transaction()
    }
    if (urlarray[0] === '?transaction') {
        transaction()
    }
    if (urlarray[0] === '?user') {
        user()
    }
    if (urlarray[0] === '?customer') {
        customer()
    }
    if (urlarray[0] === '?product') {
        product()
    }
    if (urlarray[0] === '?report') {
        report()
    }
    if (urlarray[0] === '?branch') {
        branch()
    }
    if (urlarray[0] === '?configpage') {
        configpage()
    }

    // checkSession()
})()

async function checkSession() {
    const options = {
        method: 'POST',
        url: '/service/user/checksession',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var result = await new Promise(function (resolve, reject) {
        axios.request(options).then(function (response) {
            console.log(response.data);
            resolve(response.data)
        }).catch(function (error) {
            console.error(error);
            reject(error)
        });
    })

    return result.session
}



