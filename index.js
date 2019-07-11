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

        if(tasks) this.setTasks(tasks)
        this.reset()
    }

    setTasks(tasks) {
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
        return this.tasks[taskName](this.gulp, ...data)
    }

    src(paths, opts) {
        this._src_path_test(paths)
        this._src_opts_test(opts)
        let stream = new Readable({ objectMode: true })
        stream._read = () => {}
        this._src_path.forEach(item => stream.push( item ))
        return stream
    }

    dest(dir, opts) {
        this._dest_path_test(dir)
        this._dest_opts_test(opts)

        let stream = new Writable({ objectMode: true })
        stream._write = file => {
            this._dest_test_emitted(file)
        }
        return stream
    }
}

module.exports = GulpMock
