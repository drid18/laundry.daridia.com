import { customer } from "./man_customer.js";
import { product } from "./man_product.js";
import { user } from "./man_user.js";
import { report } from "./report.js";
import { sidebar } from "./sidebar.js";
import { transaction } from "./transaction.js";

sidebar.renderHTML()

const queryString = window.location.search;
const contentContainer = "content-container";
const urlarray = queryString.split("\/");

console.log(urlarray);

if(urlarray[0] === '') {
    transaction()
}
if(urlarray[0] === '?transaction') {
    transaction()
}
if(urlarray[0] === '?user') {
    user()
}
if(urlarray[0] === '?customer') {
    customer()
}
if(urlarray[0] === '?product') {
    product()
}
if(urlarray[0] === '?report') {
    report()
}



