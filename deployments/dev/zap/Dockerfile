FROM owasp/zap2docker-bare

RUN zap.sh -cmd -addonupdate -addoninstall pscanrulesAlpha -addoninstall pscanrulesBeta

CMD zap.sh -daemon -host 0.0.0.0 -port 8090 -config api.disablekey=true -config database.recoverylog=false -config connection.timeoutInSecs=120 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true
