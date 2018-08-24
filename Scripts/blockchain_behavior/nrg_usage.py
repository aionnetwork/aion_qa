import time
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)
pd.set_option('display.max_columns', 10)

### PARAMETERS ###
view = "time"
#view = "block"
#view = "all"
numHours = 0.1
numBlocks = 20

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
query = "block_number, " \
        "nrg_consumed "

dft = pd.read_sql("SELECT real_timestamp, " + query + " FROM transaction " + filter + " AND nrg_consumed != 0 ORDER BY transaction_timestamp DESC", cnx)
dft1 = dft.groupby("block_number")["nrg_consumed"].sum().to_frame()
dft1.columns = ["txn_consumed"]
dft2 = dft.groupby("block_number")["nrg_consumed"].count().to_frame()
dft2.columns = ["txn_count"]

dfb = pd.read_sql("SELECT " + query + " FROM block " + filter + " AND nrg_consumed != 0 ORDER BY block_timestamp DESC", cnx).set_index("block_number")
dfb.columns = ["block_consumed"]
df = dft2.join(dft1).join(dfb)

block = df.index.max()
valid = True
for index, row in df.iterrows():
    if row["txn_consumed"] != row["block_consumed"]:
        valid = False
        block = index
        break

### OUTPUT ###
print(df, "\n\nNrg Usage Correct:", valid, "@Block", block)

### EXPORT ###
last = dft["real_timestamp"].max()
#df.to_csv('nrg_usage (' + export + ') ' + last + '.csv')
cnx.close()
