# postman-scripts
POC for having common pre-request scripts in postman.

## Setup collection
### pre-request script
```
pm.sendRequest({  url: "https://raw.githubusercontent.com/3lvia/postman-scripts/trunk/common-pre-request-script-single-tokenconfig_v1.js", method: 'GET'}, function (err, res) {
    eval(res.text());
});
```

### Variable
Add variable tokenconfig, with current value a referense to some environment-variable eg {{louvre-image-api-tokenconfig}}

### Authorization
Type Bearer Token
Token {{generated-accesstoken}}

## Setup environment
Add variable that was referenced by collection (tokenconfig).
E.g. louvre-image-api-tokenconfig: {  "clientid": "***",  "clientsecret": "***"}

## Setup request
Authorization, inherit auth from parent
