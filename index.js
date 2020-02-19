const querystring = require('querystring');
const core = require('@actions/core');
const https = require('https');

function Post(data, host, headers) {
    const opt = {
        method: 'POST',
        headers: headers,
        rejectUnauthorized: false,
        timeout: 30000
    };

    let requestCallback = (resolve)=>{
        return (result)=>{
            const encoding = result.headers['content-encoding'];
            if( encoding === 'undefined'){
                result.setEncoding('utf-8');
            }
            let chunks = '';
            result.on('data', function(chunk) {
                    try {
                    chunks+=(chunk);
                    } catch(e) {
                    console.log(e);
                    }
                    }).on('end', function(){
                        if (chunks !== undefined && chunks != null) {
                        resolve(chunks);
                        } else {
                        // 请求获取不到返回值
                        resolve(opt.host+"无返回值ERROR");
                        }
                        })
        }};
    Object.assign(opt,{timeout: 15000});
    return new Promise((resolve, reject) => {
            let cb = requestCallback(resolve);
            const req = https.request(host, opt, cb);
            req.on('error', function (e) {
                    // request请求失败
                    console.log(opt.host+'请求失败: ' + e.message);
                    reject("0");
                    });
            req.write(data);
            req.end();
    });
}


async function run() {
    try { 
        let postData = querystring.stringify({
            text: core.getInput('text',{ required: true }),
            desp: core.getInput('desp')
            });

        let SCKEY = core.getInput('SCKEY',{ required: true });
        return Post(postData,`https://sc.ftqq.com/${SCKEY}.send`, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
        },'https');
    } 
    catch (error) {
        console.log(error);
    }
}

run();
