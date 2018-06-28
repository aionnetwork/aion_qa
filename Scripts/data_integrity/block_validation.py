import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)

user = "powerbi"
pswrd = "rhsmmd7XPPoWCOOY"
host = "104.215.122.28"
db = "aionv3"

eTime24h = time.time()
sTime24h = eTime24h - 86400
cnx = sql.connect(user=user, password=pswrd, host=host, database=db)


### DATABASE ###
df = pd.read_sql("SELECT from_addr, nonce, real_timestamp FROM transaction WHERE block_timestamp > " + str(sTime24h) + " ORDER BY transaction_timestamp DESC", cnx)
address = df["from_addr"].unique()

dfo = pd.DataFrame(columns=['Address', 'Transaction', 'Nonce', 'Difference'])

count=0
for i in address:
    addrTxs = pd.read_sql("SELECT from_addr, nonce, real_timestamp FROM transaction WHERE from_addr='" + address[count] + "' ORDER BY transaction_timestamp DESC", cnx)
    lastRow = addrTxs.iloc[0]
    transactions = len(addrTxs)
    nonceDecimal = int(lastRow["nonce"], 16) + 1
    differences = transactions - nonceDecimal

    series = pd.Series([address[count], transactions, nonceDecimal, differences], index=['Address', 'Transaction', 'Nonce', 'Difference'])
    dfo = dfo.append(series, ignore_index=True)
    count = count + 1

### OUTPUT ###
dfo = dfo.set_index("Address")
print(dfo)
print("\nAverage Difference (Last 24 Hours):", dfo["Difference"].mean())

### EXPORT ###
#dfo.to_csv('validation ' + lastRow["real_timestamp"] + '.csv')

cnx.close()