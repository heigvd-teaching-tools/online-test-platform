
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data)
})

process.stdin.on("end", () => {
});
