#!/usr/bin/env nodejs

module.exports = function(w3, acc, pass, abi, code){
    return new Promise((resolve, reject)=>{
        w3.personal.unlockAccount(acc, pass, 49999, (err, unlock) => {
                if (err) {
                    reject(err)
                }
                else if (unlock && unlock === true) {
                    //console.log('Account unlocked')
                    var personnelABI = abi;
                    var personnelCode = code;
                    w3.eth.contract(personnelABI).new({
                        from: acc,
                        data: personnelCode,
                        gas: 4699999
                    }, (err, tx) => {
                        if (err) {
                           console.log('error in deploying contract ' + err);
                            reject(err)
                        }
                        else if(tx && tx.address) {
                            console.log('contract deployed at address ' + tx.address);
                            resolve(tx)
                        }
                    });
                }
            }
        );

            })

}

