const _dbmodel = require("../src/model/db")._dbmodel
const dbmodel = require("../src/model/db").dbmodel

async function generate(month) {
    var customer = await _dbmodel.query('select * from customer c')
    var product = await _dbmodel.query('select * from product p')

    // console.log(JSON.stringify(customer));
    // console.log(JSON.stringify(product));

    for (let index = 0; index <= random(10); index++) {
        var randdate = randomdate('2021', month)
        var randcustomer = customer[0]
        var randproduct = product[0]

        var ranpronumber = random(randproduct.length - 1)
        var rancusnumber = random(randcustomer.length - 1)
        // console.log(rancusnumber);
        // console.log(randcustomer[rancusnumber]);
        // console.log(ranpronumber);
        // console.log(randproduct[ranpronumber]);

        datarandproduct = randproduct[ranpronumber];
        datarandcustomer = randcustomer[rancusnumber];

        var rules = JSON.parse(datarandproduct.rules)
        var kg = random(5)
        var gendata = {
            cr_time: randdate,
            mod_time: randdate,
            user: 'Dummy',
            customer: datarandcustomer.phone_number,
            product: datarandproduct.id,
            payment: 1,
            amount: kg * rules.price,
            status: 2,
            data: JSON.stringify({
                kg: kg,
                price: rules.price,
                productname: datarandproduct.name,
                customername: datarandcustomer.fullname
            }),
        }
        // console.log(gendata);

        var newTransaction = await dbmodel.transaction.create({
            cr_time: randdate,
            mod_time: randdate,
            user: 'Dummy',
            customer: datarandcustomer.phone_number,
            product: datarandproduct.id,
            payment: 1,
            amount: kg * rules.price,
            status: 2,
            data: JSON.stringify({
                kg: kg,
                price: rules.price,
                productname: datarandproduct.name,
                customername: datarandcustomer.fullname
            }),
        })

        console.log(newTransaction.toJSON());
    }

    console.log("done-----");

}
generate('1')
generate('2')
generate('3')
generate('4')
generate('5')
generate('6')
generate('7')
generate('8')
generate('9')
generate('10')

function random(max) {
    return Math.floor(Math.random() * max);
}
function random2d(max) {
    return random(max).toString().padStart(2, "0")
}

function randomdate(year, month) {
    return `${year}-${month}-${random2d(29)} ${random2d(23)}:${random2d(59)}:${random2d(59)}`
}

function test() {
    for (let index = 0; index < 10; index++) {
        console.log(randomdate('2021', '11'));
    }
}

// test()