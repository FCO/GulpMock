const {src, dest}   = require( "gulp" )
const { Transform } = require('stream')
const Vinyl         = require( "vinyl" )

const tac = new Transform({objectMode: true})

tac._transform = (file, encoding, callback) => {
    let error  = null
    let output = new Vinyl({
        cmd:      file.cmd.split("").reverse().join(""),
        base:     file.base.split("").reverse().join(""),
        path:     file.path.split("").reverse().join(""),
        contents: Buffer.from(file.contents.toString().split("").reverse().join(""))
    });
    callback(error, output);
}

exports.task1 = () => src("123").pipe(dest("345"))
exports.task2 = () => src("123").pipe(tac).pipe(dest("345"))
