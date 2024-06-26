
async function entryRegister(url, data) {
    let mPromise = new Promise((resolve, reject) => {
        axios
            .post(url, data, {
                headers: {
                    "content-type": "multipart/form-data",
                    authorization: AUTHORIZATION_KEY,
                },
            })
            .then((response) => {
                resolve(response.data?.request_id);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    })
    return await mPromise
}

async function entryCheck(data) {
    let mPromise = new Promise((resolve, reject) => {
        axios
            .post(`${apiUri()}/entry_check`, data, {
                headers: {
                    "content-type": "application/json",
                    authorization: AUTHORIZATION_KEY,
                },
            })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
    return await mPromise
}
