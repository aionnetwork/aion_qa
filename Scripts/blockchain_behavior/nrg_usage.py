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
    eTime = time.time()
    sTime = eTime - (numHours * 3600)
    filter = "WHERE block_timestamp >= " + str(sTime)
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
query = "block_number, " \
        "nrg_consumed"

dft = pd.read_sql("SELECT " + query + " FROM transaction " + filter + " WHERE nrg_consumed != 0 ORDER BY transaction_timestamp DESC", cnx)
dft = dft.groupby("block_number")["nrg_consumed"].sum().to_frame()
dft.columns = ["txn_consumed"]

dfb = pd.read_sql("SELECT " + query + " FROM block " + filter + " WHERE nrg_consumed != 0 ORDER BY block_timestamp DESC", cnx).set_index("block_number")
dfb.columns = ["block_consumed"]
df = dft.join(dfb)

block = df.index.max()
valid = True
for index, row in df.iterrows():
    if row["txn_consumed"] != row["block_consumed"]:
        valid = False
        block = index
        break

### OUTPUT ###
print(df)
print("\nNrg Usage Correct:", valid, "@Block", block)

cnx.close()