import {Octokit} from "@octokit/rest";
import {createAppAuth} from "@octokit/auth-app"
import { readFileSync } from 'fs';

// onlinetest_oktokit
// GitApp : https://github.com/settings/apps/heig-gitbrowser

// App ID: 284699
// Client ID: 
// Secret : 

// you must have a private key to use App authentication

const privateKey = readFileSync('./git_browser/key.pem', 'utf8');

/*
    HEIG-GitBrowser must be installed on the repository to be able to access it.
    The installation ID is the ID of the installation of GitBrowser on the repository.
    You can find it in the URL of the installation page.
* */


/*  
    This function returns a map of all the files in the repository.
    Its using App authentication with an installation ID to access the repository.
*/
export async function getProjectApp({ installationId, owner, repo, ref }) {
    console.log("getProjectApp")
    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: 284699,
            privateKey: privateKey,
            installationId: installationId
        }
    });


    let filesMap = await getContents(octokit, { owner, repo, ref });
    for(const [key, value] of filesMap){
        console.log("KEY", key);
        console.log("VALUE", value);
    }
    return filesMap;
}

/*
    This function returns a map of all the files in the repository.
    Its using Personal Access Token to access the repository.
*/

export const getProjectPat = async ({ pat, owner, repo, ref }) => {
    console.log("getProjectPat")
    const octokit = new Octokit({
        auth: pat
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
