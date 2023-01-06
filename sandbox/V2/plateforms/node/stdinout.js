console.log("STDINOUT");
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data + "\n")
})

process.stdin.on("end", () => {
    console.log("Input stream ended");
});