const mock         = require( "mock-require" )
const gulp         = require( "gulp"         )
const Vinyl        = require( "vinyl"        )
const {
    Readable,
    Writable
} = require( "stream" )

class GulpMock {
    constructor(tasks) {
        this.gulp      = gulp
        this.gulp.src  = this.src.bind(this)
        this.gulp.dest = this.dest.bind(this)

        mock("gulp", this.gulp)
        if(tasks) this.setTasks(tasks)
        this.reset()
    }

    setTasks(tasks) {
        this.reset()
        if(typeof(tasks) == "string") {
            tasks = require(tasks)
        }
        this.tasks = tasks
        this.reset()
    }

    reset() {
        this._src_path_test     = () => {}
        this._src_opts_test     = () => {}
        this._src_path          = []
        this._dest_path_test    = () => {}
        this._dest_opts_test    = () => {}
        this._dest_test_emitted = () => {}
    }

    srcOptsTest(testFunc) {
        this._src_opts_test = testFunc
    }

    srcPathTest(testFunc) {
        this._src_path_test = testFunc
    }

    srcEmit({ cmd = "/", base = cmd, file, path = `${ base }/${ file }`, contents = "" }) {
        this._src_path.push( new Vinyl({ cmd, base, path, contents: Buffer.from(contents) }) )
    }

    destOptsTest(testFunc) {
        this._dest_opts_test = testFunc
    }

    destPathTest(testFunc) {
        this._dest_path_test = testFunc
    }

    destEmittedTest(testFunc) {
        this._dest_test_emitted = testFunc
    }

    run(taskName, ...data) {
        let self = this
        return new Promise(acc => this.tasks[taskName](this.gulp, ...data).on("finish", () => acc()))
    }

    src(paths, opts) {
        this._src_path_test(paths)
        this._src_opts_test(opts)
        let stream = new Readable({
            objectMode: true,
            emitClose:  true,
            read() {}
        })
        this._src_path.forEach(item => stream.push( item ))
        stream.push( null )
        return stream
    }

    dest(dir, opts) {
        this._dest_path_test(dir)
        this._dest_opts_test(opts)

        let self = this
        let stream = new Writable({
            objectMode: true,
            emitClose:  true,
            write(file, encoding, done) {
                self._dest_test_emitted(file)
                done()
            }
        })
        return stream
    }
}

module.exports = GulpMock
