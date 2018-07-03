#!/bin/bash

#file=../testfile
file=../../../log/aionCurrentLog.dat
seconds=500	  # 10 second increments

# Define the status skips
let "statusSkip=$seconds/10"
echo status skip: $statusSkip

# Find all 'peer id'
temp=$(egrep -a -o "active node\-id\=[a-z0-9]{0,6}" $file | cut -d "=" -f2)
id=($temp)

# Find all the 'p2p status timestamp'
temp=$(egrep -a "DEBUG P2P  \[p2p\-ts\]\: recv queue\[[0-9]{1}\] send queue\[[0-9]{1}\]" $file | cut -d" " -f2 | cut -d"." -f1 | uniq)
time=($temp) 

# Find all the 'p2p lines'
temp=$(egrep -n "DEBUG P2P  \[p2p\-ts\]\: recv queue\[[0-9]{1}\] send queue\[[0-9]{1}\]" $file | cut -d":" -f1)
status=($temp)

# Show all the 'p2p status lines'
#for ((c=0; c<${#status[@]}; ++c)); do
  #echo "status: ${status[$c]}"
#done
echo

mainnet=0
testnet=0

# For each 'peer' [i]
for ((i=0; i<${#id[@]}; ++i)); do

  echo "##### ${id[i]} #####"
  #echo

  # Lines it appears on p2p-status
  temp=$(egrep -a -n "id:${id[i]}[0-9a-z]{0,6}" $file | cut -d ':' -f1)
  #echo "lines: $temp"
  line=($temp)

  # Number of lines
  count=$(echo $temp | grep -o " " | wc -l)
  ((count++))
  #echo "count: $count"


  #echo 0: PSTATUS

  # First p2p status
  enter=${line[0]}
  for ((n=0; n<${#status[@]}; ++n)); do
    if [[ $enter -gt ${status[n]} ]]; then
      let "start=$n+1"
    fi
  done

  # Outputs the relevant p2p sync lines 
  index=0
  blockCompare=0
  zIndex=-1
  zCount=1
  while [[ $index -lt $count ]]; do

    # P2P lines
    syncs=$(egrep -n ".*id:${id[i]}[0-9a-z]{0,6}" $file | egrep "^${line[$index]}:id" | cut -d":" -f2-)
    echo $syncs

    # Zombie lines
    block=$(egrep -n ".*id:${id[i]}[0-9a-z]{0,6}" $file | egrep "^${line[$index]}:id" | cut -d":" -f2- | cut -c -40 | rev | cut -d" " -f2 | rev)
    if [[ $blockCompare -eq $block ]]; then
      ((zCount++))
    else
      ((zIndex++))
      zCount=1
    fi
    zombie[$zIndex]=$block
    duplicate[$zIndex]=$zCount
    blockCompare=$block
    ((index=index+statusSkip))

  done
  echo


  echo 0: ZOMBIES
  for ((z=0; z<$zIndex+1; ++z)); do
    if [ ${duplicate[z]} -ne 1 ]; then    
      echo "[${duplicate[z]}]	${zombie[z]}"
    fi
  done
  echo


  echo 1: CURRENT
  currBlock=$(egrep -a "id:${id[i]}.*" $file | cut -c -39 | tail -1 | rev | cut -d" " -f1 | rev)

  # Stores mainnet and testnet best block
  if [ $currBlock -ge $mainnet ]; then
    mainnet=$currBlock
  elif [ $currBlock -lt $((mainnet-100000)) ]; then
    testnet=$currBlock
  fi
  curr[$i]=$currBlock

  echo "	$currBlock"
  echo
  echo

done

#echo "Mainnet Best Block: $mainnet"
#echo "Testnet Best Block: $testnet"
#echo

count=0
echo "Fully-Synced:"
for ((i=0; i<${#id[@]}; ++i)); do
  if [ ${curr[i]} -eq $mainnet ]; then
    echo ${id[i]} @ ${curr[i]}
    ((count++))
  fi
done
echo "[ total: $count ]"
echo

count=0
echo "Half-Synced:"
for ((i=0; i<${#id[@]}; ++i)); do
  if [ ${curr[i]} -lt $mainnet ] && [ ${curr[i]} -gt $((mainnet-100000)) ] ; then
    echo ${id[i]} @ ${curr[i]}
    ((count++))
  fi
done
echo "[ total: $count ]"
echo

count=0
echo "Testnet:"
for ((i=0; i<${#id[@]}; ++i)); do
  if [ ${curr[i]} -lt $((mainnet-100000)) ] ; then
    echo ${id[i]} @ ${curr[i]}
    ((count++))
  fi
done
echo "[ total: $count ]"
echo
