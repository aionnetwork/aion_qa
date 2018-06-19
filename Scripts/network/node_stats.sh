#!/bin/bash

# Please ammend log file path as appropriate
file=../../../log/aionCurrentLog.dat
#file=testfile

# Please ammend p2p line seperation as appropriate
skip=200

echo "Node stuck blocks:"
echo

echo '## ACTIVE NODES ID ##'
# active node-id=c33d10
temp=$(egrep -a -o 'active node\-id\=[a-z0-9]{0,6}' $file | cut -d "=" -f2)
id=($temp)

count=$(echo $temp | grep -o ' ' | wc -l)
((count++))
echo 'Nodes:' $temp '['$count']'
echo
echo

for ((i=0; i<${#id[@]}; ++i)); do

  echo "##### ${id[i]} #####"
  echo

  temp=$(egrep -a -o -n "id:${id[i]}" $file | cut -d ':' -f1)
  echo lines: $temp
  line=($temp)
  echo
   
  # All p2p statuses 
  compare=${line[0]} 
  for ((l=0; l<${#line[@]}; ++l)); do
    if [ ${line[l]} -ge $compare ]; then
      egrep -a -n "id:${id[i]}.*" $file | egrep -a "${line[l]}:id:${id[i]}.*" | cut -d ':' -f2-
      compare=${line[l]}
      ((compare=compare+skip))
    fi
  done
  echo

  # All duplicated
  lineCompare=${line[0]}
  blockCompare=0
  zIndex=-1
  zCount=1
  for ((l=0; l<${#line[@]}; ++l)); do
    if [ ${line[l]} -ge $lineCompare ]; then

	# Block number from P2P status
      temp=$(egrep -a -n "id:${id[i]}.*" $file | egrep -a "${line[l]}:id:${id[i]}.*" | cut -d ':' -f2- | cut -c -40 | rev | cut -d ' ' -f2 | rev) #| uniq -cd)

	# Compare with previous block
      if [ $temp -eq $blockCompare ]; then
	((zCount++))
      else
	((zIndex++))
	zCount=1
      fi

      blocks[$zIndex]=$temp
      count[$zIndex]=$zCount
      blockCompare=$temp
      lineCompare=${line[l]}
      ((lineCompare=lineCompare+skip))

    fi
  done
  echo 0: ZOMBIES
  for ((x=0; x<${#blocks[@]}; ++x)); do
    if [ ${count[x]} -ne 1 ]; then    
      echo "${count[x]}	${blocks[x]}"
    fi
  done
  echo

  # Last block number
  echo 1: CURRENT
  currBlock=$(egrep -a "id:${id[i]}.*" $file | cut -c -39 | tail -1 | rev | cut -d ' ' -f1 | rev)
  echo "	$currBlock"
  echo

  echo
done

# Classification: Zombie / Half-Synced / Full Synced
# Zombie: Check if correct block # w/in x time - Target node changes or gets stuck?
# Known issue: if local database erased and resynced in the same log file
