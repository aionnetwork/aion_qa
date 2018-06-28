import time
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)
pd.set_option('display.max_columns', 10)

### PARAMETERS ###
view = "time"
#view = "block"
#view = "all"
numHours = 24
numBlocks = 5000

user = "powerbi"
pswrd = "rhsmmd7XPPoWCOOY"
host = "104.215.122.28"
db = "aionv3"
cnx = sql.connect(user=user, password=pswrd, host=host, database=db)

if view == "time":
    eTime24h = time.time()
    sTime24h = eTime24h - (numHours * 3600)
    filter = "WHERE block_timestamp >= " + str(sTime24h)
    export = "Last " + str(numHours) + " Hours"
elif view == "block":
    eBlock = pd.read_sql("SELECT MAX(block_number) AS CurrBlock FROM transaction", cnx).values[0][0]
    sBlock = eBlock - numBlocks
    filter = "WHERE block_number >= " + str(sBlock)
    export = "Last " + str(numBlocks) + " Blocks"
else:
    filter = ""
    export = "All Blocks"

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
#dft.to_csv('tx_latency ' + datetime.fromtimestamp(int(last)).strftime('%Y-%m-%d %H:%M:%S') + '.csv')

cnx.close()