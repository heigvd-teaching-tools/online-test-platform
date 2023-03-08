
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data)
    process.stdout.write("\n")
})

process.stdin.on("end", () => {
});
