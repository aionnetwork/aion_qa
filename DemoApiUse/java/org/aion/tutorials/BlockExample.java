package org.aion.tutorials;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.api.type.Block;
import org.aion.api.type.BlockDetails;
import org.aion.base.type.Hash256;

public class BlockExample {

    public static void main(String[] args) {

        // connect to Java API
        IAionAPI api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(IAionAPI.LOCALHOST_URL);

        // failed connection
        if (apiMsg.isError()) {
            System.out.format("Could not connect due to <%s>%n", apiMsg.getErrString());
            System.exit(-1);
        }

        // 1. eth_blockNumber

        // get block number from API
        long blockNumber = api.getChain().blockNumber().getObject();

        // print block number
        System.out.format("current block = %d%n", blockNumber);

        // 2. eth_getBlockByHash

        // specify hash
        Hash256 hash = Hash256.wrap("0x50a906f4ccaf05a3ebca69cc4f84a116e6aec881e3c4d080c4df505fea65afab");

        // get block with given hash
        Block block = api.getChain().getBlockByHash(hash).getObject();

        // print block information
        System.out.format("%nblock with transaction hashes:%n%s%n", block.toString());

        // get block details with given hash
        // with full transaction information
        BlockDetails details = api.getAdmin().getBlockDetailsByHash(hash).getObject();

        // print block information
        System.out.format("%nblock with transaction information:%n%s%n", details.toString());

        // 3. eth_getBlockByNumber

        // specify number
        long number = 247726;

        // get main chain block with given number
        block = api.getChain().getBlockByNumber(number).getObject();

        // print block information
        System.out.format("%nblock with transaction hashes:%n%s%n", block.toString());

        // get main chain block with given number
        // with full transaction information
        details = api.getAdmin().getBlockDetailsByNumber(number).getObject();

        // print block information
        System.out.format("%nblock with transaction information:%n%s%n", details.toString());

        // 4. eth_getBlockTransactionCountByHash

        // get tx count given hash
        int txCount = api.getChain().getBlockTransactionCountByHash(hash).getObject();

        // print information
        System.out.format("%n%d transactions in block %s%n", txCount, hash.toString());

        // 5. eth_getBlockTransactionCountByNumber

        // get tx count given block number
        txCount = api.getChain().getBlockTransactionCountByNumber(number).getObject();

        // print information
        System.out.format("%n%d transactions in block #%s%n", txCount, number);

        // disconnect from api
        api.destroyApi();

        System.exit(0);
    }
}
