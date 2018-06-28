#!/bin/bash

# Please ammend log file path as appropriate
#file=../../../log/aionCurrentLog.dat
file=../testfile

echo 'Which peers sync to blocks:'
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

temp='EXIST IMPORTED_BEST NOT_IN_RANGE NO_PARENT'
type=($temp)

for ((i=0; i<${#id[@]}; ++i)); do 
 
  echo "##### ${id[i]} #####"

  for ((n=0; n<${#type[@]}; ++n)); do

    echo $n: ${type[n]}
    block=$(egrep -a -o "node = ${id[i]}.*result = ${type[n]}" $file | rev | cut -d "," -f3 | rev | cut -c 11-)
    temp=$(echo $block | rev | cut -d" " -f1-50 | rev)
    #echo "~Only showing last 50 blocks"
    echo $temp

    count=$(echo $block | grep -o " " | wc -l)
    if [ ! -z "$block" ]; then 
      ((count++))
    fi
    echo "[ total: $count ]"

    echo

  done
  echo

done

# Check imported best blocks and its incoming peers
# If imported best: Node / Hash / Number
