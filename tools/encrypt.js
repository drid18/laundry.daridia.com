var forge = require("node-forge");
const { dbmodel } = require("../src/model/db");

// md.update('The quick brown fox jumps over the lazy dog');
// console.log(md.digest().toHex());

async function run(params) {
    var updateUser = await dbmodel.userapp.findAll({ raw: true });
    // console.log(updateUser);

    for (let x = 0; x < updateUser.length; x++) {
        const element = updateUser[x];
        console.log(element.id);
        console.log(element.password);
        var pass = element.password;
        var md = forge.md.md5.create();
        md.update(pass);
        console.log(md.digest().toHex());
        await dbmodel.userapp.update({ password: md.digest().toHex() }, { where: { id: element.id } });
    }
}
run();
