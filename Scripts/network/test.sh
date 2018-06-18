#!/bin/bash

#egrep -a -o ' *[0-9]{2,3}\.[0-9]{2,3}\.[0-9]{0,3}\.[0-9]{0,3}.*[0-9]{1}\.[0-9]{1}\.[0-9]{1}\.[a-z0-9]{0,10}' testfile

# egrep -a -o '[a-z0-9]{64}.*[0-9]{1}\.[0-9]{1}\.[0-9]{1}\.[a-z0-9]{0,10}' testfile

# pcregrep -M '\-{164}_\n_' testfile

# egrep -a -o 'node = [a-z0-9]{0,6}.*number = [0-9]{0,6}' testfile

#zombies=$(

#    awk -F= "$2 > $line" $file 
#echo $zombies


file=testfile
line=$(egrep -a -o -n "id:c33d10" $file | cut -d ':' -f1)
echo $line
array=($line)
echo ${array[0]}
echo

compare=${array[i]}
for ((i=0; i<${#array[@]}; ++i)); do
  echo start: $compare

  if [ ${array[i]} -ge $compare ]; then
    egrep -a -n 'id:c33d10' $file | egrep -a -o "${array[i]}:id:c33d10"
    ((compare=compare+20))
  fi

  echo end: $compare
  echo
  echo
  
done

#line=100
#grep -a -o -n "id:${id[i]}" $file | cut -d ':' -f1 | awk "$line"' < $1  {print ;}' | more


### TEMP HOLD ###
for ((i=0; i<${#id[@]}; ++i)); do

  #egrep -a "node = ${id[i]}.*result = IMPORTED_BEST" $file | rev | cut -d ',' -f4 | rev | uniq -cd
	#| rev | cut -d ',' -f3 | rev | uniq -cd

    # All the p2p-status
    echo "##### ${id[i]} #####"
    egrep -a "id:${id[i]}.*" $file
    echo

    # All duplicated
    echo 0: ZOMBIES
    egrep -a "id:${id[i]}.*" $file | cut -c -40 | rev | cut -d ' ' -f2 | rev | uniq -cd
    echo

  # Last block number
  echo 1: CURRENT
  currBlock=$(egrep -a "id:${id[i]}.*" $file | cut -c -39 | tail -1 | rev | cut -d ' ' -f1 | rev)
  echo "	$currBlock"
  echo

  echo
done

#####

#file=testfile
#line=$(egrep -a -o -n "id:c33d10" $file | cut -d ':' -f1)
#echo $line
#array=($line)
#echo ${array[0]}
#echo

#compare=${array[i]}
#for ((i=0; i<${#array[@]}; ++i)); do
#  echo start: $compare

#  if [ ${array[i]} -ge $compare ]; then
#    egrep -a -n 'id:c33d10' $file | egrep -a -o "${array[i]}:id:c33d10"
#    ((compare=compare+20))
#  fi

#  echo end: $compare
#  echo
#  echo
  
#done
