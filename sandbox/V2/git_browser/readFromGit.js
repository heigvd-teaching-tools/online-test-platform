import {Octokit} from "@octokit/rest";
import {createAppAuth} from "@octokit/auth-app"
import { readFileSync } from 'fs';

// onlinetest_oktokit
// GitApp : https://github.com/settings/apps/heig-gitbrowser
// App ID: 284699
// Client ID: Iv1.9dfa9c701bd639f4
// Secret : 52ffdfa3af5e513fe32798a05c7ff42bfc62d0df

const privateKey = readFileSync('./git_browser/key.pem', 'utf8');

/*
    HEIG-GitBrowser must be installed on the repository to be able to access it.
    The installation ID is the ID of the installation of GitBrowser on the repository.
    You can find it in the URL of the installation page.
* */

const authOptions = {
    appId: 284699,
    privateKey: privateKey,
    installationId: 33423700
}

export async function getProject({ pat, owner, repo, ref }) {
    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: authOptions
    });

    let filesMap = await getContents(octokit, { owner, repo, ref });
    for(const [key, value] of filesMap){
        console.log("KEY", key);
        console.log("VALUE", value);
    }
    return filesMap;
}

export async function getContents(octokit, params, path = undefined) {
    const filesMap = new Map();
    const { data: contents } = await octokit.repos.getContent({
        ...params,
        path: path,
    });
    for (const element of contents) {
        if(element.type === 'file'){
            // when element is a file, getContent will return the content of the file
            const { data: content } = await octokit.repos.getContent({
                ...params,
                path: element.path,
            });
            const fileContentString = Buffer.from(content.content, 'base64').toString();
            filesMap.set(element.path, fileContentString);
        }else if(element.type === 'dir'){
            // otherwise, getContent will return the content of the directory -> array of files
            for (const [key, value] of await getContents(octokit, params, element.path)) {
                filesMap.set(key, value);
            }
        }
    }
    return filesMap;
}
