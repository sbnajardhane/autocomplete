var gulp = require("gulp"),
    eslint = require("gulp-eslint"),
    nodemon = require("./index");

gulp.task("lint", function() {
    gulp.src(["**/**/*.js", "!node_modules/**"])
        .pipe(eslint())
        .pipe(eslint.format())
        // Brick on failure to be super strict
        .pipe(eslint.failAfterError());
    // .pipe(eslint.failOnError());
});

gulp.task("afterstart", function() {
    console.log("proc has finished restarting!");
});

gulp.task("server", ["lint"], function() {
    var stream = nodemon({
        nodemon: require("nodemon"),
        script: "./server.js",
        verbose: true,
        env: {
            "NODE_ENV": "development"
        },
        watch: "./"
    });

    stream
        .on("restart", ["lint"])
        .on("crash", function() {
            console.error("\nApplication has crashed!\n");
            console.error("Restarting in 2 seconds...\n");
            setTimeout(function() {
                stream.emit("restart");
            }, 2000);
        });
});


// gulp.on("start", function() {})
