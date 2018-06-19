import pandas as pd
import mysql.connector as sql
from selenium import webdriver
import time
from datetime import datetime

user = "powerbi"
pswrd = "rhsmmd7XPPoWCOOY"
host = "104.215.122.28"
db = "aionv3"
cnx = sql.connect(user=user, password=pswrd, host=host, database=db)
df = pd.read_sql("SELECT block_number, block_time, block_timestamp, real_timestamp, size FROM block ORDER BY block_number DESC LIMIT 64;", cnx).set_index("block_number")
avg_size = df["size"].mean()
avg_time = df["block_time"].mean()

browser = webdriver.Firefox()
browser.get("https://mainnet.aion.network/#/dashboard")
time.sleep(1)
values = [];
values = browser.find_elements_by_class_name("value")

print("\nData Integrity [", datetime.now(), "]\n")
print("Average Block Size:  ", avg_size, "bytes")
print("Average Block Time:  ", avg_time, "seconds\n")
print("Network Hash Rate:   ", values[2].text, "Sol/s")
print("Average Difficulty:  ", values[3].text)
print("Block Reward:        ", values[4].text, "AIONs")
print("Txn / Second:        ", values[7].text)
print("Peak Txn / Second:   ", values[8].text, "(24Hr)")
print("Txn Count:           ", values[9].text, "(24Hr)")

browser.close()

# from urllib.request import Request, urlopen
# from bs4 import BeautifulSoup

### DATABASE QUERY ###

# print(df)

### MAINNET SCRAPER ###
# Using Selenium for headless web browser
# https://datapatterns.readthedocs.io/en/latest/recipes/scraping-beyond-the-basics.html#dealing-with-javascript
# http://selenium-python.readthedocs.io/locating-elements.html

# Using BS4 to parse page source
# html = browser.page_source
# soup = BeautifulSoup(html, "xml")
# print(soup.prettify())
# https://medium.freecodecamp.org/how-to-scrape-websites-with-python-and-beautifulsoup-5946935d93fe

### OUTPUT VALUES ###