import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)

### PARAMETERS ###
view = "time"
#view = "block"
#view = "all"
numHours = 24
numBlocks = 2400

user = ""
pswrd = ""
host = ""
db = ""

cnx = sql.connect(user=user, password=pswrd, host=host, database=db)

if view == "time":
    eTime = time.time()
    sTime = eTime - (numHours * 3600)
    filter = "WHERE block_timestamp >= " + str(sTime)
    export = "last " + str(numHours) + " hours"
elif view == "block":
    eBlock = pd.read_sql("SELECT MAX(block_number) AS CurrBlock FROM transaction", cnx).values[0][0]
    sBlock = eBlock - numBlocks
    filter = "WHERE block_number >= " + str(sBlock)
    export = "last " + str(numBlocks) + " blocks"
else:
    filter = ""
    export = "all blocks"

### DATABASE ###
query = "from_addr, " \
        "nonce, " \
        "real_timestamp"

df = pd.read_sql("SELECT " + query + " FROM transaction " + filter + " ORDER BY transaction_timestamp DESC", cnx)
dfo = pd.DataFrame(columns=['Address', 'Transaction', 'Nonce', 'Difference'])
address = df["from_addr"].unique()
count = 0
for i in address:
    addrTxs = pd.read_sql("SELECT  " + query + " FROM transaction WHERE from_addr='" + address[count] + "' ORDER BY transaction_timestamp DESC", cnx)
    lastRow = addrTxs.iloc[0]
    transactions = len(addrTxs)
    nonceDecimal = int(lastRow["nonce"], 16) + 1
    differences = transactions - nonceDecimal

    series = pd.Series([address[count], transactions, nonceDecimal, differences], index=['Address', 'Transaction', 'Nonce', 'Difference'])
    dfo = dfo.append(series, ignore_index=True)
    count = count + 1

### OUTPUT ###
dfo = dfo.set_index("Address")
print(dfo, "\n\nAverage Difference (Last 24 Hours):", dfo["Difference"].mean())

### EXPORT ###
last = df["real_timestamp"].max()
#dfo.to_csv('tx_validation (' + export + ') ' + last + '.csv')
cnx.close()
