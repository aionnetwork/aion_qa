import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)
pd.set_option('display.max_columns', 10)

### PARAMETERS ###
view = "time"
#view = "block"
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

### DATABASE ###
query = "block_number, " \
        "block_timestamp"

dft = pd.read_sql("SELECT " + query + " FROM block " + filter + " ORDER BY block_number DESC LIMIT 1000", cnx)

if view == "block":
    eTime = dft["block_timestamp"].max()
    sTime = dft["block_timestamp"].min()

interval = ( eTime - sTime ) / 10
compare = int(eTime)
count = 0

dfo = pd.DataFrame(columns=['Interval', 'Block', 'Time'])

for i in range(0, int(interval)):
    current = int(eTime - ((i+1)*10))
    for index, row in dft.iterrows():
        if current <= row["block_timestamp"] and row["block_timestamp"] < compare:
            series = pd.Series([i, row["block_number"], row["block_timestamp"]], index=['Interval', 'Block', 'Time'])
            dfo = dfo.append(series, ignore_index=True)

    compare = current

dfo = dfo.groupby('Interval')['Block'].apply(lambda x: ','.join(x.astype(str)))
print(dfo)

### EXPORT ###
last = dft["block_timestamp"].max()
#dfo.to_csv('block_rate (' + export + ') ' + datetime.fromtimestamp(int(last)).strftime('%Y-%m-%d %H:%M:%S') + '.csv')
cnx.close()
