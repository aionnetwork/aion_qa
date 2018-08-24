import sys
import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
import subprocess
pd.set_option('max_colwidth', 5000)
pd.set_option('display.max_columns', 10)
pd.options.display.float_format = '{:15}'.format

### PARAMETERS ###
user = ""
pswrd = ""
host = ""
db = ""

if len(sys.argv) == 1:
    numBlocks = 10
else:
    numBlocks = int(sys.argv[1])

cnx = sql.connect(user=user, password=pswrd, host=host, database=db)

### SYNCED ###
# Assigning shell outputs
result = subprocess.run(['./blocks.sh', str(numBlocks)], stdout=subprocess.PIPE)
output = result.stdout.decode('utf-8').split()

blocks = [0] * numBlocks
synced = [0] * numBlocks
count1 = count2 = count3 = 0
for i in output:
    if count1 % 3 == 0:
        blocks[count2] = output[count1 + 2]
        synced[count2] = output[count1] + " " + output[count1 + 1]
        count2 = count2 + 1
    count1 = count1 + 1
blocks.reverse()
synced.reverse()
sBlock = blocks[0]
eBlock = blocks[-1]

### MINED ###
query = "real_timestamp, " \
        "block_number"

dfb = pd.read_sql("SELECT " + query + " FROM block WHERE block_number BETWEEN " + str(eBlock) + " AND " + str(sBlock) + " ORDER BY block_number DESC", cnx)
mined = dfb["real_timestamp"].values
chain = dfb["block_number"].values

ts1 = [0] * numBlocks
ts2 = [0] * numBlocks
for i in mined:
    synced[count3] = "20" + synced[count3][0:-4]
    ts1[count3] = time.mktime(datetime.strptime(mined[count3], "%Y-%m-%d %H:%M:%S").timetuple())
    ts2[count3] = time.mktime(datetime.strptime(synced[count3], "%Y-%m-%d %H:%M:%S").timetuple())
    mined[count3] = mined[count3][11:]
    synced[count3] = synced[count3][11:]
    count3 = count3 + 1

### OUTPUT ###
d = {'blocks': blocks,
     'synced': synced,
     'mined': mined,
     'chain': chain,
     'ts1': ts1,
     'ts2': ts2}
df = pd.DataFrame(data=d).set_index("blocks")
df["latency"] = df["ts2"] - df["ts1"]
df = df[["mined", "ts1", "synced", "ts2", "latency"]]
print(df, "\n\nAverage Latency (Last", numBlocks, "Blocks):", df["latency"].mean())

### EXPORT ###
last = df["ts2"].max()
#df.to_csv('block_latency (last ' + str(numBlocks) + ' blocks) ' + datetime.fromtimestamp(int(last)).strftime('%Y-%m-%d %H:%M:%S') + '.csv')
cnx.close()
