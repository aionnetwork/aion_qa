import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)
pd.set_option('display.max_columns', 10)

### PARAMETERS ###
view = "time"
#view = "block"
#view = "all"
numHours = 0.1
numBlocks = 10

user = "powerbi"
pswrd = "rhsmmd7XPPoWCOOY"
host = "104.215.122.28"
db = "aionv3"
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
query = "id, " \
        "block_number, " \
        "transaction_timestamp," \
        "block_timestamp"

dft = pd.read_sql("SELECT " + query + " FROM transaction " + filter + " ORDER BY transaction_timestamp DESC", cnx).set_index("id")
dft["latency"] = dft["block_timestamp"] - ( dft["transaction_timestamp"] / 1000000 )
print(dft)
print("\nAverage Latency (", export, "):", dft["latency"].mean())

### EXPORT ###
last = dft["block_timestamp"].max()
#dft.to_csv('tx_latency (' + export + ') ' + datetime.fromtimestamp(int(last)).strftime('%Y-%m-%d %H:%M:%S') + '.csv')
cnx.close()