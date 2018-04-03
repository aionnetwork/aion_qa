module.exports = function(w3){
	return new Promise((resolve, reject)=>{
		w3.eth.getAccounts((err, accounts)=>{
			if(err)
				reject(err);
			if(accounts){
				if(accounts.length == 0)
					reject('no account')
				else{
					w3.personal.unlockAccount(accounts[0], '', 999999, (err, unlock)=>{
						if(err)
							reject(err)
						else if(unlock && unlock === true)
							resolve(accounts[0])
						else
							reject('unlock fail')
					})
				}
			}
		})
	})
}