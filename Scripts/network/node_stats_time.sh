#!/bin/bash

#file=aion.2018-06-19.0.log
file=../testfile
skip=10
let "statusSkip=$skip/10"
echo status skip: $statusSkip

# Find all 'peer id'
temp=$(egrep -a -o 'active node\-id\=[a-z0-9]{0,6}' $file | cut -d "=" -f2)
id=($temp)

# Find all the 'p2p status timestamp'
temp=$(egrep -a 'DEBUG P2P  \[p2p\-ts\]\: recv queue\[[0-9]{1}\] send queue\[[0-9]{1}\]' $file | cut -d" " -f2 | cut -d"." -f1 | uniq)
time=($temp) 

# Find all the 'p2p lines'
temp=$(egrep -n "DEBUG P2P  \[p2p\-ts\]\: recv queue\[[0-9]{1}\] send queue\[[0-9]{1}\]" $file | cut -d":" -f1)
status=($temp)

# Show all the 'p2p status lines'
#for ((c=0; c<${#status[@]}; ++c)); do
  #echo "status: ${status[$c]}"
#done
echo

# For each 'peer' [i]
for ((i=0; i<${#id[@]}; ++i)); do

  echo "##### ${id[i]} #####"
  #echo

  # Lines it appears on p2p-status
  temp=$(egrep -a -n "id:${id[i]}[0-9a-z]{0,6}" $file | cut -d ':' -f1)
  #echo "lines: $temp"
  line=($temp)

  # Number of lines
  count=$(echo $temp | grep -o ' ' | wc -l)
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
    syncs=$(egrep -n ".*id:${id[i]}[0-9a-z]{0,6}" $file | egrep "${line[$index]}:id" | cut -d":" -f2-)
    echo $syncs

    # Zombie lines
    block=$(egrep -n ".*id:${id[i]}[0-9a-z]{0,6}" $file | egrep "${line[$index]}:id" | cut -d":" -f2- | cut -c -40 | rev | cut -d ' ' -f2 | rev)
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
  currBlock=$(egrep -a "id:${id[i]}.*" $file | cut -c -39 | tail -1 | rev | cut -d ' ' -f1 | rev)
  echo "	$currBlock"
  echo
  echo

done
