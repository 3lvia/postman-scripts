var tokenEndpoint = pm.environment.name == '3_prod' ? 'https://elvid.elvia.io/connect/token' : 'https://elvid.test-elvia.io/connect/token';
var tokenconfig = JSON.parse(pm.variables.replaceIn(pm.collectionVariables.get('tokenconfig')));

const tokenPostRequest = {
  url: tokenEndpoint,
  method: 'POST',
  header: 'Content-Type:application/x-www-form-urlencoded',
  body: {
    mode: 'urlencoded',
    urlencoded: [
        {key: 'client_id', value: tokenconfig.clientid},
        {key: 'client_secret', value: tokenconfig.clientsecret},
        {key: 'grant_type', value: tokenconfig.username != null ? 'password' : 'client_credentials'},
        {key: 'scope', value: tokenconfig.scope},
        {key: 'username', value: tokenconfig.username},
        {key: 'password', value: tokenconfig.password},
        ]
  }
};

var getToken = true;
if(pm.collectionVariables.get('generated-accesstoken-environment') != pm.environment.name){
    console.log('Token is generated for another environment (or missing).')
}
else if (isNaN(new Date(pm.collectionVariables.get('generated-accesstoken-expiry')).getTime()) || !pm.collectionVariables.get('generated-accesstoken')) {
    console.log('Token or expiry date are missing. ')
} else if (pm.collectionVariables.get('generated-accesstoken-expiry') <= (new Date()).getTime()) {
    console.log('Token is expired')
} else {
    getToken = false;
    console.log('Token and expiry date are all good (you can see them in the environment variables).');
}

if (getToken === true) {
    console.log('Sending token request');
    pm.sendRequest(tokenPostRequest, function (err, res) {
        console.log("GetToken response", "res:", res, "err:", err);
        if (err != null) {
            console.log('TokenEndpoint request', tokenPostRequest);
            throw "Error when sending request to tokenEndpoint. Check logs for tokenEndpoint request info. Maybe something is wrong there?"
        }

        if (res.code != 200) {
            console.log('TokenEndpoint request', tokenPostRequest);
            throw "tokenEndpoint returned " + res.code + " " + res.status + ", expected 200 OK. Check logs for tokenEndpoint request info. Maybe something is wrong there?"
        }

        var responseJson = res.json();
        console.log('generated-accesstoken and other generated collectionVariables is now updated.')
        pm.collectionVariables.set('generated-accesstoken', responseJson.access_token)

        var expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + responseJson.expires_in);
        pm.collectionVariables.set('generated-accesstoken-expiry', expiryDate.getTime());
        pm.collectionVariables.set('generated-accesstoken-expiry-human-readable', expiryDate);
        pm.collectionVariables.set('generated-accesstoken-environment', pm.environment.name);
    });
}