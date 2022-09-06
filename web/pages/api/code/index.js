import { runSandbox } from "../../../sandbox/runSandbox";

export default async function handler(req, res) {

    let { code } = req.body;
    await runSandbox(code).then((reponse) => {
        res.status(200).send(reponse);
    }).catch(error => {
        console.error(error);
        res.status(500).send(error);
        return;
    });
}