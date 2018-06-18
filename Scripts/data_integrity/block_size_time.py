import pandas as pd
import mysql.connector as sql
import urllib3
from bs4 import BeautifulSoup

print("Data Integrity Testing:")

user = "powerbi"
pswrd = "rhsmmd7XPPoWCOOY"
host = "104.215.122.28"
db = "aionv3"
cnx = sql.connect(user=user, password=pswrd, host=host, database=db)
# print(cnx)

db_df = pd.read_sql("SELECT block_number, block_time, block_timestamp, real_timestamp, size FROM block ORDER BY block_number DESC LIMIT 64;", cnx).set_index("block_number")
print(db_df)

avg_size = db_df["size"].mean()
avg_time = db_df["block_time"].mean()

print("Average Block Size: ", avg_size, "bytes")
print("Average Block Time: ", avg_time, "seconds")

#import requests

#pd.set_option('display.max_colwidth', -1)
#pd.set_option('display.max_columns', 500)
#pd.set_option('display.width', 1000)

#url = 'http://mainnet.aion.network/#/dashboard'

#header = {
#  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36",
#  "X-Requested-With": "XMLHttpRequest"
#}

#r = requests.get(url, headers=header)
#dfs = pd.read_html(r.text)
#print(dfs)