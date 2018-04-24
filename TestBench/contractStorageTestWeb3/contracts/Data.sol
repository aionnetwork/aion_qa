pragma solidity ^0.4.10;

contract Data {

    mapping(uint => address) public countMap;
    mapping(uint => Data) public dataMap;
    mapping(uint => Data) public dataMap2;
    mapping(uint => Data) public dataMap3;
    uint[] public countArray;
    Data[] public dataArray;
    Data[] public dataArray2;
    Data[] public dataArray3;
    uint public lastNumber;

    struct Data {
        uint id;
        string property1;
        string property2;
        string property3;
        string property4;
        string property5;
    }

    event DataAdded(uint _i);

    function testStorage(uint i, string property, uint8 iteration) {
        countMap[i] = msg.sender;
        var data = Data(i, property, property, property, property, property);

        dataMap[i] = data;
        dataMap2[i] = data;
        dataMap3[i] = data;
        countArray.push(i);

        for (uint8 m = 0; m < iteration; m++) {
            dataArray.push(data);
            dataArray2.push(data);
            dataArray3.push(data);
        }

        lastNumber = i;
        DataAdded(i);
    }

    function getLastNumber() constant returns (uint){
        return lastNumber;
    }
}