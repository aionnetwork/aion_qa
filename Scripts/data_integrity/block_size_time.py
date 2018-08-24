import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
from selenium import webdriver
pd.set_option('max_colwidth', 5000)

### PARAMETERS ###
view = "mainnet"
#view = "testnet"

user = ""
pswrd = ""
host = ""

if view == "mainnet":
    print("\nMainnet Kilimanjaro")
    temp1 = "mainnet"
    temp2 = 64
    temp3 = 32
    db = "aionv3"
else:
    print("\nTestnet Conquest")
    temp1 = "conquest"
    temp2 = 128
    temp3 = 128
    db = "aionv3_conquest"

cnx = sql.connect(user=user, password=pswrd, host=host, database=db)

### DASHBOARD ###
browser = webdriver.Firefox()
browser.get("https://" + temp1 + ".aion.network/#/dashboard")
time.sleep(1)
values = browser.find_elements_by_class_name("value")
blocks = browser.find_elements_by_class_name("title")

### DATABASE ###
query1 = "block_number, " \
         "block_time, " \
         "size, " \
         "difficulty, " \
         "nrg_consumed, " \
         "nrg_limit, " \
         "num_transactions, " \
         "block_timestamp, " \
         "real_timestamp"

df = pd.read_sql("SELECT " + query1 + " FROM block ORDER BY block_number DESC LIMIT " + str(temp2), cnx)
avg_size64b = df["size"].mean()
avg_time64b = df["block_time"].mean()
last = df.loc[df['block_number'].idxmax()]
last_diff = last["difficulty"]

df2 = df.nlargest(temp3, columns='block_number').set_index('block_number')
avg_time = df2["block_time"].mean()
avg_diff = df2["difficulty"].mean()
avg_nrgc = df2["nrg_consumed"].mean()
avg_nrgl = df2["nrg_limit"].mean()
total_tx = df2["num_transactions"].sum()
eTime32b = df2["block_timestamp"].max()
sTime32b = df2["block_timestamp"].min()
tTime32b = eTime32b - sTime32b

eTime24h = time.time()
sTime24h = eTime24h - 86400

query2 = "block_number, " \
         "num_transactions, " \
         "block_timestamp"

df3 = pd.read_sql("SELECT " + query2 + " FROM block WHERE block_timestamp > " + str(sTime24h) + " ORDER BY block_number DESC", cnx)
total_tx24h = df3["num_transactions"].sum()
tx_block24h = df3["num_transactions"].max()

hash_rate = last_diff / avg_time
txn_second = total_tx / tTime32b

### OUTPUT ###
print("Data Integrity Check @", datetime.now())

print("\n1. Database          ", df['block_number'].max(), "(current)")
#print("Average Block Size:  ", avg_size64b, "bytes")
print("Average Block Time:  ", avg_time64b, "seconds")
print("Network Hash Rate:   ", hash_rate, "Sol/s")
print("Average Difficulty   ", avg_diff)
print("Nrg Consumed / Block:", avg_nrgc, "NRG")
print("NRG Limit / Block:   ", avg_nrgl, "NRG")
print("Txn / Second:        ", txn_second)
print("Peak Txn / Block:    ", tx_block24h, "(24Hr)")
print("Txn Count:           ", total_tx24h, "(24Hr)")

print("\n2. Dashboard         ", blocks[23].text, "(current)")
print("Average Block Time:  ", values[1].text, "seconds")
print("Network Hash Rate:   ", values[2].text, "Sol/s")
print("Average Difficulty:  ", values[3].text)
print("Nrg Consumed / Block:", values[5].text, "NRG")
print("Nrg Limit / Block:   ", values[6].text, "NRG")
print("Txn / Second:        ", values[7].text)
print("Peak Txn / Block:    ", values[8].text, "(24Hr)")
print("Txn Count:           ", values[9].text, "(24Hr)")

cnx.close()
browser.close()

# https://medium.freecodecamp.org/how-to-scrape-websites-with-python-and-beautifulsoup-5946935d93fe
# https://datapatterns.readthedocs.io/en/latest/recipes/scraping-beyond-the-basics.html#dealing-with-javascript
# http://selenium-python.readthedocs.io/locating-elements.html
