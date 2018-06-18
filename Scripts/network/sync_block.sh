#!/bin/bash


# Please ammend log file path as appropriate
file=../../../log/aionCurrentLog.dat
#file=testfile

echo 'Which peers sync to blocks:'
echo

# Check imported best blocks and its incoming peers
# If imported best: Node / Hash / Number

echo '## ACTIVE NODES ID ##'
temp=$(egrep -a -o 'active node\-id\=[a-z0-9]{0,6}' $file | cut -d "=" -f2)
id=($temp)
# active node-id=c33d10 ip=13.92.155.115

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
    echo $block

    count=$(echo $block | grep -o ' ' | wc -l)
    echo "[ total: $count ]"

    echo

  done
  echo

done
