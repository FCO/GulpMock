const Mock          = require("../index.js")
const should        = require("should")
const { Transform } = require('stream')
const Vinyl         = require( "vinyl" )
const mock          = new Mock()

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

describe("inline", () => {
    beforeEach(() => mock.reset())

    it("no content", () => {
        mock.setTasks({ task1: ({ src, dest }) => src("123").pipe(dest("345")) })
        mock.srcEmit({ base: "/bla", file: "ble.bli" })
        mock.srcPathTest(paths => paths.should.be.eql("123"))
        mock.srcOptsTest(opts  => should(opts).be.null)
        mock.destPathTest(paths => paths.should.be.eql("345"))
        mock.destOptsTest(opts  => should(opts).be.null)
        mock.destEmittedTest(file => file.path.toString().should.be.eql("/bla/ble.bli"))
        mock.run("task1")
    })

    it("with content", () => {
        mock.setTasks({ task1: ({ src, dest }) => src("123").pipe(dest("345")) })
        mock.srcEmit({ base: "/bla", file: "ble.bli", contents: "file content" })
        mock.srcPathTest(paths => paths.should.be.eql("123"))
        mock.srcOptsTest(opts  => should(opts).be.null)
        mock.destPathTest(paths => paths.should.be.eql("345"))
        mock.destOptsTest(opts  => should(opts).be.null)
        mock.destEmittedTest(file => {
            file.path.should.be.eql("/bla/ble.bli")
            file.contents.toString().should.be.eql("file content")
        })
        mock.run("task1")
    })

    it("with transformation", () => {
        mock.setTasks({ task1: ({ src, dest }) => src("123").pipe(tac).pipe(dest("345")) })
        mock.srcEmit({ base: "/bla", file: "ble.bli", contents: "file content" })
        mock.srcPathTest(paths => paths.should.be.eql("123"))
        mock.srcOptsTest(opts  => should(opts).be.null)
        mock.destPathTest(paths => paths.should.be.eql("345"))
        mock.destOptsTest(opts  => should(opts).be.null)
        mock.destEmittedTest(file => {
            file.path.should.be.eql("ilb.elb/alb")
            file.contents.toString().should.be.eql("tnetnoc elif")
        })
        mock.run("task1")
    })
})

describe("file", () => {
    it("no content", () => {
        mock.setTasks("./test-gulpfile.js")
        mock.srcEmit({ base: "/bla", file: "ble.bli" })
        mock.srcPathTest(paths => paths.should.be.eql("123"))
        mock.srcOptsTest(opts  => should(opts).be.null)
        mock.destPathTest(paths => paths.should.be.eql("345"))
        mock.destOptsTest(opts  => should(opts).be.null)
        mock.destEmittedTest(file => file.path.toString().should.be.eql("/bla/ble.bli"))
        mock.run("task1")
    })

    it("with content", () => {
        mock.setTasks("./test-gulpfile.js")
        mock.srcEmit({ base: "/bla", file: "ble.bli", contents: "file content" })
        mock.srcPathTest(paths => paths.should.be.eql("123"))
        mock.srcOptsTest(opts  => should(opts).be.null)
        mock.destPathTest(paths => paths.should.be.eql("345"))
        mock.destOptsTest(opts  => should(opts).be.null)
        mock.destEmittedTest(file => {
            file.path.should.be.eql("/bla/ble.bli")
            file.contents.toString().should.be.eql("file content")
        })
        mock.run("task1")
    })

    it("with transformation", () => {
        mock.setTasks("./test-gulpfile.js")
        mock.srcEmit({ base: "/bla", file: "ble.bli", contents: "file content" })
        mock.srcPathTest(paths => paths.should.be.eql("123"))
        mock.srcOptsTest(opts  => should(opts).be.null)
        mock.destPathTest(paths => paths.should.be.eql("345"))
        mock.destOptsTest(opts  => should(opts).be.null)
        mock.destEmittedTest(file => {
            file.path.should.be.eql("ilb.elb/alb")
            file.contents.toString().should.be.eql("tnetnoc elif")
        })
        mock.run("task2")
    })
})
