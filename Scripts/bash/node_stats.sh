#!/bin/bash

# Please ammend log file path as appropriate
file=../log/aionCurrentLog.dat
#file=testfile

# Please ammend p2p line seperation as appropriate
skip=200

echo "Node stuck blocks:"
echo

# Classification: Zombie / Half-Synced / Full Synced
# Zombie: Check if correct block # w/in x time - Target node changes or gets stuck?
# Known issue: if local database erased and resynced in the same log file

echo '## ACTIVE NODES ID ##'
temp=$(egrep -a -o 'active node\-id\=[a-z0-9]{0,6}' $file | cut -d "=" -f2)
id=($temp)
# active node-id=c33d10 ip=13.92.155.115

count=$(echo $temp | grep -o ' ' | wc -l)
((count++))
echo 'Nodes:' $temp '['$count']'
echo
echo

# If duplicate block exist; peer stuck importing the same block
for ((i=0; i<${#id[@]}; ++i)); do

  #egrep -a "node = ${id[i]}.*result = IMPORTED_BEST" $file | rev | cut -d ',' -f4 | rev | uniq -cd
	#| rev | cut -d ',' -f3 | rev | uniq -cd

  # Node id header
  echo "##### ${id[i]} #####"
  echo

  temp=$(egrep -a -o -n "id:${id[i]}" $file | cut -d ':' -f1)
  echo lines: $temp
  line=($temp)
  echo
   
  # All the p2p statuses 
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

	### BLOCK NUMBER ###
      temp=$(egrep -a -n "id:${id[i]}.*" $file | egrep -a "${line[l]}:id:${id[i]}.*" | cut -d ':' -f2- | cut -c -40 | rev | cut -d ' ' -f2 | rev) #| uniq -cd)

	### IF SAME BLOCK ###
      if [ $temp -eq $blockCompare ]; then
	((zCount++))

	### IF NOT SAME BLOCK ###
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
