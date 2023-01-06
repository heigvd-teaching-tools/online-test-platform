
process.stdout.write("Testing standard streams");
process.stdout.write("\n");
process.stdin.on("data", data => {
    data = data.toString().toUpperCase()
    process.stdout.write(data)
    process.stdout.write("\n");
})

process.stdin.on("end", () => {
    process.stdout.write("Input stream ended")
    process.stdout.write("\n");
});
