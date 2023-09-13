
export const cleanUpDockerStreamHeaders = (input) => {
    /*
          The response contains some headers that we need to remove
          \x01 -> response comes from stdout
          \x02 -> response comes from stderr
          and the first 8 bytes are the length of the message
      */
    // find \x01 or \x02 and remove the next 8 bytes
    /*
          tried with regexp : input.replaceAll(/(\x01|\x02).{8}/gm, '')
          but it didnt not work
      */

    let output = ''

    for (let i = 0; i < input.length; i++) {
        if (input[i] !== '\x01' && input[i] !== '\x02') {
            output += input[i]
        } else {
            i += 7
        }
    }

    return output
}
