#!/usr/bin/env nodejs
module.exports = function(w3, acc, pass, abi, code){
    return new Promise((resolve, reject)=>{
        w3.personal.unlockAccount(acc, pass, 49999, (err, unlock) => {
                if (err) {
                    reject(err)
                }
                else if (unlock && unlock === true) {
                    //console.log('Account unlocked')

                    w3.eth.contract(abi).new({
                        from: acc,
                        data: code,
                        gas: 4699999,
                        gasPrice: 1
                    }, (err, tx) => {
                        if (err) {
                         //   console.log('error in deploying contract ' + err);
                            reject(err)
                        }
                        else if(tx && tx.address) {
                           // console.log('contract deployed at address ' + tx.address);
                            resolve(tx)
                        }
                    });
                }
            }
        );

            })

}

