import time
from datetime import datetime
import pandas as pd
import mysql.connector as sql
pd.set_option('max_colwidth', 5000)
pd.set_option('display.max_columns', 10)

### PARAMETERS ###
user = "powerbi"
pswrd = "rhsmmd7XPPoWCOOY"
host = "104.215.122.28"
db = "aionv3"

cnx = sql.connect(user=user, password=pswrd, host=host, database=db)

### DATABASE ###
query = "id, " \
        "block_number, " \
        "nrg_consumed, " \
        "nrg_price, " \
        "transaction_timestamp" \

dft = pd.read_sql("SELECT " + query + " FROM transaction ORDER BY transaction_timestamp DESC LIMIT 1000", cnx).set_index("id")

dfr = pd.read_csv('block_rewards.csv')
dfr.columns = ['block_number', 'miner_reward']
dfr = dfr.set_index('block_number')
dfr['miner_reward'] = 10**-18 * dfr['miner_reward']